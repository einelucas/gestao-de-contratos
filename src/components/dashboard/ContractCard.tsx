"use client";

import {
  BuildingIcon,
  CalendarIcon,
  ChevronRightIcon,
  ClockIcon,
  FileIcon,
  PinIcon,
} from "@/components/icons";
import type { ContractView, ViewMode } from "@/domain/contract";
import { formatDate } from "@/lib/format";

interface ContractCardProps {
  contract: ContractView;
  mode: ViewMode;
  selected?: boolean;
  /** Sigla do setor, exibida apenas na visão consolidada. */
  sectorAcronym?: string;
  onOpen: (contract: ContractView) => void;
}

function deadlineText(contract: ContractView): string {
  if (contract.situation === "Finalizado") return "Contrato finalizado";
  if (contract.situation === "Sem data") return "Sem data de vigência";
  if (contract.situation === "Vencido") return `${Math.abs(contract.daysToEnd ?? 0)} dias em atraso`;
  if (contract.alert === "Atencao") return `Vence em ${contract.daysToEnd ?? 0} dias`;
  return `${contract.daysToEnd ?? 0} dias restantes`;
}

export function ContractCard({ contract, mode, selected, sectorAcronym, onOpen }: ContractCardProps) {
  const list = mode === "Lista";
  return (
    <button
      type="button"
      className={`contract-card ${list ? "is-list" : "is-grid"} ${selected ? "is-selected" : ""}`}
      onClick={() => onOpen(contract)}
      aria-label={`Abrir contrato ${contract.contractNumber} de ${contract.supplier}`}
    >
      {list ? (
        <>
          <span className="list-supplier" title={contract.supplier}>{contract.supplier}</span>
          <span className="list-contract">{contract.contractNumber}{sectorAcronym && <span className="sector-tag">{sectorAcronym}</span>}</span>
          <span className="list-expiry">{formatDate(contract.endDate)}</span>
          <span className="list-unit"><span className="unit-pill">{contract.unit}</span></span>
          <span className="list-status"><span className={`status-pill status-${contract.situation.toLowerCase().replace(" ", "-")}`}>{contract.situation}</span></span>
        </>
      ) : (
        <>
          <div className="card-row card-supplier-row">
            <BuildingIcon size={15} />
            <strong title={contract.supplier}>{contract.supplier}</strong>
            <span className={`status-pill status-${contract.situation.toLowerCase().replace(" ", "-")}`}>{contract.situation}</span>
          </div>
          <div className="card-row muted-row">
            <FileIcon size={14} />
            <span className="contract-number">Contrato nº {contract.contractNumber}</span>
            {sectorAcronym && <span className="sector-tag" title="Setor">{sectorAcronym}</span>}
          </div>
          <div className="card-row muted-row">
            <CalendarIcon size={14} />
            <span>{contract.endDate ? `Vencimento ${formatDate(contract.endDate)}` : "Vencimento não informado"}</span>
          </div>
          <div className="card-footer">
            <span className={`deadline deadline-${contract.alert.toLowerCase()}`}>
              {contract.situation !== "Finalizado" && <ClockIcon size={14} />}
              {deadlineText(contract)}
            </span>
            <span className="unit-pill"><PinIcon size={12} />{contract.unit}</span>
          </div>
          <ChevronRightIcon className="card-chevron" size={18} />
        </>
      )}
    </button>
  );
}
