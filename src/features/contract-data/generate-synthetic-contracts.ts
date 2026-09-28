import type { Contract } from "@/domain/contract";
import { addDaysToIsoDate, todayIsoDate } from "@/features/contract-data/date-only";

export const SYNTHETIC_SIZES = [100, 500, 1000, 5000] as const;

const SUPPLIER_PREFIXES = [
  "Alfa", "Brasil", "Cerrado", "Delta", "Eixo", "Fênix", "Gama", "Horizonte", "Integra", "Jatobá",
  "Kairós", "Leste", "Matriz", "Nortech", "Ômega", "Pantanal", "Quantum", "Rio Verde", "Sigma", "Tropical",
  "União", "Vale", "Xingu", "Zênite",
];
const SUPPLIER_SUFFIXES = [
  "Engenharia e Serviços Ltda", "Facilities S.A.", "Manutenção Industrial", "Tecnologia Corporativa",
  "Obras e Montagens", "Segurança Patrimonial", "Transportes e Logística", "Soluções Ambientais",
  "Energia e Automação", "Suprimentos Industriais", "Consultoria Empresarial", "Telecomunicações Ltda",
];
const UNITS = [
  "Dourados", "Nova Mutum", "Sinop", "Campo Grande", "Sidrolândia", "Maringá",
  "Rondonópolis", "Chapecó", "Cascavel", "Rio Verde", "Lucas do Rio Verde", "Ponta Grossa",
];
const DESCRIPTIONS = [
  "Prestação continuada de serviços técnicos especializados, incluindo atendimento, manutenção preventiva e corretiva.",
  "Fornecimento de materiais e serviços de apoio operacional para atendimento das demandas da unidade.",
  "Serviços de engenharia, inspeção e manutenção conforme escopo técnico e níveis de serviço contratados.",
  "Suporte operacional e administrativo com execução conforme cronograma e indicadores definidos em contrato.",
  "Locação de equipamentos com operador, incluindo mobilização, desmobilização e manutenção.",
  "Serviços de limpeza, conservação e jardinagem das áreas administrativas e industriais.",
];

/** PRNG determinístico (mulberry32): o mesmo seed gera sempre o mesmo dataset. */
function createRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Gera contratos sintéticos no mesmo formato aceito pelo importador. Apenas os
 * dados brutos (datas, valores, situações) são gerados; a classificação em
 * vigente/atenção/vencido/finalizado continua a cargo de `contract-rules`.
 * Distribuição aproximada: 10% finalizados, 4% sem data, 18% vencidos,
 * 12% vencendo em até 20 dias, restante vigentes. Os contratos são divididos
 * igualmente entre os `sectorIds` informados.
 */
export function generateSyntheticContracts(total: number, sectorIds: readonly string[], seed = 20260928, today = todayIsoDate()): Contract[] {
  if (!sectorIds.length) throw new Error("Informe ao menos um setor para gerar contratos.");
  const random = createRandom(seed + total);
  const pick = <T,>(items: readonly T[]) => items[Math.floor(random() * items.length)];
  const between = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
  const money = (min: number, max: number) => Math.round((min + random() * (max - min)) * 100) / 100;

  const supplierCount = Math.min(SUPPLIER_PREFIXES.length * SUPPLIER_SUFFIXES.length, Math.max(8, Math.round(total / 3.5)));
  const suppliers = Array.from({ length: supplierCount }, (_, i) =>
    `${SUPPLIER_PREFIXES[i % SUPPLIER_PREFIXES.length]} ${SUPPLIER_SUFFIXES[Math.floor(i / SUPPLIER_PREFIXES.length) % SUPPLIER_SUFFIXES.length]}`);

  return Array.from({ length: total }, (_, index) => {
    const id = index + 1;
    const roll = random();
    let endOffset: number | null;
    let situations: string[] = [];

    if (roll < 0.10) {
      situations = ["Finalizado"];
      endOffset = -between(1, 400);
    } else if (roll < 0.14) {
      endOffset = null;
    } else if (roll < 0.32) {
      endOffset = -between(1, 240);
    } else if (roll < 0.44) {
      endOffset = between(0, 20);
    } else {
      endOffset = between(21, 900);
    }
    if (!situations.length && random() < 0.08) situations = ["Em acompanhamento"];

    const endDate = endOffset === null ? null : addDaysToIsoDate(today, endOffset);
    const startDate = addDaysToIsoDate(endDate ?? today, -between(180, 1460));
    const year = Number(startDate.slice(0, 4));

    const serviceValue = money(15_000, 1_800_000);
    const ownMaterialValue = random() < 0.3 ? 0 : money(1_000, 250_000);
    const thirdPartyMaterialValue = random() < 0.4 ? 0 : money(1_000, 300_000);

    return {
      id,
      sectorId: sectorIds[index % sectorIds.length],
      contractNumber: `${String(id).padStart(4, "0")}/${year}`,
      supplier: pick(suppliers),
      serviceDescription: pick(DESCRIPTIONS),
      serviceValue,
      ownMaterialValue,
      thirdPartyMaterialValue,
      totalValue: Math.round((serviceValue + ownMaterialValue + thirdPartyMaterialValue) * 100) / 100,
      startDate,
      endDate,
      unit: pick(UNITS),
      situations,
    };
  });
}
