import { MOCK_SECTORS } from "@/data/mock-sectors";
import type { Sector } from "@/domain/sector";
import type { SectorRepository } from "@/repositories/sector-repository";

export class MockSectorRepository implements SectorRepository {
  async getAll(): Promise<Sector[]> {
    return MOCK_SECTORS.map((sector) => ({ ...sector }));
  }

  async getById(id: string): Promise<Sector | null> {
    const sector = MOCK_SECTORS.find((item) => item.id === id);
    return sector ? { ...sector } : null;
  }
}
