import type { Contract } from "@/domain/contract";

export interface ContractRepository {
  list(): Promise<Contract[]>;
  refresh(): Promise<Contract[]>;
}
