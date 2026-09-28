"use client";

import { useCallback, useEffect, useState } from "react";
import type { Contract } from "@/domain/contract";
import { getContractRepository } from "@/repositories";
import type { ContractScope } from "@/repositories/contract-repository";

interface LoadedContracts {
  key: string;
  version: number;
  contracts: Contract[];
  updatedAt: Date;
}

const scopeKey = (scope: ContractScope | null) => (scope ? scope.sectorIds.join("|") : "");

/**
 * Contratos do escopo de setor atual. O filtro por setor acontece no
 * repositório: contratos fora do escopo nunca chegam aos componentes.
 */
export function useSectorContracts(scope: ContractScope | null) {
  const key = scopeKey(scope);
  const [version, setVersion] = useState(0);
  const [loaded, setLoaded] = useState<LoadedContracts | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!scope) return;
    let alive = true;
    getContractRepository().list(scope)
      .catch(() => [] as Contract[])
      .then((contracts) => { if (alive) setLoaded({ key, version, contracts, updatedAt: new Date() }); });
    return () => { alive = false; };
  }, [scope, key, version]);

  /** Relê o repositório (ex.: depois de importar ou restaurar dados). */
  const reload = useCallback(async () => { setVersion((value) => value + 1); }, []);

  /** Pede ao repositório dados novos da origem. */
  const refresh = useCallback(async () => {
    if (!scope) return;
    setRefreshing(true);
    try {
      const contracts = await getContractRepository().refresh(scope);
      setLoaded({ key, version, contracts, updatedAt: new Date() });
    } finally {
      setRefreshing(false);
    }
  }, [scope, key, version]);

  const current = loaded && loaded.key === key ? loaded : null;
  return {
    contracts: current?.contracts ?? [],
    loading: !current || current.version !== version,
    refreshing,
    lastUpdated: current?.updatedAt ?? null,
    reload,
    refresh,
  };
}

/** Quantidade de contratos por setor, para a tela de seleção. */
export function useSectorContractCounts(sectorIds: readonly string[]) {
  const key = sectorIds.join("|");
  const [loaded, setLoaded] = useState<{ key: string; counts: Record<string, number> } | null>(null);

  useEffect(() => {
    if (!key) return;
    let alive = true;
    getContractRepository().countBySector({ sectorIds: key.split("|") })
      .catch(() => ({}))
      .then((counts) => { if (alive) setLoaded({ key, counts }); });
    return () => { alive = false; };
  }, [key]);

  if (!key) return {};
  return loaded?.key === key ? loaded.counts : null;
}
