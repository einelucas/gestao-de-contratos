import type { AppUser, CurrentUser } from "@/domain/user";

/**
 * Origem do usuário atual. Hoje: MockCurrentUserProvider (homologação).
 * Futuro: EntraCurrentUserProvider (Microsoft Entra ID) — Dashboard e regras
 * de autorização não mudam, pois só conhecem `CurrentUser`.
 */
export interface CurrentUserProvider {
  getCurrentUser(): Promise<CurrentUser>;
  /** Presente apenas em provedores de teste que permitem simular outro usuário. */
  simulation?: UserSimulation;
}

export interface UserSimulation {
  listUsers(): Promise<AppUser[]>;
  switchUser(userId: string): Promise<CurrentUser>;
}
