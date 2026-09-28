import type { Contract } from "@/domain/contract";
import type { ValidatedRecord } from "@/features/contract-data/contract-import.types";
import { toIsoDateOnly } from "@/features/contract-data/date-only";

const text = (value: unknown) => (typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "");
const money = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : 0);
const roundCents = (value: number) => Math.round(value * 100) / 100;

function date(value: unknown): string | null {
  return typeof value === "string" && value ? toIsoDateOnly(value) : null;
}

/**
 * Converte um registro já validado para `Contract`. Somente dados brutos:
 * situação, alerta e prazo continuam derivados em `src/lib/contract-rules.ts`.
 */
export function normalizeContractRecord({ record }: ValidatedRecord): Contract {
  const serviceValue = money(record.serviceValue);
  const ownMaterialValue = money(record.ownMaterialValue);
  const thirdPartyMaterialValue = money(record.thirdPartyMaterialValue);
  const totalValue = typeof record.totalValue === "number"
    ? record.totalValue
    : roundCents(serviceValue + ownMaterialValue + thirdPartyMaterialValue);

  return {
    id: record.id as number,
    contractNumber: text(record.contractNumber),
    supplier: text(record.supplier),
    serviceDescription: typeof record.serviceDescription === "string" ? record.serviceDescription.trim() : "",
    serviceValue,
    ownMaterialValue,
    thirdPartyMaterialValue,
    totalValue,
    startDate: date(record.startDate),
    endDate: date(record.endDate),
    unit: text(record.unit),
    situations: Array.isArray(record.situations)
      ? record.situations.map(text).filter(Boolean)
      : [],
  };
}

export function normalizeContractRecords(records: ValidatedRecord[]): Contract[] {
  return records.map(normalizeContractRecord);
}
