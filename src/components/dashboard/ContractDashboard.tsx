"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  BellIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileIcon,
  GridIcon,
  ListIcon,
  MoonIcon,
  SunIcon,
} from "@/components/icons";
import { ContractCard } from "@/components/dashboard/ContractCard";
import { DetailsPanel } from "@/components/dashboard/DetailsPanel";
import { FiltersBar } from "@/components/dashboard/FiltersBar";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { NotificationsPanel } from "@/components/dashboard/NotificationsPanel";
import { HomologationBadge } from "@/components/auth/HomologationBadge";
import { UserSimulator } from "@/components/auth/UserSimulator";
import { DataManagementMenu, type NotifyTone } from "@/components/data-management/DataManagementMenu";
import { SectorSwitcher } from "@/components/sectors/SectorSwitcher";
import { contractKey, type ContractView, type SortMode, type ViewMode } from "@/domain/contract";
import { useSectorContext } from "@/features/sectors/sector-context";
import { useSectorContracts } from "@/features/sectors/use-sector-contracts";
import { useTheme } from "@/features/theme/theme-context";
import { buildNotifications, decorateContract, sortContracts } from "@/lib/contract-rules";

const ATTENTION_DAYS = 20;

type StatusFilter = "Todos" | "Vencido" | "Atencao" | "Regular" | "Finalizado";

function percent(value: number, total: number) {
  return `${((100 * value) / Math.max(1, total)).toFixed(1).replace(".", ",")}%`;
}

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 1200, height: 430 });
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
}

function columnsForWidth(width: number) {
  if (width < 600) return 1;
  if (width < 870) return 2;
  if (width < 1160) return 3;
  if (width < 1500) return 4;
  return 5;
}

// Altura mínima de cada card em modo Caixas; precisa acompanhar .contract-card.is-grid no CSS.
function baseCardHeight(width: number) {
  if (width < 600) return 138;
  if (width < 1160) return 134;
  return 132;
}

// Altura da linha em modo Lista; abaixo de 600px o CSS (@container) quebra a linha em duas.
function listCardHeight(width: number) {
  return width < 600 ? 68 : 52;
}

const GRID_GAP = 12;
const LIST_GAP = 6;

