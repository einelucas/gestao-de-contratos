import type { AccessDirectory } from "@/auth/access-directory";
import type { CurrentUserProvider, UserSimulation } from "@/auth/current-user-provider";
import { DEFAULT_MOCK_USER_ID } from "@/auth/mock-users";
import type { CurrentUser } from "@/domain/user";

/** Apenas o id do usuário simulado é salvo. */
const STORAGE_KEY = "gestao-contratos.current-user";

function readUserId(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeUserId(userId: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, userId);
  } catch {
    // Sem storage: a simulação vale só até recarregar.
  }
}

/** Usuário simulado para homologação; a escolha persiste no navegador. */
export class MockCurrentUserProvider implements CurrentUserProvider {
  constructor(private readonly directory: AccessDirectory) {}

  private async load(userId: string): Promise<CurrentUser | null> {
    const user = await this.directory.getUser(userId);
    if (!user) return null;
    return { user, sectorPermissions: await this.directory.getPermissionsForUser(user.id) };
  }

  async getCurrentUser(): Promise<CurrentUser> {
    const saved = readUserId();
    const current = (saved ? await this.load(saved) : null) ?? await this.load(DEFAULT_MOCK_USER_ID);
    if (!current) throw new Error("Usuário de teste padrão não encontrado.");
    return current;
  }

  readonly simulation: UserSimulation = {
    listUsers: () => this.directory.listUsers(),
    switchUser: async (userId: string) => {
      const current = await this.load(userId);
      if (!current) throw new Error(`Usuário simulado desconhecido: ${userId}`);
      writeUserId(userId);
      return current;
    },
  };
}
