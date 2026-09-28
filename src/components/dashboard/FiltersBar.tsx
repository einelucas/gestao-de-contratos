"use client";

import type { ChangeEvent } from "react";
import { RefreshIcon, SearchIcon, XIcon } from "@/components/icons";
import { formatTime } from "@/lib/format";

interface FiltersBarProps {
  search: string;
  supplier: string;
  unit: string;
  situation: string;
  suppliers: string[];
  units: string[];
  refreshing: boolean;
  lastUpdated: Date | null;
  onSearchChange: (value: string) => void;
  onSupplierChange: (value: string) => void;
  onUnitChange: (value: string) => void;
  onSituationChange: (value: string) => void;
  onClear: () => void;
  onRefresh: () => void;
}

export function FiltersBar(props: FiltersBarProps) {
  const hasFilters = props.search || props.supplier !== "Todos" || props.unit !== "Todas" || props.situation !== "Todos";
  return (
    <section className="filters-bar" aria-label="Filtros de contratos">
      <label className="search-field">
        <SearchIcon size={17} />
        <input
          value={props.search}
          onChange={(event: ChangeEvent<HTMLInputElement>) => props.onSearchChange(event.target.value)}
          placeholder="Pesquisar fornecedor ou contrato..."
          aria-label="Pesquisar fornecedor ou contrato"
        />
      </label>

      <label className="select-wrap">
        <span className="sr-only">Fornecedor</span>
        <select value={props.supplier} onChange={(e: ChangeEvent<HTMLSelectElement>) => props.onSupplierChange(e.target.value)} aria-label="Filtrar fornecedor">
          <option value="Todos">Fornecedor: Todos</option>
          {props.suppliers.map((supplier) => <option key={supplier} value={supplier}>{supplier}</option>)}
        </select>
      </label>

      <label className="select-wrap compact">
        <span className="sr-only">Unidade</span>
        <select value={props.unit} onChange={(e: ChangeEvent<HTMLSelectElement>) => props.onUnitChange(e.target.value)} aria-label="Filtrar unidade">
          <option value="Todas">Unidade: Todas</option>
          {props.units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
        </select>
      </label>

      <label className="select-wrap compact">
        <span className="sr-only">Situação</span>
        <select value={props.situation} onChange={(e: ChangeEvent<HTMLSelectElement>) => props.onSituationChange(e.target.value)} aria-label="Filtrar situação">
          <option value="Todos">Situação: Todos</option>
          <option value="Vigentes">Vigentes</option>
          <option value="Vencidos">Vencidos</option>
          <option value="Sem data">Sem data</option>
          <option value="Finalizados">Finalizados</option>
        </select>
      </label>

      <button className="control-button subtle" type="button" onClick={props.onClear} disabled={!hasFilters} title="Limpar filtros">
        <XIcon size={16} /><span>Limpar</span>
      </button>
      <button className="control-button primary" type="button" onClick={props.onRefresh} disabled={props.refreshing}>
        <RefreshIcon size={16} className={props.refreshing ? "spin" : ""} />
        <span>{props.refreshing ? "Atualizando..." : "Atualizar"}</span>
      </button>
      <span className="last-updated">{props.lastUpdated ? `Atualizado ${formatTime(props.lastUpdated)}` : ""}</span>
    </section>
  );
}
