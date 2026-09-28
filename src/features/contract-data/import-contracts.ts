import type { Contract } from "@/domain/contract";
import type { ContractImportResult } from "@/features/contract-data/contract-import.types";
import { summarizeContracts } from "@/features/contract-data/contract-dataset-summary";
import { normalizeContractRecords } from "@/features/contract-data/normalize-contract-json";
import { checkImportFile, parseContractJson } from "@/features/contract-data/parse-contract-json";
import { validateContractRecords } from "@/features/contract-data/validate-contract-json";

/** validate → normalize → resumo, a partir de registros já extraídos do JSON. */
export function importContractRecords(records: unknown[]): ContractImportResult {
  const { valid, issues } = validateContractRecords(records);
  if (valid.length === 0) {
    return {
      ok: false,
      error: `Nenhum dos ${records.length} registro(s) do arquivo pôde ser importado.`,
      totalRecords: records.length,
      issues,
    };
  }
  const contracts = normalizeContractRecords(valid);
  return { ok: true, contracts, totalRecords: records.length, issues, summary: summarizeContracts(contracts) };
}

/** parse → validate → normalize, a partir do texto do arquivo. */
export function importContractsFromText(text: string): ContractImportResult {
  const parsed = parseContractJson(text);
  if (!parsed.ok) return { ok: false, error: parsed.error, totalRecords: 0, issues: [] };
  return importContractRecords(parsed.records);
}

/** Lê o arquivo localmente (File API) e executa o pipeline completo. */
export async function importContractsFromFile(file: File): Promise<ContractImportResult> {
  const fileError = checkImportFile(file);
  if (fileError) return { ok: false, error: fileError, totalRecords: 0, issues: [] };

  let text: string;
  try {
    text = await file.text();
  } catch {
    return { ok: false, error: "Não foi possível ler o arquivo selecionado.", totalRecords: 0, issues: [] };
  }
  return importContractsFromText(text);
}

/** Usado para datasets gerados no próprio app: passa pela mesma validação. */
export function importGeneratedContracts(contracts: Contract[]): ContractImportResult {
  return importContractRecords(contracts);
}