/** Dashboard do setor selecionado (ou da visão consolidada). Recebe apenas contratos do escopo. */
export function ContractDashboard() {
  const { scope, selection, selectedSector, sectorsById } = useSectorContext();
  const { contracts: rawContracts, loading, refreshing, lastUpdated, reload, refresh: refreshContracts } = useSectorContracts(scope);
  const { dark, toggleTheme } = useTheme();
  const isAllSectors = selection?.kind === "all";
  const [search, setSearch] = useState("");
  const [supplier, setSupplier] = useState("Todos");
  const [unit, setUnit] = useState("Todas");
  const [situation, setSituation] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Todos");
  const [sortMode, setSortMode] = useState<SortMode>("Status e vencimento");
  const [viewMode, setViewMode] = useState<ViewMode>("Caixas");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ContractView | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: NotifyTone } | null>(null);
  const [viewportRef, viewport] = useElementSize<HTMLDivElement>();

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), toast.tone === "error" ? 5000 : 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const contracts = useMemo(
    () => rawContracts.map((contract) => decorateContract(contract, ATTENTION_DAYS)),
    [rawContracts],
  );

  const suppliers = useMemo(() => [...new Set(contracts.map((item) => item.supplier))].sort((a, b) => a.localeCompare(b, "pt-BR")), [contracts]);
  const units = useMemo(() => [...new Set(contracts.map((item) => item.unit))].sort((a, b) => a.localeCompare(b, "pt-BR")), [contracts]);

  const baseFiltered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    return contracts.filter((contract) => {
      const searchMatches = !query || contract.supplier.toLocaleLowerCase("pt-BR").includes(query) || contract.contractNumber.toLocaleLowerCase("pt-BR").startsWith(query);
      const supplierMatches = supplier === "Todos" || contract.supplier.trim().toLowerCase() === supplier.trim().toLowerCase();
      const unitMatches = unit === "Todas" || contract.unit.toLowerCase() === unit.toLowerCase();
      const situationMatches = situation === "Todos"
        || (situation === "Vigentes" && contract.situation === "Vigente")
        || (situation === "Vencidos" && contract.situation === "Vencido")
        || (situation === "Sem data" && contract.situation === "Sem data")
        || (situation === "Finalizados" && contract.situation === "Finalizado");
      return searchMatches && supplierMatches && unitMatches && situationMatches;
    });
  }, [contracts, search, supplier, unit, situation]);

  const summary = useMemo(() => ({
    total: baseFiltered.length,
    expired: baseFiltered.filter((item) => item.situation === "Vencido").length,
    attention: baseFiltered.filter((item) => item.alert === "Atencao").length,
    regular: baseFiltered.filter((item) => item.alert === "Regular").length,
    finalized: baseFiltered.filter((item) => item.situation === "Finalizado").length,
    withoutDate: baseFiltered.filter((item) => item.situation === "Sem data").length,
  }), [baseFiltered]);

  const filtered = useMemo(() => {
    const statusItems = baseFiltered.filter((contract) => {
      if (statusFilter === "Todos") return true;
      if (statusFilter === "Vencido") return contract.situation === "Vencido";
      if (statusFilter === "Finalizado") return contract.situation === "Finalizado";
      return contract.alert === statusFilter;
    });
    return sortContracts(statusItems, sortMode);
  }, [baseFiltered, statusFilter, sortMode]);

  const notifications = useMemo(() => buildNotifications(contracts, ATTENTION_DAYS), [contracts]);
  const columns = viewMode === "Lista" ? 1 : columnsForWidth(viewport.width);
  const rowHeight = viewMode === "Lista" ? listCardHeight(viewport.width) : baseCardHeight(viewport.width);
  const rowGap = viewMode === "Lista" ? LIST_GAP : GRID_GAP;
  const rows = Math.max(1, Math.floor((Math.max(rowHeight, viewport.height) + rowGap) / (rowHeight + rowGap)));
  const itemsPerPage = Math.max(1, columns * rows);
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const pageItems = filtered.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);
  const totalBlocks = Math.max(1, Math.ceil(totalPages / 5));
  // O bloco de 5 páginas é sempre o da página atual.
  const safeBlock = Math.ceil(safePage / 5);
  const firstPageInBlock = (safeBlock - 1) * 5 + 1;
  const pageNumbers = Array.from({ length: Math.min(5, Math.max(0, totalPages - firstPageInBlock + 1)) }, (_, i) => firstPageInBlock + i);

  const resetPage = () => setPage(1);

  const clearFilters = () => {
    setSearch(""); setSupplier("Todos"); setUnit("Todas"); setSituation("Todos"); setStatusFilter("Todos"); resetPage();
  };

  const refresh = async () => {
    await refreshContracts();
    resetPage();
    setToast({ message: "Dados atualizados com sucesso.", tone: "success" });
  };

  const selectKpi = (key: "Total" | "Vencidos" | "Atencao" | "Regulares" | "Finalizados") => {
    if (key === "Total") setStatusFilter("Todos");
    if (key === "Vencidos") setStatusFilter((current) => current === "Vencido" ? "Todos" : "Vencido");
    if (key === "Atencao") setStatusFilter((current) => current === "Atencao" ? "Todos" : "Atencao");
    if (key === "Regulares") setStatusFilter((current) => current === "Regular" ? "Todos" : "Regular");
    if (key === "Finalizados") setStatusFilter((current) => current === "Finalizado" ? "Todos" : "Finalizado");
    resetPage();
  };

  const openContract = (contract: ContractView) => {
    setSelected(contract);
    setNotificationsOpen(false);
  };

  return (
    <main className={`dashboard ${selected ? "has-details" : ""}`}>
      <div className="dashboard-content">
        <header className="app-header">
          <div className="module-mark"><img src="./app-icon.jpg" alt="" /></div>
          <div className="title-group">
            <h1>Gestão de Contratos <HomologationBadge compact /></h1>
            <p>{isAllSectors ? "Visão consolidada" : selectedSector?.name} • Acompanhe vencimentos, consulte contratos e acesse detalhes de forma centralizada.</p>
          </div>
          <SectorSwitcher />
          <div className="header-actions">
            <DataManagementMenu
              contracts={rawContracts}
              onDatasetChanged={async () => { setSelected(null); resetPage(); await reload(); }}
              onNotify={(message, tone) => setToast({ message, tone })}
            />
            <UserSimulator />
            <button className="icon-button notification-button" type="button" onClick={() => { setNotificationsOpen(true); setSelected(null); }} aria-label="Abrir notificações">
              <BellIcon size={19} />
              {notifications.length > 0 && <span className="notification-dot">{Math.min(99, notifications.length)}</span>}
            </button>
            <button className="icon-button" type="button" onClick={toggleTheme} aria-label={dark ? "Ativar tema claro" : "Ativar tema escuro"}>
              {dark ? <SunIcon size={19} /> : <MoonIcon size={19} />}
            </button>
          </div>
        </header>

        <div className="main-flow">
          <FiltersBar
            search={search}
            supplier={supplier}
            unit={unit}
            situation={situation}
            suppliers={suppliers}
            units={units}
            refreshing={refreshing}
            lastUpdated={lastUpdated}
            onSearchChange={(value) => { setSearch(value); resetPage(); }}
            onSupplierChange={(value) => { setSupplier(value); resetPage(); }}
            onUnitChange={(value) => { setUnit(value); resetPage(); }}
            onSituationChange={(value) => { setSituation(value); setStatusFilter("Todos"); resetPage(); }}
            onClear={clearFilters}
            onRefresh={() => void refresh()}
          />

          <section className="kpi-grid" aria-label="Resumo de contratos">
            <KpiCard kind="Total" title="Total de contratos" value={summary.total} subtitle={`Contratos no recorte${summary.withoutDate ? ` • ${summary.withoutDate} sem data` : ""}`} active={statusFilter === "Todos"} onClick={() => selectKpi("Total")} />
            <KpiCard kind="Vencidos" title="Vencidos" value={summary.expired} subtitle={`${percent(summary.expired, summary.total)} do recorte`} active={statusFilter === "Vencido"} onClick={() => selectKpi("Vencidos")} />
            <KpiCard kind="Atencao" title="Atenção" value={summary.attention} subtitle={`Até ${ATTENTION_DAYS} dias • ${percent(summary.attention, summary.total)}`} active={statusFilter === "Atencao"} onClick={() => selectKpi("Atencao")} />
            <KpiCard kind="Regulares" title="Regulares" value={summary.regular} subtitle={`${percent(summary.regular, summary.total)} do recorte`} active={statusFilter === "Regular"} onClick={() => selectKpi("Regulares")} />
            <KpiCard kind="Finalizados" title="Finalizados" value={summary.finalized} subtitle={`Encerrados • ${percent(summary.finalized, summary.total)}`} active={statusFilter === "Finalizado"} onClick={() => selectKpi("Finalizados")} />
          </section>

          <section className="contracts-shell">
            <div className="contracts-toolbar">
              <h2>Contratos ({filtered.length})</h2>
              <div className="toolbar-controls">
                <label className="sort-control">
                  <span>Ordenar por</span>
                  <select value={sortMode} onChange={(e: ChangeEvent<HTMLSelectElement>) => { setSortMode(e.target.value as SortMode); resetPage(); }}>
                    <option>Status e vencimento</option>
                    <option>Nome do fornecedor</option>
                    <option>Vencimento mais próximo</option>
                  </select>
                </label>
                <div className="view-toggle" role="group" aria-label="Modo de exibição">
                  <button type="button" className={viewMode === "Caixas" ? "active" : ""} onClick={() => { setViewMode("Caixas"); resetPage(); }} aria-label="Exibir em caixas"><GridIcon size={16}/></button>
                  <button type="button" className={viewMode === "Lista" ? "active" : ""} onClick={() => { setViewMode("Lista"); resetPage(); }} aria-label="Exibir em lista"><ListIcon size={16}/></button>
                </div>
              </div>
            </div>

            {viewMode === "Lista" && filtered.length > 0 && (
              <div className="list-header" aria-hidden="true">
                <span>Fornecedor</span><span>Contrato</span><span>Vencimento</span><span>Unidade</span><span>Status</span>
              </div>
            )}

            <div className="contract-viewport" ref={viewportRef}>
              {loading ? (
                <div className="loading-state"><span className="loading-ring" />Carregando contratos...</div>
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  <FileIcon size={34}/>
                  <h3>Nenhum contrato encontrado</h3>
                  <p>Revise os filtros aplicados ou limpe o recorte atual.</p>
                  <button className="control-button primary" type="button" onClick={clearFilters}>Limpar filtros</button>
                </div>
              ) : (
                <div
                  className={`contracts-grid ${viewMode === "Lista" ? "list-mode" : "grid-mode"}`}
                  style={viewMode === "Lista" ? undefined : { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, minmax(${rowHeight}px, 1fr))` }}
                >
                  {pageItems.map((contract) => (
                    <ContractCard
                      key={contractKey(contract)}
                      contract={contract}
                      mode={viewMode}
                      selected={selected !== null && contractKey(selected) === contractKey(contract)}
                      sectorAcronym={isAllSectors ? sectorsById.get(contract.sectorId)?.acronym ?? contract.sectorId : undefined}
                      onOpen={openContract}
                    />
                  ))}
                </div>
              )}
            </div>

            {filtered.length > 0 && (
              <nav className="pagination" aria-label="Paginação de contratos">
                <button type="button" className="page-arrow" disabled={safeBlock <= 1} onClick={() => setPage((Math.max(1, safeBlock - 1) - 1) * 5 + 1)} aria-label="Bloco de páginas anterior"><ChevronLeftIcon size={16}/></button>
                <div className="page-numbers">
                  {pageNumbers.map((number) => <button key={number} type="button" className={safePage === number ? "active" : ""} onClick={() => setPage(number)}>{number}</button>)}
                </div>
                <button type="button" className="page-arrow" disabled={safeBlock >= totalBlocks} onClick={() => setPage(Math.min(totalBlocks, safeBlock + 1) * 5 - 4)} aria-label="Próximo bloco de páginas"><ChevronRightIcon size={16}/></button>
                <span className="page-summary">{safePage} de {totalPages}</span>
              </nav>
            )}
          </section>
        </div>
      </div>

      {selected && <DetailsPanel contract={selected} sectorName={sectorsById.get(selected.sectorId)?.name ?? selected.sectorId} onClose={() => setSelected(null)} />}
      {notificationsOpen && (
        <NotificationsPanel
          notifications={notifications}
          onClose={() => setNotificationsOpen(false)}
          onOpenContract={openContract}
          onShowExpired={() => { setStatusFilter("Vencido"); setSituation("Todos"); resetPage(); setNotificationsOpen(false); }}
          onShowAttention={() => { setStatusFilter("Atencao"); setSituation("Todos"); resetPage(); setNotificationsOpen(false); }}
        />
      )}
      {toast && <div className={`toast toast-${toast.tone}`} role="status">{toast.message}</div>}
    </main>
  );
}
