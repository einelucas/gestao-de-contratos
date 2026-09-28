/**
 * Setor (área de negócio) dono de um conjunto de contratos.
 * `id` é a chave estável (slug); nunca use `name` como identificador.
 */
export interface Sector {
  id: string;
  name: string;
  /** Sigla curta exibida em badges (ex.: "MAN"). */
  acronym: string;
  /** Setores inativos não aparecem para seleção nem aceitam importação. */
  active: boolean;
}

/** Contexto de navegação: um setor específico ou a visão consolidada. */
export type SectorSelection =
  | { kind: "sector"; sectorId: string }
  | { kind: "all" };

export function selectionKey(selection: SectorSelection): string {
  return selection.kind === "all" ? "*" : selection.sectorId;
}
