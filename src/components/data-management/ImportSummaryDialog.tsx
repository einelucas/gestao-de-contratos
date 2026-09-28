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
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const number = (value: number) => value.toLocaleString("pt-BR");

export function ImportSummaryDialog({ source, generated, summary, totalRecords, issues, busy, onConfirm, onCancel }: ImportSummaryDialogProps) {
  const partial = issues.length > 0;
  const title = generated ? "Dados sintéticos gerados" : partial ? "Arquivo parcialmente válido" : "Arquivo válido";
  const situations = [
    { label: "Vigentes", value: summary.bySituation.Vigente, tone: "vigente" },
    { label: "Atenção (≤ 20 dias)", value: summary.attention, tone: "atencao" },
    { label: "Vencidos", value: summary.bySituation.Vencido, tone: "vencido" },
    { label: "Sem data", value: summary.bySituation["Sem data"], tone: "sem-data" },
    { label: "Finalizados", value: summary.bySituation.Finalizado, tone: "finalizado" },
  ];

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
      <ImportIssuesList issues={issues} />
      <p className="import-note">Os dados atuais serão substituídos e ficarão salvos apenas neste navegador.</p>
    </DataDialog>
  );
}
