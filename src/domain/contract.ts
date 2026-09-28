export type ContractSituation = "Vigente" | "Vencido" | "Sem data" | "Finalizado";
export type ContractAlert = "Regular" | "Atencao" | "Vencido" | "SemData" | "Finalizado";
export type ViewMode = "Caixas" | "Lista";
export type SortMode = "Status e vencimento" | "Nome do fornecedor" | "Vencimento mais próximo";

export interface Contract {
  id: number;
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
