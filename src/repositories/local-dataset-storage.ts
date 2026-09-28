import type { Contract } from "@/domain/contract";
import { importContractRecords } from "@/features/contract-data/import-contracts";
import type { DatasetKind } from "@/repositories/contract-dataset-store";

const STORAGE_KEY = "gestao-contratos:dataset:v1";

export interface StoredDataset {
  version: 1;
  kind: Exclude<DatasetKind, "default">;
  label: string;
  savedAt: string;
  contracts: Contract[];
}

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Lê o dataset salvo. O conteúdo passa de novo pela validação/normalização,
 * pois o localStorage pode ter sido editado manualmente ou vir de versão antiga.
 */
export function readStoredDataset(): StoredDataset | null {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredDataset>;
    if (parsed?.version !== 1 || !Array.isArray(parsed.contracts)) throw new Error("Formato desconhecido");
    const result = importContractRecords(parsed.contracts);
    if (!result.ok || result.issues.length) throw new Error("Dataset salvo inválido");
    return {
      version: 1,
      kind: parsed.kind === "generated" ? "generated" : "import",
      label: typeof parsed.label === "string" ? parsed.label : "Dados importados",
      savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : new Date().toISOString(),
      contracts: result.contracts,
    };
  } catch {
    clearStoredDataset();
    return null;
  }
}

export function writeStoredDataset(dataset: StoredDataset): boolean {
  const store = storage();
  if (!store) return false;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(dataset));
    return true;
  } catch {
    return false;
  }
}

export function clearStoredDataset(): void {
  try {
    storage()?.removeItem(STORAGE_KEY);
  } catch {
    // Sem acesso ao storage: não há o que limpar.
  }
}
