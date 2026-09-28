"use client";

import { XIcon } from "@/components/icons";
import type { ContractView } from "@/domain/contract";
import { formatCurrency, formatDate } from "@/lib/format";

interface DetailsPanelProps {
  contract: ContractView | null;
  onClose: () => void;
}

function Field({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`detail-field ${wide ? "wide" : ""}`}>
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}

export function DetailsPanel({ contract, onClose }: DetailsPanelProps) {
  if (!contract) return null;
  return (
    <div className="panel-layer details-layer" role="presentation">
      <button className="panel-backdrop" type="button" onClick={onClose} aria-label="Fechar detalhes" />
      <aside className="side-panel details-panel" aria-label="Detalhes do contrato">
        <div className="panel-header">
          <div>
            <span className="eyebrow">Detalhes do contrato</span>
            <h2>{contract.supplier}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar detalhes"><XIcon /></button>
        </div>
        <div className="detail-meta">
          <strong>Contrato nº {contract.contractNumber}</strong>
          <span className={`status-pill status-${contract.situation.toLowerCase().replace(" ", "-")}`}>{contract.situation}</span>
        </div>
        <div className="details-scroll">
          <div className="details-grid">
            <Field label="Fornecedor" value={contract.supplier} wide />
            <Field label="Contrato" value={contract.contractNumber} />
            <Field label="Unidade" value={contract.unit} />
            <Field label="Situação" value={contract.situations.length ? contract.situations.join(", ") : contract.situation} wide />
            <Field label="Início da vigência" value={formatDate(contract.startDate)} />
            <Field label="Fim da vigência" value={formatDate(contract.endDate)} />
            <Field label="Valor Serviço" value={formatCurrency(contract.serviceValue)} />
            <Field label="Material próprio" value={formatCurrency(contract.ownMaterialValue)} />
            <Field label="Material terceiros" value={formatCurrency(contract.thirdPartyMaterialValue)} />
            <Field label="Valor total" value={formatCurrency(contract.totalValue)} />
            <div className="detail-field wide description-field">
              <span>Descrição da Prestação</span>
              <p>{contract.serviceDescription || "Sem descrição cadastrada."}</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
