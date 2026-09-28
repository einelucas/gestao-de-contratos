import type { Contract } from "@/domain/contract";
import type {
  ContractDatasetStore,
  DatasetInfo,
  DatasetSource,
  ReplaceDatasetResult,
} from "@/repositories/contract-dataset-store";
import type { ContractRepository, ContractScope } from "@/repositories/contract-repository";
import {
  readStoredDatasets,
  writeStoredDatasets,
  type StoredDatasets,
} from "@/repositories/local-dataset-storage";

const clone = (items: Contract[]) => items.map((item) => ({ ...item, situations: [...item.situations] }));

/**
 * Para cada setor do escopo, usa o dataset salvo no navegador (JSON importado
 * ou gerado) quando existir; os demais setores vêm do repositório padrão (mocks).
 */
export class LocalDatasetContractRepository implements ContractRepository, ContractDatasetStore {
  /** undefined = storage ainda não lido. */
  private datasets: StoredDatasets | undefined;

  constructor(private readonly fallback: ContractRepository) {}

  private current(): StoredDatasets {
    if (this.datasets === undefined) this.datasets = readStoredDatasets();
    return this.datasets;
  }

  /** Separa o escopo entre setores com dataset local e setores da origem padrão. */
  private split(scope: ContractScope) {
    const datasets = this.current();
    const local: Contract[] = [];
    const fallbackIds: string[] = [];
    for (const sectorId of new Set(scope.sectorIds)) {
      const dataset = datasets[sectorId];
      if (dataset) local.push(...clone(dataset.contracts));
      else fallbackIds.push(sectorId);
    }
    return { local, fallbackScope: { sectorIds: fallbackIds } };
  }

  async list(scope: ContractScope): Promise<Contract[]> {
    const { local, fallbackScope } = this.split(scope);
    const rest = fallbackScope.sectorIds.length ? await this.fallback.list(fallbackScope) : [];
    return [...local, ...rest];
  }

  async refresh(scope: ContractScope): Promise<Contract[]> {
    this.datasets = undefined;
    const { local, fallbackScope } = this.split(scope);
    const rest = fallbackScope.sectorIds.length ? await this.fallback.refresh(fallbackScope) : [];
    return [...local, ...rest];
  }

  async countBySector(scope: ContractScope): Promise<Record<string, number>> {
    const datasets = this.current();
    const { fallbackScope } = this.split(scope);
    const counts = fallbackScope.sectorIds.length ? await this.fallback.countBySector(fallbackScope) : {};
    for (const sectorId of scope.sectorIds) {
      const dataset = datasets[sectorId];
      if (dataset) counts[sectorId] = dataset.contracts.length;
    }
    return counts;
  }

  getDatasetInfo(sectorId: string): DatasetInfo {
    const dataset = this.current()[sectorId];
    if (!dataset) return { kind: "default", label: "Dados de demonstração", savedAt: null };
    return { kind: dataset.kind, label: dataset.label, savedAt: dataset.savedAt };
  }

  /**
   * Remove somente o dataset de `sectorId`, grava o novo e salva o conjunto
   * completo: os demais setores ficam intactos.
   */
  async replaceSectorContracts(sectorId: string, contracts: Contract[], source: DatasetSource): Promise<ReplaceDatasetResult> {
    const next: StoredDatasets = {
      ...this.current(),
      [sectorId]: {
        kind: source.kind,
        label: source.label,
        savedAt: new Date().toISOString(),
        // Garante que nada fora do setor seja gravado nele.
        contracts: clone(contracts).map((contract) => ({ ...contract, sectorId })),
      },
    };
    const persisted = writeStoredDatasets(next);
    this.datasets = next;
    return { persisted };
  }

  async resetSectorContracts(sectorIds: readonly string[]): Promise<void> {
    const next: StoredDatasets = { ...this.current() };
    for (const sectorId of sectorIds) delete next[sectorId];
    writeStoredDatasets(next);
    this.datasets = next;
  }
}
