"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { ConfirmResetDialog } from "@/components/data-management/ConfirmResetDialog";
import { GenerateDataDialog } from "@/components/data-management/GenerateDataDialog";
import { ImportErrorsDialog } from "@/components/data-management/ImportErrorsDialog";
import { ImportSummaryDialog } from "@/components/data-management/ImportSummaryDialog";
import { DatabaseIcon, DownloadIcon, FileIcon, RestoreIcon, SparkIcon, UploadIcon } from "@/components/icons";
import type { Contract } from "@/domain/contract";
import type { ContractImportResult, RecordIssue } from "@/features/contract-data/contract-import.types";
import { createContractTemplate, downloadJsonFile, exportFileName, serializeContracts } from "@/features/contract-data/export-contracts";
import { generateSyntheticContracts } from "@/features/contract-data/generate-synthetic-contracts";
import { importContractsFromFile, importGeneratedContracts } from "@/features/contract-data/import-contracts";
import { getContractDatasetStore } from "@/repositories";
import type { DatasetInfo } from "@/repositories/contract-dataset-store";

export type NotifyTone = "success" | "info" | "error";

interface DataManagementMenuProps {
  /** Dataset atualmente carregado no dashboard (usado na exportação). */
  contracts: Contract[];
  /** Chamado depois que o dataset do repositório foi substituído ou restaurado. */
  onDatasetChanged: () => Promise<void>;
  onNotify: (message: string, tone: NotifyTone) => void;
}

type ValidImport = Extract<ContractImportResult, { ok: true }>;

type DialogState =
  | { type: "summary"; result: ValidImport; label: string; kind: "import" | "generated" }
  | { type: "errors"; fileName: string; error: string; issues: RecordIssue[] }
  | { type: "generate" }
  | { type: "reset"; info: DatasetInfo }
  | null;

const plural = (value: number) => `${value.toLocaleString("pt-BR")} ${value === 1 ? "contrato" : "contratos"}`;

function describeSource(info: DatasetInfo | null): string {
  if (!info || info.kind === "default") return "Dados de demonstração";
  const when = info.savedAt ? new Date(info.savedAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "";
  return `${info.kind === "generated" ? "Gerado" : "Importado"}: ${info.label}${when ? ` • ${when}` : ""}`;
}

export function DataManagementMenu({ contracts, onDatasetChanged, onNotify }: DataManagementMenuProps) {
  const store = useMemo(() => getContractDatasetStore(), []);
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState<DatasetInfo | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [busy, setBusy] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!store) return null;

  const toggleMenu = () => {
    if (!open) setInfo(store.getDatasetInfo());
    setOpen((value) => !value);
  };

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
      const result = await importContractsFromFile(file);
      if (result.ok) setDialog({ type: "summary", result, label: file.name, kind: "import" });
      else setDialog({ type: "errors", fileName: file.name, error: result.error, issues: result.issues });
    } finally {
      setBusy(false);
    }
  };

  const applyDataset = async () => {
    if (dialog?.type !== "summary") return;
    const { result, label, kind } = dialog;
    setBusy(true);
    try {
      const { persisted } = await store.replaceDataset(result.contracts, { kind, label });
      setDialog(null);
      await onDatasetChanged();
      if (persisted) {
        onNotify(`${plural(result.contracts.length)} ${kind === "generated" ? "gerados" : "importados"} com sucesso.`, "success");
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
    const result = importGeneratedContracts(generateSyntheticContracts(total));
    if (result.ok) setDialog({ type: "summary", result, label: `${plural(total)} sintéticos`, kind: "generated" });
    else setDialog({ type: "errors", fileName: "Dados gerados", error: result.error, issues: result.issues });
  };

  const downloadTemplate = () => {
    setOpen(false);
    downloadJsonFile("modelo-contratos.json", serializeContracts(createContractTemplate()));
    onNotify("Modelo JSON baixado: modelo-contratos.json", "success");
  };

  const exportCurrent = () => {
    setOpen(false);
    const fileName = exportFileName();
    downloadJsonFile(fileName, serializeContracts(contracts));
    onNotify(`JSON exportado: ${fileName} (${plural(contracts.length)}).`, "success");
  };

  const confirmReset = async () => {
    setBusy(true);
    try {
      await store.resetDataset();
      setDialog(null);
      await onDatasetChanged();
      onNotify("Dados de demonstração restaurados.", "success");
    } finally {
      setBusy(false);
    }
  };

  const isDefault = info?.kind === "default";

  return (
    <div className="data-menu" ref={menuRef}>
      <button
        className={`data-menu-button ${open ? "is-open" : ""}`}
        type="button"
        onClick={toggleMenu}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Gerenciar dados"
        disabled={busy}
      >
        <DatabaseIcon size={17} className={busy ? "pulse" : ""} />
        <span>{busy ? "Processando..." : "Dados"}</span>
      </button>

      {open && (
        <div className="data-menu-list" role="menu" aria-label="Gerenciar dados">
          <div className="data-menu-source">
            <span>Fonte atual</span>
            <strong title={describeSource(info)}>{describeSource(info)}</strong>
          </div>
          <button type="button" role="menuitem" onClick={chooseFile}><UploadIcon size={15} />Importar JSON</button>
          <button type="button" role="menuitem" onClick={downloadTemplate}><FileIcon size={15} />Baixar modelo JSON</button>
          <button type="button" role="menuitem" onClick={exportCurrent} disabled={!contracts.length}><DownloadIcon size={15} />Exportar dados atuais</button>
          <button type="button" role="menuitem" onClick={() => { setOpen(false); setDialog({ type: "generate" }); }}><SparkIcon size={15} />Gerar dados sintéticos</button>
          <div className="data-menu-separator" role="separator" />
          <button
            type="button"
            role="menuitem"
            className="danger"
            disabled={isDefault}
            title={isDefault ? "Os dados de demonstração já estão em uso" : undefined}
            onClick={() => { setOpen(false); if (info) setDialog({ type: "reset", info }); }}
          >
            <RestoreIcon size={15} />Restaurar dados de demonstração
          </button>
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
          busy={busy}
          onConfirm={() => void applyDataset()}
          onCancel={cancelSummary}
        />
      )}
      {dialog?.type === "errors" && (
        <ImportErrorsDialog fileName={dialog.fileName} error={dialog.error} issues={dialog.issues} onRetry={chooseFile} onClose={() => setDialog(null)} />
      )}
      {dialog?.type === "generate" && (
        <GenerateDataDialog onGenerate={generate} onCancel={() => setDialog(null)} />
      )}
      {dialog?.type === "reset" && (
        <ConfirmResetDialog info={dialog.info} busy={busy} onConfirm={() => void confirmReset()} onCancel={() => { if (!busy) setDialog(null); }} />
      )}
    </div>
  );
}
