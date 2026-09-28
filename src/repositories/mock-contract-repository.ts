import { createMockContracts } from "@/data/mock-contracts";
import type { Contract } from "@/domain/contract";
import type { ContractRepository } from "@/repositories/contract-repository";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockContractRepository implements ContractRepository {
  private data: Contract[] = createMockContracts();

  async list(): Promise<Contract[]> {
    await wait(180);
    return this.data.map((item) => ({ ...item, situations: [...item.situations] }));
  }

  async refresh(): Promise<Contract[]> {
    await wait(520);
    this.data = createMockContracts();
    return this.list();
  }
}
