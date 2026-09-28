/**
 * Rotas da aplicação. Os caminhos seguem o formato `/setor/[sectorId]`, mas
 * trafegam no hash da URL (`#/setor/manutencao`): o app é uma exportação
 * estática publicada como Power Apps Code App, servida a partir de um único
 * `index.html` e com assets relativos — caminhos reais quebrariam o carregamento
 * e o recarregamento dentro do player. Para migrar para segmentos reais do App
 * Router, basta trocar este módulo e `use-hash-route.ts`.
 */

export type AppRoute =
  | { name: "sector-selection" }
  | { name: "all-sectors" }
  /** `rest` guarda subcaminhos futuros, ex.: ["contratos", "CTR-001"]. */
  | { name: "sector"; sectorId: string; rest: string[] }
  | { name: "not-found"; path: string };

const SELECTION_SEGMENT = "setores";
const ALL_SECTORS_SEGMENT = "todos-os-setores";

export const routes = {
  /** Explícita para diferenciar "voltei para a seleção" de "abri o app sem caminho". */
  sectorSelection: () => `/${SELECTION_SEGMENT}`,
  allSectors: () => `/${ALL_SECTORS_SEGMENT}`,
  sector: (sectorId: string) => `/setor/${encodeURIComponent(sectorId)}`,
  // Preparadas para páginas futuras (ainda não existem telas próprias).
  sectorContracts: (sectorId: string) => `/setor/${encodeURIComponent(sectorId)}/contratos`,
  contract: (sectorId: string, contractId: string | number) =>
    `/setor/${encodeURIComponent(sectorId)}/contratos/${encodeURIComponent(String(contractId))}`,
};

export function parseRoute(path: string): AppRoute {
  const segments = path.split("/").filter(Boolean).map((segment) => {
    try {
      return decodeURIComponent(segment);
    } catch {
      return segment;
    }
  });
  if (segments.length === 0 || (segments.length === 1 && segments[0] === SELECTION_SEGMENT)) return { name: "sector-selection" };
  if (segments.length === 1 && segments[0] === ALL_SECTORS_SEGMENT) return { name: "all-sectors" };
  if (segments[0] === "setor" && segments[1]) return { name: "sector", sectorId: segments[1], rest: segments.slice(2) };
  return { name: "not-found", path };
}
