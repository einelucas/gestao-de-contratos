/**
 * Camada central de autorização (funções puras). Componentes nunca verificam
 * `user.role` ou `SectorPermission` diretamente: sempre perguntam a estas funções.
 *
 * ATENÇÃO: nesta fase as permissões são apenas de frontend, para desenvolvimento
 * e homologação. Com dados corporativos reais, a autorização precisa ser
 * aplicada também na API/backend/conector/fonte de dados.
 */
import { isTestEnvironment } from "@/config/environment";
import type { Sector } from "@/domain/sector";
import type { AppUser, CurrentUser, SectorPermission } from "@/domain/user";

type Session = CurrentUser | null;

export function isAdmin(session: Session): boolean {
  return session?.user.role === "admin";
}

function permissionFor(session: Session, sectorId: string): SectorPermission | undefined {
  return session?.sectorPermissions.find((item) => item.sectorId === sectorId && item.userId === session.user.id);
}

/** Pode abrir o setor e consultar seus contratos. Admin: todos os setores. */
export function canAccessSector(session: Session, sectorId: string): boolean {
  if (!session) return false;
  if (isAdmin(session)) return true;
  return permissionFor(session, sectorId)?.canView === true;
}

/**
 * Pode importar/substituir os contratos do setor. Exige papel de responsável
 * (o papel é o teto) e `canImport` na permissão do setor. Admin: qualquer setor.
 */
export function canImportContracts(session: Session, sectorId: string): boolean {
  if (!session) return false;
  if (isAdmin(session)) return true;
  const permission = permissionFor(session, sectorId);
  return session.user.role === "sector-manager" && permission?.canView === true && permission.canImport;
}

/** Exporta apenas o que o usuário já pode ver. */
export function canExportContracts(session: Session, sectorId: string): boolean {
  return canAccessSector(session, sectorId);
}

/** Restaurar a demonstração substitui dados: só quem importa, e fora do admin apenas em homologação. */
export function canRestoreDataset(session: Session, sectorId: string): boolean {
  return canImportContracts(session, sectorId) && (isAdmin(session) || isTestEnvironment());
}

/** Gerar dados sintéticos substitui dados: mesma regra da restauração. */
export function canGenerateSyntheticData(session: Session, sectorId: string): boolean {
  return canRestoreDataset(session, sectorId);
}

export function canViewAllSectors(session: Session): boolean {
  return isAdmin(session);
}

export function getAccessibleSectors(session: Session, sectors: readonly Sector[]): Sector[] {
  return sectors.filter((sector) => sector.active && canAccessSector(session, sector.id));
}

export interface DataActions {
  import: boolean;
  downloadTemplate: boolean;
  export: boolean;
  generate: boolean;
  restore: boolean;
}

/** Ações de dados liberadas para um escopo: cada ação precisa valer para todos os setores dele. */
export function getDataActions(session: Session, sectorIds: readonly string[]): DataActions {
  const all = (check: (session: Session, sectorId: string) => boolean) =>
    sectorIds.length > 0 && sectorIds.every((sectorId) => check(session, sectorId));
  const importAllowed = all(canImportContracts);
  return {
    import: importAllowed,
    downloadTemplate: importAllowed,
    export: all(canExportContracts),
    generate: all(canGenerateSyntheticData),
    restore: all(canRestoreDataset),
  };
}

export function hasAnyDataAction(actions: DataActions): boolean {
  return Object.values(actions).some(Boolean);
}

export type ImportAuthorization =
  | { allowed: true }
  | { allowed: false; deniedSectorIds: string[] };

/**
 * Um arquivo só pode ser gravado se o usuário puder importar para TODOS os
 * setores de destino. Não há importação parcial por permissão.
 */
export function authorizeContractImport(session: Session, sectorIds: Iterable<string>): ImportAuthorization {
  const denied = [...new Set(sectorIds)].filter((sectorId) => !canImportContracts(session, sectorId));
  return denied.length ? { allowed: false, deniedSectorIds: denied } : { allowed: true };
}

/**
 * Responsáveis pela importação de um setor, derivados das permissões
 * (o acesso global do admin não o torna "responsável" por um setor).
 */
export function getImportResponsibles(sectorId: string, users: readonly AppUser[], permissions: readonly SectorPermission[]): AppUser[] {
  return users.filter((user) => user.role !== "admin"
    && canImportContracts({ user, sectorPermissions: permissions.filter((item) => item.userId === user.id) }, sectorId));
}

/** Regra de homologação: todo setor ativo precisa de ao menos um responsável. */
export function findSectorsWithoutImportResponsible(
  sectors: readonly Sector[],
  users: readonly AppUser[],
  permissions: readonly SectorPermission[],
): Sector[] {
  return sectors.filter((sector) => sector.active && getImportResponsibles(sector.id, users, permissions).length === 0);
}
