import type { Contract } from "@/domain/contract";
import type { ContractImportResult, ImportOptions } from "@/features/contract-data/contract-import.types";
import { summarizeContracts } from "@/features/contract-data/contract-dataset-summary";
import { normalizeContractRecords } from "@/features/contract-data/normalize-contract-json";
import { checkImportFile, parseContractJson } from "@/features/contract-data/parse-contract-json";
import { declaredSector, validateContractRecords } from "@/features/contract-data/validate-contract-json";
import { resolveSector } from "@/lib/sectors";

/** validate → normalize → resumo, a partir de registros já extraídos do JSON. */
export function importContractRecords(records: unknown[], options: ImportOptions = {}): ContractImportResult {
  const { valid, issues } = validateContractRecords(records, options);
  if (valid.length === 0) {
    return {
      ok: false,
      error: `Nenhum dos ${records.length} registro(s) do arquivo pôde ser importado.`,
      totalRecords: records.length,
      issues,
    };
  }
  const contracts = normalizeContractRecords(valid);
  return {
    ok: true,
    contracts,
    totalRecords: records.length,
    issues,
    summary: summarizeContracts(contracts),
    reassignedSectorCount: countReassigned(valid.map((item) => item.record), options),
  };
}

/** Quantos registros informavam um setor diferente do setor de destino. */
function countReassigned(records: unknown[], options: ImportOptions): number {
  const target = options.targetSectorId;
  if (!target) return 0;
  return records.filter((raw) => {
    const declared = declaredSector(raw);
    if (!declared) return false;
    const resolved = options.sectors ? resolveSector(declared, options.sectors)?.id : declared;
    return resolved !== target;
  }).length;
}

/** parse → validate → normalize, a partir do texto do arquivo. */
export function importContractsFromText(text: string, options: ImportOptions = {}): ContractImportResult {
  const parsed = parseContractJson(text);
  if (!parsed.ok) return { ok: false, error: parsed.error, totalRecords: 0, issues: [] };
  return importContractRecords(parsed.records, options);
}

/** Lê o arquivo localmente (File API) e executa o pipeline completo. */
export async function importContractsFromFile(file: File, options: ImportOptions = {}): Promise<ContractImportResult> {
  const fileError = checkImportFile(file);
  if (fileError) return { ok: false, error: fileError, totalRecords: 0, issues: [] };

  let text: string;
  try {
    text = await file.text();
  } catch {
    return { ok: false, error: "Não foi possível ler o arquivo selecionado.", totalRecords: 0, issues: [] };
  }
  return importContractsFromText(text, options);
}

/** Usado para datasets gerados no próprio app: passa pela mesma validação. */
export function importGeneratedContracts(contracts: Contract[], options: ImportOptions = {}): ContractImportResult {
  return importContractRecords(contracts, options);
}
