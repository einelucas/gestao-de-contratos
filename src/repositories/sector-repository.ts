import type { Sector } from "@/domain/sector";

export interface SectorRepository {
  /** Todos os setores cadastrados, inclusive inativos. */
  getAll(): Promise<Sector[]>;
  getById(id: string): Promise<Sector | null>;
}
