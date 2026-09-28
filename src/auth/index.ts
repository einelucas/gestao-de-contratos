import { MockAccessDirectory, type AccessDirectory } from "@/auth/access-directory";
import type { CurrentUserProvider } from "@/auth/current-user-provider";
import { MockCurrentUserProvider } from "@/auth/mock-current-user-provider";

let directory: AccessDirectory | null = null;
let currentUserProvider: CurrentUserProvider | null = null;

const authProvider = () => process.env.NEXT_PUBLIC_AUTH_PROVIDER ?? "mock";

export function getAccessDirectory(): AccessDirectory {
  if (directory) return directory;
  switch (authProvider()) {
    case "mock":
    default:
      directory = new MockAccessDirectory();
      return directory;
  }
}

export function getCurrentUserProvider(): CurrentUserProvider {
  if (currentUserProvider) return currentUserProvider;
  // Futuro: case "entra": currentUserProvider = new EntraCurrentUserProvider(...);
  switch (authProvider()) {
    case "mock":
    default:
      currentUserProvider = new MockCurrentUserProvider(getAccessDirectory());
      return currentUserProvider;
  }
}
