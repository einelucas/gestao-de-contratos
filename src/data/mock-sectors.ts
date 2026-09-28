import type { Sector } from "@/domain/sector";

/** Setores sintéticos de homologação — não representam a estrutura oficial. */
export const MOCK_SECTORS: Sector[] = [
  { id: "manutencao", name: "Manutenção", acronym: "MAN", active: true },
  { id: "suprimentos", name: "Suprimentos", acronym: "SUP", active: true },
  { id: "engenharia", name: "Engenharia", acronym: "ENG", active: true },
  { id: "administrativo", name: "Administrativo", acronym: "ADM", active: true },
  { id: "ti", name: "Tecnologia da Informação", acronym: "TI", active: true },
  { id: "financeiro", name: "Financeiro", acronym: "FIN", active: true },
  // Inativo: existe para testar que setores desativados não aparecem.
  { id: "qualidade", name: "Qualidade", acronym: "QUA", active: false },
];
