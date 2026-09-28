import type { Contract, ContractSituation } from "@/domain/contract";
import type { ContractDatasetSummary } from "@/features/contract-data/contract-import.types";
import { decorateContract, startOfToday } from "@/lib/contract-rules";

/** Resumo exibido antes de aplicar um dataset. Usa as mesmas regras do dashboard. */
export function summarizeContracts(contracts: Contract[], attentionDays = 20): ContractDatasetSummary {
  const today = startOfToday();
  const bySituation: Record<ContractSituation, number> = { Vigente: 0, Vencido: 0, "Sem data": 0, Finalizado: 0 };
  const units = new Set<string>();
  const suppliers = new Set<string>();
  let attention = 0;

  for (const contract of contracts) {
    const view = decorateContract(contract, attentionDays, today);
    bySituation[view.situation] += 1;
    if (view.alert === "Atencao") attention += 1;
    units.add(contract.unit.toLowerCase());
    suppliers.add(contract.supplier.toLowerCase());
  }

  return { total: contracts.length, units: units.size, suppliers: suppliers.size, bySituation, attention };
}
