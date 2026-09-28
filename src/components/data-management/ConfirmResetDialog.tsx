"use client";

import { DataDialog } from "@/components/data-management/DataDialog";

interface ConfirmResetDialogProps {
  /** Setor (ou "todos os setores") que será restaurado. */
  scopeLabel: string;
  /** Datasets locais que serão apagados, já descritos. */
  sources: string[];
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmResetDialog({ scopeLabel, sources, busy, onConfirm, onCancel }: ConfirmResetDialogProps) {
  return (
    <DataDialog
      eyebrow="Dados"
      title={`Restaurar os dados de demonstração de ${scopeLabel}?`}
      tone="danger"
      onClose={onCancel}
      footer={(
        <>
          <button type="button" className="control-button subtle" onClick={onCancel} disabled={busy}>Cancelar</button>
          <button type="button" className="control-button danger" onClick={onConfirm} disabled={busy}>Restaurar</button>
        </>
      )}
    >
      <p className="import-error-message">
        Os dados importados atualmente para {sources.length > 1 ? "estes setores" : "este setor"} serão substituídos pelos dados de demonstração. Os demais setores não mudam.
      </p>
      <ul className="import-sector-list">
        {sources.map((source) => <li key={source}>{source}</li>)}
      </ul>
      <p className="import-note">Se quiser guardar os dados atuais, exporte-os antes de continuar.</p>
    </DataDialog>
  );
}
