import type { Contract } from "@/domain/contract";

/**
 * Setores cujos contratos podem ser lidos. Obrigatório em toda leitura: o
 * repositório nunca devolve contratos fora de `sectorIds`.
 * Uma implementação de API deve repassar o escopo ao backend (filtro no servidor).
 */
export interface ContractScope {
  sectorIds: readonly string[];
}

export interface ContractRepository {
  list(scope: ContractScope): Promise<Contract[]>;
  refresh(scope: ContractScope): Promise<Contract[]>;
  /** Quantidade de contratos por setor do escopo (setores sem contratos ficam de fora). */
  countBySector(scope: ContractScope): Promise<Record<string, number>>;
}

export function inScope(scope: ContractScope): (contract: Contract) => boolean {
  const allowed = new Set(scope.sectorIds);
  return (contract) => allowed.has(contract.sectorId);
}

export function countContractsBySector(contracts: readonly Contract[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const contract of contracts) counts[contract.sectorId] = (counts[contract.sectorId] ?? 0) + 1;
  return counts;
}
