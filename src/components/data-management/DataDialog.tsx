"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { XIcon } from "@/components/icons";

interface DataDialogProps {
  eyebrow: string;
  title: string;
  description?: string;
  tone?: "default" | "danger";
  children?: ReactNode;
  footer: ReactNode;
  onClose: () => void;
}

export function DataDialog({ eyebrow, title, description, tone = "default", children, footer, onClose }: DataDialogProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onCloseRef.current(); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="data-dialog-layer" role="presentation">
      <button className="data-dialog-backdrop" type="button" onClick={onClose} aria-label="Fechar" tabIndex={-1} />
      <div className={`data-dialog tone-${tone}`} role="dialog" aria-modal="true" aria-labelledby="data-dialog-title" tabIndex={-1} ref={dialogRef}>
        <div className="data-dialog-header">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2 id="data-dialog-title">{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar"><XIcon /></button>
        </div>
        {children && <div className="data-dialog-body">{children}</div>}
        <div className="data-dialog-footer">{footer}</div>
      </div>
    </div>
  );
}
