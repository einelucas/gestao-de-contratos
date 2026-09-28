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

/**
 * Capacidade opcional de um repositório: substituir o dataset por um conjunto
 * local (JSON importado ou gerado) e restaurar a origem padrão.
 * Um futuro ApiContractRepository pode simplesmente não implementá-la.
 */
export interface ContractDatasetStore {
  getDatasetInfo(): DatasetInfo;
  replaceDataset(contracts: Contract[], info: { kind: Exclude<DatasetKind, "default">; label: string }): Promise<ReplaceDatasetResult>;
  resetDataset(): Promise<void>;
}

export function isContractDatasetStore(repository: ContractRepository): repository is ContractRepository & ContractDatasetStore {
  const candidate = repository as Partial<ContractDatasetStore>;
  return typeof candidate.replaceDataset === "function" && typeof candidate.resetDataset === "function" && typeof candidate.getDatasetInfo === "function";
}
