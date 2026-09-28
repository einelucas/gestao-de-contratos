"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Sector, SectorSelection } from "@/domain/sector";
import { readLastSector, writeLastSector } from "@/features/sectors/last-sector-storage";
import { setSectorNotice, useSectorNotice } from "@/features/sectors/sector-notice-store";
import { indexSectors } from "@/lib/sectors";
import { routes } from "@/navigation/routes";
import { useHashRoute } from "@/navigation/use-hash-route";
import { getSectorRepository } from "@/repositories";
import type { ContractScope } from "@/repositories/contract-repository";

export type SectorStatus = "loading" | "ready" | "error";

interface SectorContextValue {
  status: SectorStatus;
  /** Setores ativos que podem ser abertos (base da tela de seleção e do seletor do header). */
  sectors: Sector[];
  /** Todos os setores conhecidos, inclusive inativos (para rótulos). */
  sectorsById: ReadonlyMap<string, Sector>;
  /** Contexto atual; null = tela de seleção. */
  selection: SectorSelection | null;
  selectedSector: Sector | null;
  /** Escopo de dados liberado para a seleção atual. Toda leitura de contratos deve usá-lo. */
  scope: ContractScope | null;
  canViewAllSectors: boolean;
  /** Aviso exibido na tela de seleção (ex.: setor da URL indisponível). */
  notice: string | null;
  dismissNotice: () => void;
  openSector: (sectorId: string) => void;
  openAllSectors: () => void;
  /** Volta para a tela de seleção ("Trocar setor"). */
  changeSector: () => void;
}

const SectorContext = createContext<SectorContextValue | null>(null);

interface SectorProviderProps {
  children: ReactNode;
  /**
   * Regra de acesso aplicada sobre os setores ativos. Na ETAPA 1 todos são
   * liberados; a camada de permissões injeta a regra real.
   */
  canAccessSector?: (sector: Sector) => boolean;
  canViewAllSectors?: boolean;
}

const allowAll = () => true;

export function SectorProvider({ children, canAccessSector = allowAll, canViewAllSectors = false }: SectorProviderProps) {
  const { ready, route, openedWithoutPath, navigate } = useHashRoute();
  const [allSectors, setAllSectors] = useState<Sector[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const notice = useSectorNotice();
  const restoreAttempted = useRef(false);

  useEffect(() => {
    let alive = true;
    getSectorRepository().getAll()
      .then((items) => { if (alive) setAllSectors(items); })
      .catch(() => { if (alive) setLoadError(true); });
    return () => { alive = false; };
  }, []);

  const sectorsById = useMemo(() => indexSectors(allSectors ?? []), [allSectors]);
  const sectors = useMemo(
    () => (allSectors ?? []).filter((sector) => sector.active && canAccessSector(sector)),
    [allSectors, canAccessSector],
  );
  const accessibleIds = useMemo(() => new Set(sectors.map((sector) => sector.id)), [sectors]);
  const canViewAll = canViewAllSectors && sectors.length > 0;
  const loaded = ready && allSectors !== null;

  // A rota é a fonte da verdade; aqui ela só é validada contra os setores liberados.
  const selection = useMemo<SectorSelection | null>(() => {
    if (!loaded) return null;
    if (route.name === "sector" && accessibleIds.has(route.sectorId)) return { kind: "sector", sectorId: route.sectorId };
    if (route.name === "all-sectors" && canViewAll) return { kind: "all" };
    return null;
  }, [loaded, route, accessibleIds, canViewAll]);

  // Rotas inválidas ou sem acesso: nada é carregado (scope fica null) e o app
  // redireciona para a seleção de setor, exibindo o motivo.
  const routeNotice = useMemo(() => {
    if (!loaded || selection) return null;
    if (route.name === "sector") {
      const sector = sectorsById.get(route.sectorId);
      return sector
        ? `Você não tem acesso ao setor ${sector.name} ou ele está inativo.`
        : `O setor "${route.sectorId}" não foi encontrado.`;
    }
    if (route.name === "all-sectors") return "A visão de todos os setores não está disponível para o seu usuário.";
    if (route.name === "not-found") return "Página não encontrada.";
    return null;
  }, [loaded, selection, route, sectorsById]);

  useEffect(() => {
    if (!routeNotice) return;
    setSectorNotice(routeNotice);
    navigate(routes.sectorSelection(), { replace: true });
  }, [routeNotice, navigate]);

  // Ao abrir o app sem caminho, reabre o último setor se ele continuar liberado.
  useEffect(() => {
    if (!loaded || restoreAttempted.current) return;
    restoreAttempted.current = true;
    if (!openedWithoutPath || route.name !== "sector-selection") return;
    const last = readLastSector();
    if (last === "*" && canViewAll) navigate(routes.allSectors(), { replace: true });
    else if (last && accessibleIds.has(last)) navigate(routes.sector(last), { replace: true });
  }, [loaded, openedWithoutPath, route, accessibleIds, canViewAll, navigate]);

  useEffect(() => {
    if (selection) writeLastSector(selection.kind === "all" ? "*" : selection.sectorId);
  }, [selection]);

  const scope = useMemo<ContractScope | null>(() => {
    if (!selection) return null;
    if (selection.kind === "all") return { sectorIds: sectors.map((sector) => sector.id) };
    return { sectorIds: [selection.sectorId] };
  }, [selection, sectors]);

  const openSector = useCallback((sectorId: string) => { setSectorNotice(null); navigate(routes.sector(sectorId)); }, [navigate]);
  const openAllSectors = useCallback(() => { setSectorNotice(null); navigate(routes.allSectors()); }, [navigate]);
  const changeSector = useCallback(() => navigate(routes.sectorSelection()), [navigate]);
  const dismissNotice = useCallback(() => setSectorNotice(null), []);

  const value = useMemo<SectorContextValue>(() => ({
    status: loadError ? "error" : loaded ? "ready" : "loading",
    sectors,
    sectorsById,
    selection,
    selectedSector: selection?.kind === "sector" ? sectorsById.get(selection.sectorId) ?? null : null,
    scope,
    canViewAllSectors: canViewAll,
    notice,
    dismissNotice,
    openSector,
    openAllSectors,
    changeSector,
  }), [loadError, loaded, sectors, sectorsById, selection, scope, canViewAll, notice, dismissNotice, openSector, openAllSectors, changeSector]);

  return <SectorContext.Provider value={value}>{children}</SectorContext.Provider>;
}

export function useSectorContext(): SectorContextValue {
  const context = useContext(SectorContext);
  if (!context) throw new Error("useSectorContext precisa estar dentro de <SectorProvider>.");
  return context;
}
