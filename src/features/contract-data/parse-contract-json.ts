import { MAX_IMPORT_FILE_BYTES, type ParseResult } from "@/features/contract-data/contract-import.types";

export interface ImportFileInfo {
  name: string;
  size: number;
  type: string;
}

/** Verifica extensão/tipo e tamanho antes de ler o conteúdo. */
export function checkImportFile(file: ImportFileInfo): string | null {
  const looksLikeJson = file.name.toLowerCase().endsWith(".json") || file.type === "application/json";
  if (!looksLikeJson) return "O arquivo selecionado não é um JSON. Escolha um arquivo com extensão .json.";
  if (file.size > MAX_IMPORT_FILE_BYTES) return "O arquivo selecionado é muito grande. O limite é de 10 MB.";
  if (file.size === 0) return "O arquivo selecionado está vazio.";
  return null;
}

/** Faz o parse do texto (JSON.parse apenas — nenhum código do arquivo é executado). */
export function parseContractJson(text: string): ParseResult {
  const content = text.replace(/^﻿/, "").trim();
  if (!content) return { ok: false, error: "O arquivo selecionado está vazio." };

  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch (error) {
    const detail = error instanceof Error ? ` (${error.message})` : "";
    return { ok: false, error: `O arquivo não contém um JSON válido${detail}.` };
  }

  if (!Array.isArray(data)) {
    return { ok: false, error: "A raiz do JSON precisa ser uma lista (array) de contratos: [ { ... }, { ... } ]." };
  }
  if (data.length === 0) {
    return { ok: false, error: "A lista de contratos do arquivo está vazia." };
  }
  return { ok: true, records: data };
}
