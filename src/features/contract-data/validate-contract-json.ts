import type { ImportOptions, RecordIssue, ValidatedRecord } from "@/features/contract-data/contract-import.types";
import { toIsoDateOnly } from "@/features/contract-data/date-only";
import { resolveSector, SECTOR_ID_PATTERN } from "@/lib/sectors";

const REQUIRED_TEXT_FIELDS = ["contractNumber", "supplier", "unit"] as const;
const MONEY_FIELDS = ["serviceValue", "ownMaterialValue", "thirdPartyMaterialValue", "totalValue"] as const;
const DATE_FIELDS = ["startDate", "endDate"] as const;

const isMissing = (value: unknown) => value === undefined || value === null;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function recordLabel(index: number, record: unknown): string {
  if (isPlainObject(record) && typeof record.contractNumber === "string" && record.contractNumber.trim()) {
    return `Registro ${index} (contrato ${record.contractNumber.trim()})`;
  }
  return `Registro ${index}`;
}

/** Setor informado pelo próprio registro (`sectorId` ou o campo legado `sector`), se houver. */
export function declaredSector(raw: unknown): string | null {
  if (!isPlainObject(raw)) return null;
  const value = !isMissing(raw.sectorId) ? raw.sectorId : raw.sector;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * Resolve o setor do registro. `sectorId` é obrigatório; por compatibilidade
 * com planilhas antigas, um campo textual `sector` (nome ou sigla) também é
 * aceito quando os setores são conhecidos.
 */
function validateSector(raw: Record<string, unknown>, options: ImportOptions, messages: string[]): string | null {
  // Dentro de um setor, o destino é sempre o setor atual (o arquivo não decide).
  if (options.targetSectorId) return options.targetSectorId;
  const value = !isMissing(raw.sectorId) ? raw.sectorId : raw.sector;
  const field = !isMissing(raw.sectorId) ? "sectorId" : "sector";
  if (isMissing(value)) {
    messages.push("sectorId ausente");
    return null;
  }
  if (typeof value !== "string" || !value.trim()) {
    messages.push(`${field} deve ser um texto não vazio`);
    return null;
  }
  if (!options.sectors) {
    if (SECTOR_ID_PATTERN.test(value)) return value;
    messages.push(`sectorId inválido: ${JSON.stringify(value)}`);
    return null;
  }
  const sector = resolveSector(value, options.sectors);
  if (!sector) {
    messages.push(`setor desconhecido: ${JSON.stringify(value)}`);
    return null;
  }
  if (!sector.active) {
    messages.push(`setor inativo: ${sector.name}`);
    return null;
  }
  return sector.id;
}

/**
 * Valida a estrutura de cada registro. Registros com problema são reportados
 * individualmente; os demais seguem para normalização.
 */
export function validateContractRecords(records: unknown[], options: ImportOptions = {}): { valid: ValidatedRecord[]; issues: RecordIssue[] } {
  const valid: ValidatedRecord[] = [];
  const issues: RecordIssue[] = [];
  const seenIds = new Set<number>();

  records.forEach((raw, position) => {
    const index = position + 1;
    const messages: string[] = [];

    if (!isPlainObject(raw)) {
      issues.push({ index, label: recordLabel(index, raw), messages: ["registro não é um objeto JSON"] });
      return;
    }

    const sectorId = validateSector(raw, options, messages);

    const id = raw.id;
    if (isMissing(id)) messages.push("id ausente");
    else if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0) messages.push(`id inválido: ${JSON.stringify(id)} (use um número inteiro positivo)`);
    else if (seenIds.has(id)) messages.push(`id duplicado: ${id}`);
    else seenIds.add(id);

    for (const field of REQUIRED_TEXT_FIELDS) {
      const value = raw[field];
      if (isMissing(value)) messages.push(`${field} ausente`);
      else if (typeof value !== "string") messages.push(`${field} deve ser texto`);
      else if (!value.trim()) messages.push(`${field} vazio`);
    }

    if (!isMissing(raw.serviceDescription) && typeof raw.serviceDescription !== "string") {
      messages.push("serviceDescription deve ser texto");
    }

    for (const field of MONEY_FIELDS) {
      const value = raw[field];
      if (isMissing(value)) continue;
      if (typeof value !== "number" || !Number.isFinite(value)) messages.push(`${field} inválido: deve ser numérico`);
      else if (value < 0) messages.push(`${field} não pode ser negativo`);
    }

    const dates: Partial<Record<(typeof DATE_FIELDS)[number], string>> = {};
    for (const field of DATE_FIELDS) {
      const value = raw[field];
      if (isMissing(value) || value === "") continue;
      const iso = typeof value === "string" ? toIsoDateOnly(value) : null;
      if (!iso) messages.push(`${field} inválida: ${JSON.stringify(value)} (use AAAA-MM-DD)`);
      else dates[field] = iso;
    }
    if (dates.startDate && dates.endDate && dates.endDate < dates.startDate) {
      messages.push("endDate anterior a startDate");
    }

    const situations = raw.situations;
    if (!isMissing(situations) && (!Array.isArray(situations) || situations.some((item) => typeof item !== "string"))) {
      messages.push("situations deve ser uma lista de textos");
    }

    if (messages.length || !sectorId) issues.push({ index, label: recordLabel(index, raw), messages });
    else valid.push({ index, record: raw, sectorId });
  });

  return { valid, issues };
}
