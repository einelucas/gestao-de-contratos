import type { Contract } from "@/domain/contract";
import type { ContractDatasetStore, DatasetSource } from "@/repositories/contract-dataset-store";

/**
 * Importação na visão consolidada (somente admin): o arquivo decide o setor de
 * cada contrato, e cada setor é substituído isoladamente pelo repositório.
 */
export async function replaceContractsBySector(
  store: ContractDatasetStore,
  contracts: Contract[],
  source: DatasetSource,
): Promise<{ persisted: boolean; sectorIds: string[] }> {
  const bySector = new Map<string, Contract[]>();
  for (const contract of contracts) {
    const list = bySector.get(contract.sectorId) ?? [];
    list.push(contract);
    bySector.set(contract.sectorId, list);
  }
  let persisted = true;
  for (const [sectorId, items] of bySector) {
    const result = await store.replaceSectorContracts(sectorId, items, source);
    persisted &&= result.persisted;
  }
  return { persisted, sectorIds: [...bySector.keys()] };
}
