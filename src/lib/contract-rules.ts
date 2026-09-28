import type {
  Contract,
  ContractAlert,
  ContractNotification,
  ContractSituation,
  ContractView,
  SortMode,
} from "@/domain/contract";

const DAY_MS = 86_400_000;

export function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function parseDateOnly(value: string | null): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function differenceInDays(from: Date, to: Date): number {
  const a = new Date(from); a.setHours(0, 0, 0, 0);
  const b = new Date(to); b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

export function deriveSituation(contract: Contract, today = startOfToday()): ContractSituation {
  if (contract.situations.some((item) => item.trim().toLowerCase() === "finalizado")) return "Finalizado";
  const end = parseDateOnly(contract.endDate);
  if (!end) return "Sem data";
  if (end < today) return "Vencido";
  return "Vigente";
}

export function deriveAlert(
  situation: ContractSituation,
  endDate: string | null,
  attentionDays = 20,
  today = startOfToday(),
): ContractAlert {
  if (situation === "Finalizado") return "Finalizado";
  if (situation === "Sem data") return "SemData";
  if (situation === "Vencido") return "Vencido";
  const end = parseDateOnly(endDate);
  if (end && differenceInDays(today, end) <= attentionDays) return "Atencao";
  return "Regular";
}

export function decorateContract(contract: Contract, attentionDays = 20, today = startOfToday()): ContractView {
  const situation = deriveSituation(contract, today);
  const end = parseDateOnly(contract.endDate);
  const daysToEnd = end ? differenceInDays(today, end) : null;
  return {
    ...contract,
    situation,
    alert: deriveAlert(situation, contract.endDate, attentionDays, today),
    daysToEnd,
  };
}

export function sortContracts(items: ContractView[], mode: SortMode): ContractView[] {
  const statusOrder = (item: ContractView) => {
    if (item.situation === "Vencido") return 1;
    if (item.alert === "Atencao") return 2;
    if (item.situation === "Sem data") return 3;
    if (item.alert === "Regular") return 4;
    return 5;
  };
  const endTime = (item: ContractView) => parseDateOnly(item.endDate)?.getTime() ?? new Date(2999, 11, 31).getTime();
  const bySupplier = (a: ContractView, b: ContractView) => a.supplier.localeCompare(b.supplier, "pt-BR", { sensitivity: "base" });

  return [...items].sort((a, b) => {
    if (mode === "Nome do fornecedor") return bySupplier(a, b);
    if (mode === "Vencimento mais próximo") return endTime(a) - endTime(b) || bySupplier(a, b);
    return statusOrder(a) - statusOrder(b) || endTime(a) - endTime(b) || bySupplier(a, b);
  });
}

export function buildNotifications(items: ContractView[], attentionDays = 20): ContractNotification[] {
  const today = startOfToday();
  return items
    .filter((item) => {
      if (item.situation === "Finalizado") return false;
      if (item.situation === "Vencido" || item.situation === "Sem data") return true;
      const end = parseDateOnly(item.endDate);
      if (!end) return false;
      const days = differenceInDays(today, end);
      return days >= 0 && days <= attentionDays;
    })
    .map((contract) => {
      const days = contract.daysToEnd;
      if (contract.situation === "Sem data") return { contract, kind: "Sem data" as const, message: "Vigência não informada", priority: 5 };
      if (contract.situation === "Vencido") return { contract, kind: "Vencido" as const, message: `${Math.abs(days ?? 0)} dias em atraso`, priority: 3 };
      if (days === 0) return { contract, kind: "Vence hoje" as const, message: "Vence hoje", priority: 1 };
      if (days === 1) return { contract, kind: "Urgente" as const, message: "Vence amanhã", priority: 2 };
      if ((days ?? 99) <= 5) return { contract, kind: "Urgente" as const, message: `Vence em ${days} dias`, priority: 2 };
      return { contract, kind: "Atenção" as const, message: `Vence em ${days} dias`, priority: 4 };
    })
    .sort((a, b) => a.priority - b.priority || (a.contract.daysToEnd ?? 9999) - (b.contract.daysToEnd ?? 9999));
}
