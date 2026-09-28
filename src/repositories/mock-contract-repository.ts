import { createMockContracts } from "@/data/mock-contracts";
import type { Contract } from "@/domain/contract";
import { countContractsBySector, inScope, type ContractRepository, type ContractScope } from "@/repositories/contract-repository";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockContractRepository implements ContractRepository {
  private data: Contract[] = createMockContracts();

  async list(scope: ContractScope): Promise<Contract[]> {
    await wait(180);
    return this.data.filter(inScope(scope)).map((item) => ({ ...item, situations: [...item.situations] }));
  }

  async refresh(scope: ContractScope): Promise<Contract[]> {
    await wait(520);
    this.data = createMockContracts();
    return this.list(scope);
  }

  async countBySector(scope: ContractScope): Promise<Record<string, number>> {
    return countContractsBySector(this.data.filter(inScope(scope)));
  }
}
