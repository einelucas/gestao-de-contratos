import type { Contract } from "@/domain/contract";
import type { ContractRepository } from "@/repositories/contract-repository";

export type DatasetKind = "default" | "import" | "generated";

export interface DatasetInfo {
  kind: DatasetKind;
  /** Nome do arquivo importado ou descrição do dataset gerado. */
  label: string;
  savedAt: string | null;
}

export interface ReplaceDatasetResult {
  /** false quando o navegador não conseguiu gravar (ex.: cota do localStorage). */
  persisted: boolean;
}

export interface DatasetSource {
  kind: Exclude<DatasetKind, "default">;
  label: string;
}

/**
 * Capacidade opcional de um repositório: substituir os contratos de UM setor
 * por um conjunto local (JSON importado ou gerado) e restaurar a origem padrão.
 * Operações sempre limitadas ao setor informado: os demais setores são preservados.
 * A autorização (quem pode alterar qual setor) é responsabilidade de quem chama.
 * Um futuro ApiContractRepository pode simplesmente não implementá-la.
 */
export interface ContractDatasetStore {
  getDatasetInfo(sectorId: string): DatasetInfo;
  /** Substitui somente os contratos de `sectorId`; todos recebem esse `sectorId`. */
  replaceSectorContracts(sectorId: string, contracts: Contract[], source: DatasetSource): Promise<ReplaceDatasetResult>;
  /** Volta os setores informados para os dados de demonstração. */
  resetSectorContracts(sectorIds: readonly string[]): Promise<void>;
}

export function isContractDatasetStore(repository: ContractRepository): repository is ContractRepository & ContractDatasetStore {
  const candidate = repository as Partial<ContractDatasetStore>;
  return typeof candidate.replaceSectorContracts === "function"
    && typeof candidate.resetSectorContracts === "function"
    && typeof candidate.getDatasetInfo === "function";
}
