import type { Contract } from "@/domain/contract";
import type {
  ContractDatasetStore,
  DatasetInfo,
  DatasetKind,
  ReplaceDatasetResult,
} from "@/repositories/contract-dataset-store";
import type { ContractRepository } from "@/repositories/contract-repository";
import {
  clearStoredDataset,
  readStoredDataset,
  writeStoredDataset,
  type StoredDataset,
} from "@/repositories/local-dataset-storage";

const clone = (items: Contract[]) => items.map((item) => ({ ...item, situations: [...item.situations] }));

/**
 * Usa o dataset salvo no navegador (JSON importado ou gerado) quando existir;
 * caso contrário delega para o repositório padrão (mocks).
 */
export class LocalDatasetContractRepository implements ContractRepository, ContractDatasetStore {
  /** undefined = storage ainda não lido; null = sem dataset salvo. */
  private dataset: StoredDataset | null | undefined;

  constructor(private readonly fallback: ContractRepository) {}

  private current(): StoredDataset | null {
    if (this.dataset === undefined) this.dataset = readStoredDataset();
    return this.dataset;
  }

  async list(): Promise<Contract[]> {
    const dataset = this.current();
    return dataset ? clone(dataset.contracts) : this.fallback.list();
  }

  async refresh(): Promise<Contract[]> {
    this.dataset = undefined;
    return this.current() ? this.list() : this.fallback.refresh();
  }

  getDatasetInfo(): DatasetInfo {
    const dataset = this.current();
    if (!dataset) return { kind: "default", label: "Dados de demonstração", savedAt: null };
    return { kind: dataset.kind, label: dataset.label, savedAt: dataset.savedAt };
  }

  async replaceDataset(contracts: Contract[], info: { kind: Exclude<DatasetKind, "default">; label: string }): Promise<ReplaceDatasetResult> {
    const dataset: StoredDataset = {
      version: 1,
      kind: info.kind,
      label: info.label,
      savedAt: new Date().toISOString(),
      contracts: clone(contracts),
    };
    const persisted = writeStoredDataset(dataset);
    this.dataset = dataset;
    return { persisted };
  }

  async resetDataset(): Promise<void> {
    clearStoredDataset();
    this.dataset = null;
  }
}
