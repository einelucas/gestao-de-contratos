"use client";

import { useEffect, useState } from "react";
import { getAccessDirectory } from "@/auth";
import type { AppUser, SectorPermission } from "@/domain/user";

export interface AccessDirectorySnapshot {
  users: AppUser[];
  permissions: SectorPermission[];
}

/** Usuários e permissões cadastrados (responsáveis por setor, simulador). null enquanto carrega. */
export function useAccessDirectory(): AccessDirectorySnapshot | null {
  const [snapshot, setSnapshot] = useState<AccessDirectorySnapshot | null>(null);

  useEffect(() => {
    let alive = true;
    const directory = getAccessDirectory();
    Promise.all([directory.listUsers(), directory.listSectorPermissions()])
      .then(([users, permissions]) => { if (alive) setSnapshot({ users, permissions }); })
      .catch(() => { if (alive) setSnapshot({ users: [], permissions: [] }); });
    return () => { alive = false; };
  }, []);

  return snapshot;
}
