/**
 * Papel geral do usuário. Funciona como teto: o que ele pode fazer em cada
 * setor é definido pelas `SectorPermission` (exceto `admin`, que é global).
 */
export type UserRole = "viewer" | "sector-manager" | "admin";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

/**
 * Associação explícita usuário ↔ setor. Um setor pode ter vários responsáveis
 * (titular, substituto...) e um usuário pode ter permissões diferentes em cada setor.
 */
export interface SectorPermission {
  userId: string;
  sectorId: string;
  canView: boolean;
  /** Responsável pela importação/substituição dos contratos do setor. */
  canImport: boolean;
  // Preparados para evolução (edição de contratos); ainda não usados.
  canCreate?: boolean;
  canEdit?: boolean;
}

/** Usuário autenticado + as permissões dele. É tudo o que a UI conhece do usuário. */
export interface CurrentUser {
  user: AppUser;
  sectorPermissions: readonly SectorPermission[];
}

export const ROLE_LABELS: Record<UserRole, string> = {
  viewer: "Consulta",
  "sector-manager": "Responsável do setor",
  admin: "Administrador",
};
