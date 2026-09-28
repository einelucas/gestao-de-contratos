import type { Contract, ContractSituation } from "@/domain/contract";
import type { Sector } from "@/domain/sector";

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
  /** Quantidade de contratos por `sectorId`. */
  bySector: Record<string, number>;
}

/**
 * Setores conhecidos no momento da importação. Com eles, `sectorId` precisa
 * existir e estar ativo, e nomes/siglas legados são convertidos para o id.
 * Sem eles (revalidação do localStorage), basta um `sectorId` bem formado.
 */
export interface ImportOptions {
  sectors?: readonly Sector[];
  /**
   * Importação feita dentro de um setor: todos os contratos recebem este
   * `sectorId`, e o `sectorId` informado no arquivo é ignorado (não pode
   * mudar o setor selecionado).
   */
  targetSectorId?: string;
}

export type ContractImportResult =
  | {
      ok: true;
      contracts: Contract[];
      totalRecords: number;
      issues: RecordIssue[];
      summary: ContractDatasetSummary;
      /** Registros cujo setor informado no arquivo foi substituído por `targetSectorId`. */
      reassignedSectorCount: number;
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
  /** `sectorId` já resolvido para o id canônico. */
  sectorId: string;
}
