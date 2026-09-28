"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { parseRoute, type AppRoute } from "@/navigation/routes";

const listeners = new Set<() => void>();
/** Hash no momento em que o app abriu (capturado na primeira leitura no navegador). */
let initialHash: string | null = null;

function readHash(): string {
  if (initialHash === null) initialHash = window.location.hash;
  return window.location.hash;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("hashchange", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("hashchange", listener);
  };
}

const toPath = (hash: string) => hash.replace(/^#/, "") || "/";

export interface HashRoute {
  /** false até o primeiro render no navegador (a exportação estática não conhece o hash). */
  ready: boolean;
  route: AppRoute;
  /** true quando o app abriu sem nenhum caminho no hash. */
  openedWithoutPath: boolean;
  navigate: (path: string, options?: { replace?: boolean }) => void;
}

export function useHashRoute(): HashRoute {
  const hash = useSyncExternalStore(subscribe, readHash, () => null);

  const navigate = useCallback((next: string, options: { replace?: boolean } = {}) => {
    if (toPath(window.location.hash) === next) return;
    if (options.replace) {
      // replaceState não dispara hashchange: avisa os assinantes manualmente.
      window.history.replaceState(window.history.state, "", `#${next}`);
      listeners.forEach((listener) => listener());
    } else {
      window.location.hash = next;
    }
  }, []);

  const route = useMemo(() => parseRoute(toPath(hash ?? "")), [hash]);
  return {
    ready: hash !== null,
    route,
    openedWithoutPath: hash !== null && !toPath(initialHash ?? "").replace(/^\//, ""),
    navigate,
  };
}
