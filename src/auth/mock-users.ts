import type { AppUser, SectorPermission } from "@/domain/user";

/** Usuários fictícios SOMENTE para homologação. Não representam pessoas reais. */
export const MOCK_USERS: AppUser[] = [
  { id: "viewer-manutencao", name: "Consulta Manutenção", email: "viewer.manutencao@teste.local", role: "viewer" },
  { id: "viewer-man-eng", name: "Consulta Manutenção e Engenharia", email: "viewer.man-eng@teste.local", role: "viewer" },
  { id: "manager-manutencao", name: "Responsável Manutenção", email: "manager.manutencao@teste.local", role: "sector-manager" },
  { id: "manager-manutencao-2", name: "Substituto Manutenção", email: "substituto.manutencao@teste.local", role: "sector-manager" },
  { id: "manager-suprimentos", name: "Responsável Suprimentos", email: "manager.suprimentos@teste.local", role: "sector-manager" },
  { id: "manager-engenharia", name: "Responsável Engenharia", email: "manager.engenharia@teste.local", role: "sector-manager" },
  { id: "manager-adm-fin", name: "Responsável Administrativo e Financeiro", email: "manager.adm-fin@teste.local", role: "sector-manager" },
  { id: "manager-ti", name: "Responsável TI", email: "manager.ti@teste.local", role: "sector-manager" },
  // Acesso global vem do papel `admin` (camada de autorização), não de permissões por setor.
  { id: "admin", name: "Administrador", email: "admin@teste.local", role: "admin" },
];

const view = (userId: string, sectorId: string): SectorPermission => ({ userId, sectorId, canView: true, canImport: false });
const manage = (userId: string, sectorId: string): SectorPermission => ({ userId, sectorId, canView: true, canImport: true });

/**
 * Associações usuário ↔ setor. Todo setor ativo tem ao menos um responsável
 * (`canImport`); Manutenção tem dois (titular e substituto).
 */
export const MOCK_SECTOR_PERMISSIONS: SectorPermission[] = [
  view("viewer-manutencao", "manutencao"),
  view("viewer-man-eng", "manutencao"),
  view("viewer-man-eng", "engenharia"),
  manage("manager-manutencao", "manutencao"),
  manage("manager-manutencao-2", "manutencao"),
  manage("manager-suprimentos", "suprimentos"),
  manage("manager-engenharia", "engenharia"),
  manage("manager-adm-fin", "administrativo"),
  manage("manager-adm-fin", "financeiro"),
  manage("manager-ti", "ti"),
];

export const DEFAULT_MOCK_USER_ID = "admin";
