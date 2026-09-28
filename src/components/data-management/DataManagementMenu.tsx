"use client";

import { useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { authorizeContractImport, getDataActions, hasAnyDataAction } from "@/auth/permissions";
import { useCurrentUser } from "@/auth/user-context";
import { useDismissable } from "@/components/common/use-dismissable";
import { ConfirmResetDialog } from "@/components/data-management/ConfirmResetDialog";
import { GenerateDataDialog } from "@/components/data-management/GenerateDataDialog";
import { ImportDeniedDialog } from "@/components/data-management/ImportDeniedDialog";
import { ImportErrorsDialog } from "@/components/data-management/ImportErrorsDialog";
import { ImportSummaryDialog } from "@/components/data-management/ImportSummaryDialog";
import { DatabaseIcon, DownloadIcon, FileIcon, RestoreIcon, SparkIcon, UploadIcon } from "@/components/icons";
import type { Contract } from "@/domain/contract";
import { replaceContractsBySector } from "@/features/contract-data/apply-contract-dataset";
import type { ContractImportResult, ImportOptions, RecordIssue } from "@/features/contract-data/contract-import.types";
import { createContractTemplate, downloadJsonFile, exportFileName, serializeContracts } from "@/features/contract-data/export-contracts";
import { generateSyntheticContracts } from "@/features/contract-data/generate-synthetic-contracts";
import { importContractsFromFile, importGeneratedContracts } from "@/features/contract-data/import-contracts";
import { useSectorContext } from "@/features/sectors/sector-context";
import { sectorName } from "@/lib/sectors";
import { getContractDatasetStore } from "@/repositories";
import type { DatasetInfo } from "@/repositories/contract-dataset-store";

export type NotifyTone = "success" | "info" | "error";

interface DataManagementMenuProps {
  /** Contratos atualmente carregados no dashboard (escopo do setor; usados na exportação). */
  contracts: Contract[];
  /** Chamado depois que o dataset do repositório foi substituído ou restaurado. */
  onDatasetChanged: () => Promise<void>;
  onNotify: (message: string, tone: NotifyTone) => void;
}

type ValidImport = Extract<ContractImportResult, { ok: true }>;

type DialogState =
  | { type: "summary"; result: ValidImport; label: string; kind: "import" | "generated" }
  | { type: "errors"; fileName: string; error: string; issues: RecordIssue[] }
  | { type: "denied"; fileName: string; sectorIds: string[] }
  | { type: "generate" }
  | { type: "reset" }
  | null;

const plural = (value: number) => `${value.toLocaleString("pt-BR")} ${value === 1 ? "contrato" : "contratos"}`;

function describeSource(info: DatasetInfo): string {
  if (info.kind === "default") return "Dados de demonstração";
  const when = info.savedAt ? new Date(info.savedAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "";
  return `${info.kind === "generated" ? "Gerado" : "Importado"}: ${info.label}${when ? ` • ${when}` : ""}`;
}

export function DataManagementMenu({ contracts, onDatasetChanged, onNotify }: DataManagementMenuProps) {
  const store = useMemo(() => getContractDatasetStore(), []);
  const { currentUser } = useCurrentUser();
  const { scope, selection, selectedSector, sectorsById } = useSectorContext();
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [busy, setBusy] = useState(false);
  const menuRef = useDismissable<HTMLDivElement>(open, () => setOpen(false));
  const fileRef = useRef<HTMLInputElement | null>(null);

  if (!store || !scope || !selection) return null;

  const sectorIds = scope.sectorIds;
  // Renderização guiada pela camada de autorização (não é só esconder via CSS).
  const actions = getDataActions(currentUser, sectorIds);
  if (!hasAnyDataAction(actions)) return null;
  const knownSectors = [...sectorsById.values()];
  const scopeLabel = selection.kind === "all" ? "todos os setores" : selectedSector?.name ?? "";
  const infos = sectorIds.map((id) => ({ id, info: store.getDatasetInfo(id) }));
  const localSectors = infos.filter((item) => item.info.kind !== "default");
  const isDefault = localSectors.length === 0;
  const sourceText = selection.kind === "sector"
    ? describeSource(infos[0]?.info ?? { kind: "default", label: "", savedAt: null })
    : isDefault ? "Dados de demonstração" : `${localSectors.length} de ${sectorIds.length} setores com dados locais`;
  const nameOf = (id: string) => sectorName(id, sectorsById);
  /** Dentro de um setor, tudo o que for importado/gerado vai para ele, independentemente do arquivo. */
  const targetSectorId = selection.kind === "sector" ? selection.sectorId : undefined;
  const importOptions: ImportOptions = { sectors: knownSectors, targetSectorId };

  const chooseFile = () => {
    setOpen(false);
    setDialog(null);
    fileRef.current?.click();
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const result = await importContractsFromFile(file, importOptions);
      if (result.ok) {
        const authorization = authorizeContractImport(currentUser, Object.keys(result.summary.bySector));
        if (!authorization.allowed) setDialog({ type: "denied", fileName: file.name, sectorIds: authorization.deniedSectorIds });
        else setDialog({ type: "summary", result, label: file.name, kind: "import" });
      } else setDialog({ type: "errors", fileName: file.name, error: result.error, issues: result.issues });
    } finally {
      setBusy(false);
    }
  };

  const applyDataset = async () => {
    if (dialog?.type !== "summary") return;
    const { result, label, kind } = dialog;
    // Revalida no momento de gravar: o usuário simulado pode ter mudado.
    const authorization = authorizeContractImport(currentUser, targetSectorId ? [targetSectorId] : result.contracts.map((contract) => contract.sectorId));
    if (!authorization.allowed) {
      setDialog({ type: "denied", fileName: label, sectorIds: authorization.deniedSectorIds });
      return;
    }
    setBusy(true);
    try {
      // A substituição acontece na camada de dados, sempre limitada ao(s) setor(es) de destino.
      const source = { kind, label };
      const { persisted, sectorIds: replaced } = targetSectorId
        ? { ...(await store.replaceSectorContracts(targetSectorId, result.contracts, source)), sectorIds: [targetSectorId] }
        : await replaceContractsBySector(store, result.contracts, source);
      setDialog(null);
      await onDatasetChanged();
      const where = replaced.map(nameOf).join(", ");
      if (persisted) {
        onNotify(`${plural(result.contracts.length)} ${kind === "generated" ? "gerados" : "importados"} com sucesso (${where}).`, "success");
      } else {
        onNotify("Dados carregados, mas o navegador não permitiu salvá-los. Eles serão perdidos ao recarregar a página.", "error");
      }
    } finally {
      setBusy(false);
    }
  };

  const cancelSummary = () => {
    if (busy) return;
    const kind = dialog?.type === "summary" ? dialog.kind : "import";
    setDialog(null);
    onNotify(kind === "generated" ? "Geração de dados cancelada." : "Importação cancelada. Os dados atuais foram mantidos.", "info");
  };

  const generate = (total: number) => {
    const result = importGeneratedContracts(generateSyntheticContracts(total, sectorIds), importOptions);
    if (result.ok) setDialog({ type: "summary", result, label: `${plural(total)} sintéticos`, kind: "generated" });
    else setDialog({ type: "errors", fileName: "Dados gerados", error: result.error, issues: result.issues });
  };

  const downloadTemplate = () => {
    setOpen(false);
    const templateSector = selection.kind === "sector" ? selection.sectorId : sectorIds[0];
    downloadJsonFile("modelo-contratos.json", serializeContracts(createContractTemplate(templateSector)));
    onNotify("Modelo JSON baixado: modelo-contratos.json", "success");
  };

  const exportCurrent = () => {
    setOpen(false);
    const fileName = exportFileName(selection.kind === "sector" ? selection.sectorId : "todos-os-setores");
    downloadJsonFile(fileName, serializeContracts(contracts));
    onNotify(`JSON exportado: ${fileName} (${plural(contracts.length)}).`, "success");
  };

  const confirmReset = async () => {
    setBusy(true);
    try {
      await store.resetSectorContracts(sectorIds);
      setDialog(null);
      await onDatasetChanged();
      onNotify(`Dados de demonstração restaurados (${scopeLabel}).`, "success");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="data-menu" ref={menuRef}>
      <button
        className={`header-pill-button ${open ? "is-open" : ""}`}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Gerenciar dados"
        disabled={busy}
      >
        <DatabaseIcon size={17} className={busy ? "pulse" : ""} />
        <span className="header-pill-label">{busy ? "Processando..." : "Dados"}</span>
      </button>

      {open && (
        <div className="popover-menu data-menu-list" role="menu" aria-label="Gerenciar dados">
          <div className="popover-source">
            <span>Fonte atual • {scopeLabel}</span>
            <strong title={sourceText}>{sourceText}</strong>
          </div>
          {actions.import && (
            <button type="button" role="menuitem" onClick={chooseFile}><UploadIcon size={15} /><span className="popover-item-label">Importar JSON</span></button>
          )}
          {actions.export && (
            <button type="button" role="menuitem" onClick={exportCurrent} disabled={!contracts.length}>
              <DownloadIcon size={15} /><span className="popover-item-label">{selection.kind === "all" ? "Exportar todos os setores" : "Exportar dados atuais"}</span>
            </button>
          )}
          {actions.downloadTemplate && (
            <button type="button" role="menuitem" onClick={downloadTemplate}><FileIcon size={15} /><span className="popover-item-label">Baixar modelo JSON</span></button>
          )}
          {actions.generate && (
            <button type="button" role="menuitem" onClick={() => { setOpen(false); setDialog({ type: "generate" }); }}>
              <SparkIcon size={15} /><span className="popover-item-label">Gerar dados sintéticos</span>
            </button>
          )}
          {actions.restore && <div className="popover-separator" role="separator" />}
          {actions.restore && <button
            type="button"
            role="menuitem"
            className="danger"
            disabled={isDefault}
            title={isDefault ? "Os dados de demonstração já estão em uso" : undefined}
            onClick={() => { setOpen(false); setDialog({ type: "reset" }); }}
          >
            <RestoreIcon size={15} /><span className="popover-item-label">{selection.kind === "all" ? "Restaurar todos os setores" : "Restaurar dados do setor"}</span>
          </button>}
        </div>
      )}

      <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={(event) => void handleFile(event)} />

      {dialog?.type === "summary" && (
        <ImportSummaryDialog
          source={dialog.label}
          generated={dialog.kind === "generated"}
          summary={dialog.result.summary}
          totalRecords={dialog.result.totalRecords}
          issues={dialog.result.issues}
          sectorName={nameOf}
          targetSectorName={targetSectorId ? nameOf(targetSectorId) : undefined}
          reassignedSectorCount={dialog.result.reassignedSectorCount}
          busy={busy}
          onConfirm={() => void applyDataset()}
          onCancel={cancelSummary}
        />
      )}
      {dialog?.type === "errors" && (
        <ImportErrorsDialog fileName={dialog.fileName} error={dialog.error} issues={dialog.issues} onRetry={chooseFile} onClose={() => setDialog(null)} />
      )}
      {dialog?.type === "denied" && (
        <ImportDeniedDialog fileName={dialog.fileName} sectorNames={dialog.sectorIds.map(nameOf)} onClose={() => setDialog(null)} />
      )}
      {dialog?.type === "generate" && (
        <GenerateDataDialog scopeLabel={scopeLabel} onGenerate={generate} onCancel={() => setDialog(null)} />
      )}
      {dialog?.type === "reset" && (
        <ConfirmResetDialog
          scopeLabel={scopeLabel}
          sources={localSectors.map((item) => `${nameOf(item.id)}: ${item.info.label}`)}
          busy={busy}
          onConfirm={() => void confirmReset()}
          onCancel={() => { if (!busy) setDialog(null); }}
        />
      )}
    </div>
  );
}
