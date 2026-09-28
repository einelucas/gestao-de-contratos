"use client";

import { useState } from "react";
import { DataDialog } from "@/components/data-management/DataDialog";
import { SYNTHETIC_SIZES } from "@/features/contract-data/generate-synthetic-contracts";

interface GenerateDataDialogProps {
  onGenerate: (total: number) => void;
  onCancel: () => void;
}

export function GenerateDataDialog({ onGenerate, onCancel }: GenerateDataDialogProps) {
  const [total, setTotal] = useState<number>(SYNTHETIC_SIZES[2]);
  return (
    <DataDialog
      eyebrow="Dados"
      title="Gerar dados sintéticos"
      description="Contratos fictícios no mesmo formato do importador, distribuídos entre situações, unidades e fornecedores."
      onClose={onCancel}
      footer={(
        <>
          <button type="button" className="control-button subtle" onClick={onCancel}>Cancelar</button>
          <button type="button" className="control-button primary" onClick={() => onGenerate(total)}>Gerar</button>
        </>
      )}
    >
      <div className="size-options" role="radiogroup" aria-label="Quantidade de contratos">
        {SYNTHETIC_SIZES.map((size) => (
          <button key={size} type="button" role="radio" aria-checked={total === size} className={total === size ? "active" : ""} onClick={() => setTotal(size)}>
            <strong>{size.toLocaleString("pt-BR")}</strong>contratos
          </button>
        ))}
      </div>
      <p className="import-note">A geração é determinística: a mesma quantidade produz sempre os mesmos contratos (datas relativas a hoje).</p>
    </DataDialog>
  );
}
