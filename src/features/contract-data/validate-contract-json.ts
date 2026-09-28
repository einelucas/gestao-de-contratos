import type { RecordIssue, ValidatedRecord } from "@/features/contract-data/contract-import.types";
import { toIsoDateOnly } from "@/features/contract-data/date-only";

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

/**
 * Valida a estrutura de cada registro. Registros com problema são reportados
 * individualmente; os demais seguem para normalização.
 */
export function validateContractRecords(records: unknown[]): { valid: ValidatedRecord[]; issues: RecordIssue[] } {
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

    if (messages.length) issues.push({ index, label: recordLabel(index, raw), messages });
    else valid.push({ index, record: raw });
  });

  return { valid, issues };
}
