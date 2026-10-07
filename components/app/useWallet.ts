"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { Hex, LocalAccount } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { createCinnamonAccount } from "@/lib/wallet/account";
import type { CinnamonAccount } from "@/lib/wallet/cinnamonAccount";
import { SIGNER_STORAGE_KEY, getBrowserStorage, loadSignerKey } from "@/lib/wallet/signer";

const listeners = new Set<() => void>();

/** Notifies subscribers that the stored signer key changed in this tab. */
export function notifySignerChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === SIGNER_STORAGE_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => loadSignerKey(getBrowserStorage());
const getServerSnapshot = () => null;

/** The stored signer private key, or null. Re-renders on changes. */
export function useSignerKey(): Hex | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** The owner LocalAccount derived from the stored signer, or null. */
export function useOwner(): LocalAccount | null {
  const key = useSignerKey();
  return useMemo(() => (key ? privateKeyToAccount(key) : null), [key]);
}

export type WalletState = {
  owner: LocalAccount | null;
  account: CinnamonAccount | null;
  error: string | null;
};

/** Owner plus the Cinnamon smart account built for it. */
export function useWallet(): WalletState {
  const owner = useOwner();
  const [result, setResult] = useState<{ owner: LocalAccount; account: CinnamonAccount | null; error: string | null } | null>(
    null,
  );

  useEffect(() => {
    if (!owner) return;
    let cancelled = false;
    createCinnamonAccount({ owner }).then(
      (account) => !cancelled && setResult({ owner, account, error: null }),
      (err: unknown) =>
        !cancelled &&
        setResult({ owner, account: null, error: err instanceof Error ? err.message : "Could not load account" }),
    );
    return () => {
      cancelled = true;
    };
  }, [owner]);

  const current = owner && result?.owner === owner ? result : null;
  return { owner, account: current?.account ?? null, error: current?.error ?? null };
}
