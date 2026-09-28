"use client";

import { useSyncExternalStore } from "react";

/** Aviso exibido na seleção de setor depois de um redirecionamento (ex.: acesso negado). */
let notice: string | null = null;
const listeners = new Set<() => void>();

export function setSectorNotice(value: string | null): void {
  if (notice === value) return;
  notice = value;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function useSectorNotice(): string | null {
  return useSyncExternalStore(subscribe, () => notice, () => null);
}
