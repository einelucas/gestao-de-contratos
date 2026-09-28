const STORAGE_KEY = "gestao-contratos:last-sector:v1";

/** Último contexto aberto: id do setor ou "*" para a visão consolidada. */
export function readLastSector(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeLastSector(value: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Sem storage: a seleção só não será lembrada.
  }
}
