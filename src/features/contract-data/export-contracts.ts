import type { Contract } from "@/domain/contract";
import { addDaysToIsoDate, todayIsoDate } from "@/features/contract-data/date-only";

/** Mesma ordem de campos de `Contract`, para gerar arquivos legíveis e estáveis. */
function toPlainRecord(contract: Contract): Contract {
  return {
    id: contract.id,
    contractNumber: contract.contractNumber,
    supplier: contract.supplier,
    serviceDescription: contract.serviceDescription,
    serviceValue: contract.serviceValue,
    ownMaterialValue: contract.ownMaterialValue,
    thirdPartyMaterialValue: contract.thirdPartyMaterialValue,
    totalValue: contract.totalValue,
    startDate: contract.startDate,
    endDate: contract.endDate,
    unit: contract.unit,
    situations: [...contract.situations],
  };
}

export function serializeContracts(contracts: Contract[]): string {
  return `${JSON.stringify(contracts.map(toPlainRecord), null, 2)}\n`;
}

export function exportFileName(prefix = "contratos"): string {
  return `${prefix}-${todayIsoDate()}.json`;
}

/**
 * Modelo de importação: 3 contratos válidos cobrindo vigente, atenção e
 * finalizado. As datas são relativas a hoje para que o modelo demonstre as regras.
 */
export function createContractTemplate(today = todayIsoDate()): Contract[] {
  const year = today.slice(0, 4);
  return [
    {
      id: 1,
      contractNumber: `0001/${year}`,
      supplier: "Fornecedor Exemplo Ltda",
      serviceDescription: "Prestação de serviços de manutenção preventiva e corretiva.",
      serviceValue: 250000,
      ownMaterialValue: 18000,
      thirdPartyMaterialValue: 12000,
      totalValue: 280000,
      startDate: addDaysToIsoDate(today, -120),
      endDate: addDaysToIsoDate(today, 240),
      unit: "Dourados",
      situations: [],
    },
    {
      id: 2,
      contractNumber: `0002/${year}`,
      supplier: "Serviços Modelo S.A.",
      serviceDescription: "Suporte operacional com execução conforme cronograma contratado.",
      serviceValue: 98000.5,
      ownMaterialValue: 0,
      thirdPartyMaterialValue: 4500,
      totalValue: 102500.5,
      startDate: addDaysToIsoDate(today, -350),
      endDate: addDaysToIsoDate(today, 10),
      unit: "Sinop",
      situations: ["Em acompanhamento"],
    },
    {
      id: 3,
      contractNumber: `0003/${year}`,
      supplier: "Engenharia Demonstração Ltda",
      serviceDescription: "Serviços de engenharia e inspeção técnica.",
      serviceValue: 540000,
      ownMaterialValue: 35000,
      thirdPartyMaterialValue: 60000,
      totalValue: 635000,
      startDate: addDaysToIsoDate(today, -500),
      endDate: addDaysToIsoDate(today, -30),
      unit: "Campo Grande",
      situations: ["Finalizado"],
    },
  ];
}

/** Dispara o download de um arquivo gerado localmente (nada é enviado a servidor). */
export function downloadJsonFile(fileName: string, content: string): void {
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
