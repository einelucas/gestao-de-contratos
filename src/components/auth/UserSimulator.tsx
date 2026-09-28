"use client";

import { useState } from "react";
import { canAccessSector, canImportContracts, isAdmin } from "@/auth/permissions";
import { useAccessDirectory } from "@/auth/use-access-directory";
import { useCurrentUser } from "@/auth/user-context";
import { useDismissable } from "@/components/common/use-dismissable";
import { ArrowDownIcon, CheckIcon, UserIcon } from "@/components/icons";
import { ROLE_LABELS, type AppUser, type CurrentUser } from "@/domain/user";
import { useSectorContext } from "@/features/sectors/sector-context";

/** Seletor de usuário simulado — existe SOMENTE em homologação; não é autenticação. */
export function UserSimulator() {
  const { currentUser, simulation } = useCurrentUser();
  const directory = useAccessDirectory();
  const { sectorsById } = useSectorContext();
  const [open, setOpen] = useState(false);
  const ref = useDismissable<HTMLDivElement>(open, () => setOpen(false));

  if (!simulation) return null;

  const describeAccess = (user: AppUser) => {
    const session: CurrentUser = { user, sectorPermissions: directory?.permissions.filter((item) => item.userId === user.id) ?? [] };
    if (isAdmin(session)) return "Todos os setores • importa em qualquer setor";
    const visible = [...sectorsById.values()].filter((sector) => sector.active && canAccessSector(session, sector.id));
    if (!visible.length) return "Sem setores liberados";
    return visible.map((sector) => `${sector.acronym}${canImportContracts(session, sector.id) ? " (importa)" : ""}`).join(", ");
  };

  return (
    <div className="user-simulator" ref={ref}>
      <button
        type="button"
        className={`header-pill-button user-simulator-button ${open ? "is-open" : ""}`}
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Usuário simulado (modo de teste): ${currentUser.user.name}. Trocar usuário`}
        title="Usuário simulado — modo de teste, não é autenticação real"
      >
        <UserIcon size={16} />
        <span className="header-pill-label user-simulator-text">
          <small>Modo de teste</small>
          <span>{currentUser.user.name}</span>
        </span>
        <ArrowDownIcon size={14} />
      </button>

      {open && (
        <div className="popover-menu user-menu" role="menu" aria-label="Usuário simulado">
          <span className="popover-caption">Usuário simulado • homologação</span>
          <div className="sector-menu-list">
            {simulation.users.map((item) => {
              const current = item.id === currentUser.user.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={current}
                  className={`user-option ${current ? "is-current" : ""}`}
                  onClick={() => { setOpen(false); void simulation.switchUser(item.id); }}
                >
                  <span className="user-option-text">
                    <strong>{item.name}</strong>
                    <small>{ROLE_LABELS[item.role]} • {describeAccess(item)}</small>
                  </span>
                  {current && <CheckIcon size={15} />}
                </button>
              );
            })}
          </div>
          <p className="popover-footnote">Permissões simuladas apenas no navegador, para testes. Não representam autenticação nem segurança real.</p>
        </div>
      )}
    </div>
  );
}
