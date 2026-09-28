export type ContractSituation = "Vigente" | "Vencido" | "Sem data" | "Finalizado";
export type ContractAlert = "Regular" | "Atencao" | "Vencido" | "SemData" | "Finalizado";
export type ViewMode = "Caixas" | "Lista";
export type SortMode = "Status e vencimento" | "Nome do fornecedor" | "Vencimento mais próximo";

export interface Contract {
  id: number;
  /** Setor dono do contrato (`Sector.id`). */
  sectorId: string;
  contractNumber: string;
  supplier: string;
  serviceDescription: string;
  serviceValue: number;
  ownMaterialValue: number;
  thirdPartyMaterialValue: number;
  totalValue: number;
  startDate: string | null;
  endDate: string | null;
  unit: string;
  situations: string[];
}

/** `id` é único apenas dentro do setor; use esta chave ao misturar setores. */
export function contractKey(contract: Pick<Contract, "id" | "sectorId">): string {
  return `${contract.sectorId}:${contract.id}`;
}

export interface ContractView extends Contract {
  situation: ContractSituation;
  alert: ContractAlert;
  daysToEnd: number | null;
}

export type NotificationKind = "Sem data" | "Vencido" | "Vence hoje" | "Urgente" | "Atenção";

export interface ContractNotification {
  contract: ContractView;
  kind: NotificationKind;
  message: string;
  priority: number;
}
