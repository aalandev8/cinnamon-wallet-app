"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { Hex, LocalAccount } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { createCinnamonAccount } from "@/lib/wallet/account";
import type { CinnamonAccount } from "@/lib/wallet/cinnamonAccount";
import { DEFAULT_DAILY_LIMIT } from "@/lib/wallet/spendingLimit";
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
    createCinnamonAccount({ owner, dailyLimit: DEFAULT_DAILY_LIMIT }).then(
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

let accountVersion = 0;
const accountListeners = new Set<() => void>();

/** Signals that on-chain account state changed (e.g. after a send) so views refetch. */
export function notifyAccountChange() {
  accountVersion += 1;
  accountListeners.forEach((listener) => listener());
}

function subscribeAccount(listener: () => void) {
  accountListeners.add(listener);
  return () => {
    accountListeners.delete(listener);
  };
}

/** A counter that increments on every notifyAccountChange(). */
export function useAccountVersion(): number {
  return useSyncExternalStore(subscribeAccount, () => accountVersion, () => 0);
}
