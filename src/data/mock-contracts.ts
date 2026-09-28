import type { Contract } from "@/domain/contract";

const suppliers = [
  "Alfa Engenharia e Serviços Ltda",
  "Brasil Facilities S.A.",
  "Cerrado Manutenção Industrial",
  "Delta Tecnologia Corporativa",
  "Eixo Obras e Montagens",
  "Fênix Segurança Patrimonial",
  "Gama Transportes e Logística",
  "Horizonte Soluções Ambientais",
  "Integra Energia e Automação",
  "Jatobá Suprimentos Industriais",
  "Kairós Consultoria Empresarial",
  "Leste Telecomunicações Ltda",
  "Matriz Equipamentos e Serviços",
  "Nortech Sistemas Integrados",
];

const units = ["Dourados", "Nova Mutum", "Sinop", "Campo Grande", "Sidrolândia", "Maringá"];
const descriptions = [
  "Prestação continuada de serviços técnicos especializados, incluindo atendimento, manutenção preventiva e corretiva.",
  "Fornecimento de materiais e serviços de apoio operacional para atendimento das demandas da unidade.",
  "Serviços de engenharia, inspeção e manutenção conforme escopo técnico e níveis de serviço contratados.",
  "Suporte operacional e administrativo com execução conforme cronograma e indicadores definidos em contrato.",
];

function isoDate(offsetDays: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function money(seed: number, min: number, spread: number): number {
  return Math.round((min + ((seed * 7919) % spread)) * 100) / 100;
}

export function createMockContracts(total = 137): Contract[] {
  return Array.from({ length: total }, (_, index) => {
    const id = index + 1;
    const supplier = suppliers[index % suppliers.length];
    const unit = units[(index * 3 + 1) % units.length];
    const isFinalized = index % 11 === 0;
    const hasNoEndDate = !isFinalized && index % 17 === 0;

    let endOffset: number;
    if (index % 9 === 0) endOffset = -(4 + (index % 45));
    else if (index % 7 === 0) endOffset = index % 20;
    else endOffset = 25 + ((index * 13) % 420);

    const serviceValue = money(id, 18_000, 950_000);
    const ownMaterialValue = money(id + 17, 2_000, 180_000);
    const thirdPartyMaterialValue = money(id + 37, 1_500, 220_000);

    return {
      id,
      contractNumber: `${String(1000 + id).slice(-4)}/2026`,
      supplier,
      serviceDescription: descriptions[index % descriptions.length],
      serviceValue,
      ownMaterialValue,
      thirdPartyMaterialValue,
      totalValue: serviceValue + ownMaterialValue + thirdPartyMaterialValue,
      startDate: isoDate(-60 - ((index * 9) % 500)),
      endDate: hasNoEndDate ? null : isoDate(endOffset),
      unit,
      situations: isFinalized ? ["Finalizado"] : index % 13 === 0 ? ["Em acompanhamento"] : [],
    };
  });
}
