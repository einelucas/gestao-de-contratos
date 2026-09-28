"use client";

import { DataDialog } from "@/components/data-management/DataDialog";

interface ImportDeniedDialogProps {
  fileName: string;
  /** Nomes dos setores sem permissão de importação. */
  sectorNames: string[];
  onClose: () => void;
}

export function ImportDeniedDialog({ fileName, sectorNames, onClose }: ImportDeniedDialogProps) {
  return (
    <DataDialog
      eyebrow="Importar JSON"
      title="Importação não permitida"
      description={fileName}
      tone="danger"
      onClose={onClose}
      footer={<button type="button" className="control-button primary" onClick={onClose}>Entendi</button>}
    >
      <p className="import-error-message">O arquivo contém contratos de setores aos quais você não possui permissão:</p>
      <ul className="import-sector-list">
        {sectorNames.map((name) => <li key={name}>{name}</li>)}
      </ul>
      <p className="import-note">Nenhum contrato foi importado e os dados atuais foram mantidos. Remova esses registros do arquivo ou solicite a importação ao responsável do setor.</p>
    </DataDialog>
  );
}
