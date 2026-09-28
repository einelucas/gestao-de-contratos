"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getCurrentUserProvider } from "@/auth";
import { canAccessSector, canViewAllSectors } from "@/auth/permissions";
import { isTestEnvironment } from "@/config/environment";
import type { Sector } from "@/domain/sector";
import type { AppUser, CurrentUser } from "@/domain/user";
import { SectorProvider } from "@/features/sectors/sector-context";

interface CurrentUserContextValue {
  currentUser: CurrentUser;
  /** Presente apenas em homologação, com um provedor que permite simular usuários. */
  simulation: { users: AppUser[]; switchUser: (userId: string) => Promise<void> } | null;
}

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

/**
 * Carrega o usuário atual e aplica a autorização dele ao contexto de setores:
 * a partir daqui, só os setores liberados existem para a UI.
 */
export function CurrentUserSessionProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [failed, setFailed] = useState(false);
  const provider = useMemo(() => getCurrentUserProvider(), []);
  const simulationEnabled = isTestEnvironment() && !!provider.simulation;

  useEffect(() => {
    let alive = true;
    provider.getCurrentUser()
      .then((current) => { if (alive) setCurrentUser(current); })
      .catch(() => { if (alive) setFailed(true); });
    if (simulationEnabled) {
      provider.simulation!.listUsers().then((list) => { if (alive) setUsers(list); }).catch(() => undefined);
    }
    return () => { alive = false; };
  }, [provider, simulationEnabled]);

  const switchUser = useCallback(async (userId: string) => {
    if (!provider.simulation) return;
    setCurrentUser(await provider.simulation.switchUser(userId));
  }, [provider]);

  const canOpenSector = useCallback((sector: Sector) => canAccessSector(currentUser, sector.id), [currentUser]);

  const value = useMemo<CurrentUserContextValue | null>(() => currentUser && ({
    currentUser,
    simulation: simulationEnabled ? { users, switchUser } : null,
  }), [currentUser, simulationEnabled, users, switchUser]);

  if (failed) return <div className="app-status">Não foi possível identificar o usuário. Recarregue a página.</div>;
  if (!value) return <div className="app-status"><span className="loading-ring" />Carregando...</div>;

  return (
    <CurrentUserContext.Provider value={value}>
      <SectorProvider canAccessSector={canOpenSector} canViewAllSectors={canViewAllSectors(value.currentUser)}>
        {children}
      </SectorProvider>
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser(): CurrentUserContextValue {
  const context = useContext(CurrentUserContext);
  if (!context) throw new Error("useCurrentUser precisa estar dentro de <CurrentUserSessionProvider>.");
  return context;
}
