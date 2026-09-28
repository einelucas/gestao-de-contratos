"use client";

import { useState } from "react";
import { useDismissable } from "@/components/common/use-dismissable";
import { ArrowDownIcon, CheckIcon, LayersIcon, SwapIcon } from "@/components/icons";
import { useSectorContext } from "@/features/sectors/sector-context";

/** Mostra o setor atual no header e permite trocar sem recarregar a página. */
export function SectorSwitcher() {
  const { sectors, selection, selectedSector, canViewAllSectors, openSector, openAllSectors, changeSector } = useSectorContext();
  const [open, setOpen] = useState(false);
  const ref = useDismissable<HTMLDivElement>(open, () => setOpen(false));

  const isAll = selection?.kind === "all";
  const acronym = isAll ? "*" : selectedSector?.acronym ?? "";
  const label = isAll ? "Todos os setores" : selectedSector?.name ?? "Selecionar setor";
  const choose = (action: () => void) => { setOpen(false); action(); };

  return (
    <div className="sector-switcher" ref={ref}>
      <button
        type="button"
        className={`sector-switcher-button ${open ? "is-open" : ""}`}
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Setor atual: ${label}. Trocar setor`}
      >
        <span className="sector-badge">{isAll ? <LayersIcon size={14} /> : acronym}</span>
        <span className="sector-switcher-label">{label}</span>
        <ArrowDownIcon size={15} />
      </button>

      {open && (
        <div className="popover-menu sector-menu" role="menu" aria-label="Setores">
          <span className="popover-caption">Setores</span>
          <div className="sector-menu-list">
            {sectors.map((sector) => {
              const current = selection?.kind === "sector" && selection.sectorId === sector.id;
              return (
                <button key={sector.id} type="button" role="menuitemradio" aria-checked={current} className={current ? "is-current" : ""} onClick={() => choose(() => openSector(sector.id))}>
                  <span className="sector-badge small">{sector.acronym}</span>
                  <span className="popover-item-label">{sector.name}</span>
                  {current && <CheckIcon size={15} />}
                </button>
              );
            })}
          </div>
          {canViewAllSectors && (
            <button type="button" role="menuitemradio" aria-checked={isAll} className={isAll ? "is-current" : ""} onClick={() => choose(openAllSectors)}>
              <span className="sector-badge small"><LayersIcon size={13} /></span>
              <span className="popover-item-label">Todos os setores</span>
              {isAll && <CheckIcon size={15} />}
            </button>
          )}
          <div className="popover-separator" role="separator" />
          <button type="button" role="menuitem" onClick={() => choose(changeSector)}>
            <SwapIcon size={15} />
            <span className="popover-item-label">Trocar setor</span>
          </button>
        </div>
      )}
    </div>
  );
}
