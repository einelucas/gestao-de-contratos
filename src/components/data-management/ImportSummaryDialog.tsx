"use client";

import { DataDialog } from "@/components/data-management/DataDialog";
import { ImportIssuesList } from "@/components/data-management/ImportIssuesList";
import type { ContractDatasetSummary, RecordIssue } from "@/features/contract-data/contract-import.types";

interface ImportSummaryDialogProps {
  source: string;
  generated: boolean;
  summary: ContractDatasetSummary;
  totalRecords: number;
  issues: RecordIssue[];
  /** Resolve o nome exibido de um `sectorId`. */
  sectorName: (sectorId: string) => string;
  /** Importação dentro de um setor: todos os contratos vão para ele. */
  targetSectorName?: string;
  /** Registros cujo setor informado no arquivo foi ignorado. */
  reassignedSectorCount: number;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const number = (value: number) => value.toLocaleString("pt-BR");

export function ImportSummaryDialog({ source, generated, summary, totalRecords, issues, sectorName, targetSectorName, reassignedSectorCount, busy, onConfirm, onCancel }: ImportSummaryDialogProps) {
  const partial = issues.length > 0;
  const title = generated ? "Dados sintéticos gerados" : partial ? "Arquivo parcialmente válido" : "Arquivo válido";
  const situations = [
    { label: "Vigentes", value: summary.bySituation.Vigente, tone: "vigente" },
    { label: "Atenção (≤ 20 dias)", value: summary.attention, tone: "atencao" },
    { label: "Vencidos", value: summary.bySituation.Vencido, tone: "vencido" },
    { label: "Sem data", value: summary.bySituation["Sem data"], tone: "sem-data" },
    { label: "Finalizados", value: summary.bySituation.Finalizado, tone: "finalizado" },
  ];
  const sectors = Object.entries(summary.bySector)
    .map(([id, count]) => ({ id, name: sectorName(id), count }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  return (
    <DataDialog
      eyebrow={generated ? "Gerar dados" : "Importar JSON"}
      title={title}
      description={partial ? `${source} • ${number(summary.total)} de ${number(totalRecords)} registros podem ser importados.` : source}
      onClose={onCancel}
      footer={(
        <>
          <button type="button" className="control-button subtle" onClick={onCancel} disabled={busy}>Cancelar</button>
          <button type="button" className="control-button primary" onClick={onConfirm} disabled={busy}>
            {partial ? `Importar ${number(summary.total)} válidos` : "Usar estes dados"}
          </button>
        </>
      )}
    >
      <div className="import-stats">
        <div className="import-stat"><strong>{number(summary.total)}</strong><span>contratos</span></div>
        <div className="import-stat"><strong>{number(summary.units)}</strong><span>unidades</span></div>
        <div className="import-stat"><strong>{number(summary.suppliers)}</strong><span>fornecedores</span></div>
      </div>
      <ul className="import-situations">
        {situations.map((item) => (
          <li key={item.label}><span className={`import-dot dot-${item.tone}`} />{item.label}<strong>{number(item.value)}</strong></li>
        ))}
      </ul>
      {targetSectorName ? (
        <div className="import-target">
          <span>Setor de destino</span>
          <strong>{targetSectorName}</strong>
        </div>
      ) : (
        <div className="import-sectors">
          <strong>{sectors.length === 1 ? "Setor afetado" : `${sectors.length} setores afetados`}</strong>
          <ul className="import-sector-list">
            {sectors.map((sector) => <li key={sector.id}>{sector.name}<span>{number(sector.count)}</span></li>)}
          </ul>
        </div>
      )}
      {reassignedSectorCount > 0 && targetSectorName && (
        <p className="import-warning">
          {number(reassignedSectorCount)} {reassignedSectorCount === 1 ? "registro informava" : "registros informavam"} outro setor no arquivo.
          Dentro de um setor, o <code>sectorId</code> do arquivo é ignorado: todos serão importados em {targetSectorName}.
        </p>
      )}
      <ImportIssuesList issues={issues} />
      <p className="import-note">Os contratos atuais {sectors.length === 1 ? "deste setor serão substituídos" : "destes setores serão substituídos"}; os demais setores não mudam. Os dados ficam salvos apenas neste navegador.</p>
    </DataDialog>
  );
}
