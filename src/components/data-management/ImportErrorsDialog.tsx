"use client";

import { DataDialog } from "@/components/data-management/DataDialog";
import { ImportIssuesList } from "@/components/data-management/ImportIssuesList";
import type { RecordIssue } from "@/features/contract-data/contract-import.types";

interface ImportErrorsDialogProps {
  fileName: string;
  error: string;
  issues: RecordIssue[];
  onRetry: () => void;
  onClose: () => void;
}

export function ImportErrorsDialog({ fileName, error, issues, onRetry, onClose }: ImportErrorsDialogProps) {
  return (
    <DataDialog
      eyebrow="Importar JSON"
      title="Não foi possível importar o arquivo"
      description={fileName}
      tone="danger"
      onClose={onClose}
      footer={(
        <>
          <button type="button" className="control-button subtle" onClick={onClose}>Fechar</button>
          <button type="button" className="control-button primary" onClick={onRetry}>Escolher outro arquivo</button>
        </>
      )}
    >
      <p className="import-error-message">{error}</p>
      <ImportIssuesList issues={issues} />
      <p className="import-note">Os dados atuais foram mantidos. Use “Baixar modelo JSON” para ver a estrutura aceita.</p>
    </DataDialog>
  );
}
