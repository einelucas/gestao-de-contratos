"use client";

import { isTestEnvironment } from "@/config/environment";

/** Indicação sutil de que as permissões são simuladas (somente homologação). */
export function HomologationBadge({ compact = false }: { compact?: boolean }) {
  if (!isTestEnvironment()) return null;
  return (
    <span className={`homologation-badge ${compact ? "is-compact" : ""}`} title="As permissões são simuladas no navegador e não representam segurança real.">
      {compact ? "Homologação" : "Ambiente de homologação • permissões simuladas"}
    </span>
  );
}
