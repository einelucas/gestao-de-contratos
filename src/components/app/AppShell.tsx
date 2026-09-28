"use client";

import { CurrentUserSessionProvider } from "@/auth/user-context";
import { ContractDashboard } from "@/components/dashboard/ContractDashboard";
import { SectorSelectionScreen } from "@/components/sectors/SectorSelectionScreen";
import { selectionKey } from "@/domain/sector";
import { useSectorContext } from "@/features/sectors/sector-context";
import { ThemeProvider } from "@/features/theme/theme-context";

function AppContent() {
  const { status, selection } = useSectorContext();

  if (status === "loading") {
    return <div className="app-status"><span className="loading-ring" />Carregando...</div>;
  }
  if (status === "error") {
    return <div className="app-status">Não foi possível carregar os setores. Recarregue a página.</div>;
  }
  if (!selection) return <SectorSelectionScreen />;
  // A key remonta o dashboard ao trocar de setor: filtros, KPIs e paginação recomeçam.
  return <ContractDashboard key={selectionKey(selection)} />;
}

/** Usuário → permissões → setor → contratos. */
export function AppShell() {
  return (
    <ThemeProvider>
      <CurrentUserSessionProvider>
        <AppContent />
      </CurrentUserSessionProvider>
    </ThemeProvider>
  );
}
