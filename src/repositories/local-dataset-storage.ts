import type { Contract } from "@/domain/contract";
import { importContractRecords } from "@/features/contract-data/import-contracts";
import type { DatasetKind } from "@/repositories/contract-dataset-store";

const STORAGE_KEY = "gestao-contratos:dataset:v2";
/**
 * v1 guardava um dataset único, sem `sectorId`. Não há como atribuir esses
 * contratos a um setor com segurança, então ele é descartado na primeira leitura.
 */
const LEGACY_KEYS = ["gestao-contratos:dataset:v1"];

export interface StoredSectorDataset {
  kind: Exclude<DatasetKind, "default">;
  label: string;
  savedAt: string;
  contracts: Contract[];
}

/** Datasets locais indexados por `sectorId`. */
export type StoredDatasets = Record<string, StoredSectorDataset>;

interface StoredPayload {
  version: 2;
  sectors: StoredDatasets;
}

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Revalida um setor salvo; o localStorage pode ter sido editado manualmente. */
function readSector(sectorId: string, value: unknown): StoredSectorDataset | null {
  if (!isRecord(value) || !Array.isArray(value.contracts)) return null;
  const result = importContractRecords(value.contracts);
  if (!result.ok || result.issues.length) return null;
  if (result.contracts.some((contract) => contract.sectorId !== sectorId)) return null;
  return {
    kind: value.kind === "generated" ? "generated" : "import",
    label: typeof value.label === "string" ? value.label : "Dados importados",
    savedAt: typeof value.savedAt === "string" ? value.savedAt : new Date().toISOString(),
    contracts: result.contracts,
  };
}

export function readStoredDatasets(): StoredDatasets {
  const store = storage();
  if (!store) return {};
  try {
    for (const key of LEGACY_KEYS) store.removeItem(key);
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<StoredPayload>;
    if (parsed?.version !== 2 || !isRecord(parsed.sectors)) throw new Error("Formato desconhecido");
    const datasets: StoredDatasets = {};
    for (const [sectorId, value] of Object.entries(parsed.sectors)) {
      const dataset = readSector(sectorId, value);
      if (dataset) datasets[sectorId] = dataset;
    }
    return datasets;
  } catch {
    clearStoredDatasets();
    return {};
  }
}

export function writeStoredDatasets(datasets: StoredDatasets): boolean {
  const store = storage();
  if (!store) return false;
  try {
    if (Object.keys(datasets).length === 0) store.removeItem(STORAGE_KEY);
    else store.setItem(STORAGE_KEY, JSON.stringify({ version: 2, sectors: datasets } satisfies StoredPayload));
    return true;
  } catch {
    return false;
  }
}

export function clearStoredDatasets(): void {
  try {
    storage()?.removeItem(STORAGE_KEY);
  } catch {
    // Sem acesso ao storage: não há o que limpar.
  }
}
