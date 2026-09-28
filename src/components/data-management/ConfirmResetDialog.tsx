"use client";

import { DataDialog } from "@/components/data-management/DataDialog";
import type { DatasetInfo } from "@/repositories/contract-dataset-store";

interface ConfirmResetDialogProps {
  info: DatasetInfo;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmResetDialog({ info, busy, onConfirm, onCancel }: ConfirmResetDialogProps) {
  return (
    <DataDialog
      eyebrow="Dados"
      title="Restaurar dados de demonstração?"
      tone="danger"
      onClose={onCancel}
      footer={(
        <>
          <button type="button" className="control-button subtle" onClick={onCancel} disabled={busy}>Cancelar</button>
          <button type="button" className="control-button danger" onClick={onConfirm} disabled={busy}>Apagar e restaurar</button>
        </>
      )}
    >
      <p className="import-error-message">
        O dataset atual (<strong>{info.label}</strong>) será apagado deste navegador e os contratos de demonstração voltarão a ser exibidos.
      </p>
      <p className="import-note">Se quiser guardar os dados atuais, use “Exportar dados atuais” antes de continuar.</p>
    </DataDialog>
  );
}
