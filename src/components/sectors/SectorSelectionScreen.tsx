"use client";

import { canImportContracts, getImportResponsibles } from "@/auth/permissions";
import { useAccessDirectory } from "@/auth/use-access-directory";
import { useCurrentUser } from "@/auth/user-context";
import { HomologationBadge } from "@/components/auth/HomologationBadge";
import { UserSimulator } from "@/components/auth/UserSimulator";
import { AlertIcon, ArrowRightIcon, LayersIcon, LockIcon, MoonIcon, SunIcon, UploadIcon, XIcon } from "@/components/icons";
import { useSectorContext } from "@/features/sectors/sector-context";
import { useSectorContractCounts } from "@/features/sectors/use-sector-contracts";
import { useTheme } from "@/features/theme/theme-context";

const contractsLabel = (value: number | undefined) => {
  if (value === undefined) return "Sem contratos";
  return `${value.toLocaleString("pt-BR")} ${value === 1 ? "contrato" : "contratos"}`;
};

export function SectorSelectionScreen() {
  const { sectors, canViewAllSectors, notice, dismissNotice, openSector, openAllSectors } = useSectorContext();
  const { dark, toggleTheme } = useTheme();
  const { currentUser } = useCurrentUser();
  const directory = useAccessDirectory();

  const responsiblesLabel = (sectorId: string) => {
    if (!directory) return null;
    const responsibles = getImportResponsibles(sectorId, directory.users, directory.permissions);
    if (responsibles.length === 0) return { text: "Sem responsável pelos dados", title: undefined, missing: true };
    if (responsibles.length === 1) return { text: `Responsável pelos dados: ${responsibles[0].name}`, title: undefined, missing: false };
    return { text: `${responsibles.length} responsáveis pelos dados`, title: responsibles.map((user) => user.name).join(", "), missing: false };
  };
  const counts = useSectorContractCounts(sectors.map((sector) => sector.id));
  const total = counts ? Object.values(counts).reduce((sum, value) => sum + value, 0) : null;

  return (
    <main className="sector-screen">
      <header className="app-header sector-screen-header">
        <div className="module-mark"><img src="./app-icon.jpg" alt="" /></div>
        <div className="title-group">
          <h1>Gestão de Contratos</h1>
          <p>Acompanhe vencimentos, consulte contratos e acesse detalhes de forma centralizada.</p>
        </div>
        <div className="header-actions">
          <UserSimulator />
          <button className="icon-button" type="button" onClick={toggleTheme} aria-label={dark ? "Ativar tema claro" : "Ativar tema escuro"}>
            {dark ? <SunIcon size={19} /> : <MoonIcon size={19} />}
          </button>
        </div>
      </header>

      <section className="sector-screen-body" aria-labelledby="sector-screen-title">
        <div className="sector-screen-intro">
          <span className="eyebrow">Acesso por setor</span>
          <h2 id="sector-screen-title">Selecione o setor que deseja acessar</h2>
          <HomologationBadge />
          <p>Olá, {currentUser.user.name}. Os indicadores, filtros, notificações e contratos passam a considerar somente o setor escolhido.</p>
        </div>

        {notice && (
          <div className="sector-notice" role="status">
            <AlertIcon size={17} />
            <span>{notice}</span>
            <button type="button" className="icon-button" onClick={dismissNotice} aria-label="Fechar aviso"><XIcon size={16} /></button>
          </div>
        )}

        {sectors.length === 0 ? (
          <div className="sector-empty">
            <LockIcon size={30} />
            <h3>Nenhum setor disponível</h3>
            <p>Seu usuário ainda não possui setores liberados. Solicite acesso ao responsável.</p>
          </div>
        ) : (
          <div className="sector-grid">
            {sectors.map((sector) => {
              const responsibles = responsiblesLabel(sector.id);
              const canImport = canImportContracts(currentUser, sector.id);
              return (
                <button key={sector.id} type="button" className="sector-card" onClick={() => openSector(sector.id)}>
                  <span className="sector-card-top">
                    <span className="sector-card-acronym">{sector.acronym}</span>
                    {canImport && <span className="sector-card-permission" title="Você pode importar contratos neste setor"><UploadIcon size={12} />Você importa</span>}
                  </span>
                  <strong className="sector-card-name">{sector.name}</strong>
                  <span className="sector-card-count">{counts ? contractsLabel(counts[sector.id]) : "Carregando..."}</span>
                  {responsibles && (
                    <span className={`sector-card-owner ${responsibles.missing ? "is-missing" : ""}`} title={responsibles.title}>{responsibles.text}</span>
                  )}
                  <span className="sector-card-cta">Acessar <ArrowRightIcon size={16} /></span>
                </button>
              );
            })}
            {canViewAllSectors && (
              <button type="button" className="sector-card is-all" onClick={openAllSectors}>
                <span className="sector-card-acronym"><LayersIcon size={18} /></span>
                <strong className="sector-card-name">Todos os setores</strong>
                <span className="sector-card-count">{total === null ? "Carregando..." : `Visão consolidada • ${contractsLabel(total)}`}</span>
                <span className="sector-card-cta">Acessar <ArrowRightIcon size={16} /></span>
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
