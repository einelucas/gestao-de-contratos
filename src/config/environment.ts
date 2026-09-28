/**
 * Ambiente da aplicação. Em "homologacao" ficam disponíveis o simulador de
 * usuário e as ações de teste (gerar dados sintéticos, restaurar demonstração)
 * para responsáveis de setor.
 */
export type AppEnvironment = "homologacao" | "producao";

export const APP_ENVIRONMENT: AppEnvironment =
  process.env.NEXT_PUBLIC_APP_ENV === "producao" ? "producao" : "homologacao";

export function isTestEnvironment(): boolean {
  return APP_ENVIRONMENT === "homologacao";
}
