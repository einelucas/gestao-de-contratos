"use client";

import { CalendarIcon, FileIcon, PinIcon, XIcon } from "@/components/icons";
import { contractKey, type ContractNotification, type ContractView } from "@/domain/contract";
import { formatDate } from "@/lib/format";

interface NotificationsPanelProps {
  notifications: ContractNotification[];
  onClose: () => void;
  onOpenContract: (contract: ContractView) => void;
  onShowExpired: () => void;
  onShowAttention: () => void;
}

export function NotificationsPanel({ notifications, onClose, onOpenContract, onShowExpired, onShowAttention }: NotificationsPanelProps) {
  const expired = notifications.filter((item) => item.contract.situation === "Vencido").length;
  const attention = notifications.filter((item) => item.contract.alert === "Atencao").length;
  return (
    <div className="panel-layer notifications-layer" role="presentation">
      <button className="panel-backdrop" type="button" onClick={onClose} aria-label="Fechar notificações" />
      <aside className="side-panel notifications-panel" aria-label="Notificações de contratos">
        <div className="panel-header compact-header">
          <div>
            <span className="eyebrow">Central de alertas</span>
            <h2>Notificações</h2>
            <p>{notifications.length} contrato(s) exigem acompanhamento.</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar notificações"><XIcon /></button>
        </div>
        <div className="notification-list">
          {notifications.length === 0 ? (
            <div className="empty-notifications">Nenhum alerta no momento.</div>
          ) : notifications.map(({ contract, kind, message }) => (
            <button key={contractKey(contract)} className="notification-card" type="button" onClick={() => onOpenContract(contract)}>
              <div className="notification-top">
                <strong title={contract.supplier}>{contract.supplier}</strong>
                <span className={`notification-kind kind-${kind.toLowerCase().replaceAll(" ", "-")}`}>{kind}</span>
              </div>
              <div className="notification-info"><FileIcon size={13}/>Contrato {contract.contractNumber}</div>
              <div className="notification-info"><CalendarIcon size={13}/>{contract.endDate ? formatDate(contract.endDate) : "Sem vigência"} • {message}</div>
              <div className="notification-info"><PinIcon size={13}/>{contract.unit}</div>
            </button>
          ))}
        </div>
        <div className="notification-actions">
          <button type="button" className="control-button subtle" onClick={onShowExpired}>Ver vencidos <strong>{expired}</strong></button>
          <button type="button" className="control-button attention" onClick={onShowAttention}>Ver atenção <strong>{attention}</strong></button>
        </div>
      </aside>
    </div>
  );
}
