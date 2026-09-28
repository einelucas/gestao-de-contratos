import type { Contract, ContractSituation } from "@/domain/contract";

/** Limite de tamanho do arquivo importado (processado somente no navegador). */
export const MAX_IMPORT_FILE_BYTES = 10 * 1024 * 1024;

/** Quantidade máxima de registros com problema detalhados na interface. */
export const MAX_REPORTED_ISSUES = 50;

/** Problemas encontrados em um registro do JSON (índice começa em 1). */
export interface RecordIssue {
  index: number;
  label: string;
  messages: string[];
}

export interface ContractDatasetSummary {
  total: number;
  units: number;
  suppliers: number;
  bySituation: Record<ContractSituation, number>;
  attention: number;
}

export type ContractImportResult =
  | {
      ok: true;
      contracts: Contract[];
      totalRecords: number;
      issues: RecordIssue[];
      summary: ContractDatasetSummary;
    }
  | {
      ok: false;
      error: string;
      totalRecords: number;
      issues: RecordIssue[];
    };

export type ParseResult =
  | { ok: true; records: unknown[] }
  | { ok: false; error: string };

/** Registro que passou na validação, ainda no formato bruto do JSON. */
export interface ValidatedRecord {
  index: number;
  record: Record<string, unknown>;
}
