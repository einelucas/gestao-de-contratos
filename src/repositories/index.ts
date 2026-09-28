import { isContractDatasetStore, type ContractDatasetStore } from "@/repositories/contract-dataset-store";
import type { ContractRepository } from "@/repositories/contract-repository";
import { LocalDatasetContractRepository } from "@/repositories/local-dataset-contract-repository";
import { MockContractRepository } from "@/repositories/mock-contract-repository";
import { MockSectorRepository } from "@/repositories/mock-sector-repository";
import type { SectorRepository } from "@/repositories/sector-repository";

let repository: ContractRepository | null = null;
let sectorRepository: SectorRepository | null = null;

const provider = () => process.env.NEXT_PUBLIC_DATA_PROVIDER ?? "mock";

export function getContractRepository(): ContractRepository {
  if (repository) return repository;

  // Futuro: trocar este switch por ApiContractRepository ou SharePointContractRepository.
  switch (provider()) {
    case "mock":
    default:
      // JSON importado/gerado no navegador tem prioridade (por setor); sem ele, usa os mocks.
      repository = new LocalDatasetContractRepository(new MockContractRepository());
      return repository;
  }
}

export function getSectorRepository(): SectorRepository {
  if (sectorRepository) return sectorRepository;

  // Futuro: ApiSectorRepository / SharePointSectorRepository.
  switch (provider()) {
    case "mock":
    default:
      sectorRepository = new MockSectorRepository();
      return sectorRepository;
  }
}

/**
 * Retorna o repositório atual quando ele permite substituir o dataset
 * (importação/geração de JSON); null quando a origem não suporta isso.
 */
export function getContractDatasetStore(): ContractDatasetStore | null {
  const current = getContractRepository();
  return isContractDatasetStore(current) ? current : null;
}
