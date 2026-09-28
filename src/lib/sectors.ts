import type { Sector } from "@/domain/sector";

/** Formato aceito para `Sector.id`: minúsculas, números e hífen. */
export const SECTOR_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** "Manutenção Predial" → "manutencao-predial". */
export function slugifySectorName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Resolve o setor de um valor vindo de dados externos. Aceita o id
 * ("manutencao") e, por compatibilidade com planilhas/datasets antigos, também
 * o nome ("Manutenção") ou a sigla ("MAN").
 */
export function resolveSector(value: string, sectors: readonly Sector[]): Sector | null {
  const raw = value.trim();
  if (!raw) return null;
  const slug = slugifySectorName(raw);
  const acronym = raw.toUpperCase();
  return sectors.find((sector) => sector.id === raw)
    ?? sectors.find((sector) => sector.id === slug || slugifySectorName(sector.name) === slug)
    ?? sectors.find((sector) => sector.acronym.toUpperCase() === acronym)
    ?? null;
}

export function indexSectors(sectors: readonly Sector[]): Map<string, Sector> {
  return new Map(sectors.map((sector) => [sector.id, sector]));
}

export function sectorName(sectorId: string, sectorsById: ReadonlyMap<string, Sector>): string {
  return sectorsById.get(sectorId)?.name ?? sectorId;
}
