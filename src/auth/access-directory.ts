import { MOCK_SECTOR_PERMISSIONS, MOCK_USERS } from "@/auth/mock-users";
import type { AppUser, SectorPermission } from "@/domain/user";

/**
 * Cadastro de usuários e permissões por setor. Futuro: grupos do Entra ID,
 * uma lista do SharePoint ou uma API de acessos.
 */
export interface AccessDirectory {
  listUsers(): Promise<AppUser[]>;
  listSectorPermissions(): Promise<SectorPermission[]>;
  getUser(userId: string): Promise<AppUser | null>;
  getPermissionsForUser(userId: string): Promise<SectorPermission[]>;
}

export class MockAccessDirectory implements AccessDirectory {
  async listUsers(): Promise<AppUser[]> {
    return MOCK_USERS.map((user) => ({ ...user }));
  }

  async listSectorPermissions(): Promise<SectorPermission[]> {
    return MOCK_SECTOR_PERMISSIONS.map((permission) => ({ ...permission }));
  }

  async getUser(userId: string): Promise<AppUser | null> {
    const user = MOCK_USERS.find((item) => item.id === userId);
    return user ? { ...user } : null;
  }

  async getPermissionsForUser(userId: string): Promise<SectorPermission[]> {
    return MOCK_SECTOR_PERMISSIONS.filter((item) => item.userId === userId).map((item) => ({ ...item }));
  }
}
