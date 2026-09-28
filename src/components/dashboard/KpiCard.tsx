"use client";

import { AlertIcon, CheckIcon, FileIcon, CalendarIcon } from "@/components/icons";

type KpiKey = "Total" | "Vencidos" | "Atencao" | "Regulares" | "Finalizados";

interface KpiCardProps {
  kind: KpiKey;
  title: string;
  value: number;
  subtitle: string;
  active: boolean;
  onClick: () => void;
}

const icons = {
  Total: FileIcon,
  Vencidos: CalendarIcon,
  Atencao: AlertIcon,
  Regulares: CheckIcon,
  Finalizados: CheckIcon,
};

export function KpiCard({ kind, title, value, subtitle, active, onClick }: KpiCardProps) {
  const Icon = icons[kind];
  return (
    <button
      type="button"
      className={`kpi-card kpi-${kind.toLowerCase()} ${active ? "is-active" : ""}`}
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${active ? "Filtro ativo" : "Filtrar por"} ${title}. ${value} contratos.`}
    >
      <span className="kpi-icon"><Icon size={22} /></span>
      <span className="kpi-copy">
        <span className="kpi-title">{title}</span>
        <strong className="kpi-value">{value}</strong>
        <span className="kpi-subtitle">{subtitle}</span>
      </span>
    </button>
  );
}
