"use client";

import { useMemo, useState, useSyncExternalStore, type FormEvent } from "react";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { Button } from "@/components/Button";
import { KeyIcon } from "@/components/icons";
import {
  SIGNER_STORAGE_KEY,
  getBrowserStorage,
  loadSignerKey,
  normalizePrivateKey,
  removeSignerKey,
  saveSignerKey,
} from "@/lib/wallet/signer";
import type { Hex } from "viem";

const listeners = new Set<() => void>();

function notify() {
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

export function SignerPanel() {
  const privateKey = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const address = useMemo(() => (privateKey ? privateKeyToAccount(privateKey).address : null), [privateKey]);
  const [importValue, setImportValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function store(key: Hex) {
    if (!saveSignerKey(getBrowserStorage(), key)) {
      setError("Could not write to localStorage. Is storage blocked in this browser?");
      return;
    }
    setError(null);
    setImportValue("");
    notify();
  }

  function onImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      store(normalizePrivateKey(importValue));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid private key");
    }
  }

  function onClear() {
    if (!window.confirm("Delete the signer key from this browser? This cannot be undone.")) return;
    removeSignerKey(getBrowserStorage());
    setError(null);
    notify();
  }

  return (
    <section
      aria-labelledby="signer-title"
      className="w-full max-w-xl rounded-card bg-surface p-6 outline-cel shadow-soft md:p-8"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 id="signer-title" className="flex items-center gap-2 font-display text-2xl font-semibold">
          <KeyIcon className="size-6" aria-hidden />
          Signer
        </h2>
        <span className="rounded-chip bg-danger px-3 py-1 font-display text-sm font-semibold text-on-danger">
          DEV ONLY
        </span>
      </div>
      <p className="mt-3 text-muted">
        The private key is stored unencrypted in this browser&apos;s localStorage. Never use it for real funds.
      </p>

      {address ? (
        <div className="mt-6">
          <p className="text-sm font-semibold text-muted">Signer address</p>
          <p className="mt-1 break-all rounded-chip bg-surface-sunken px-3 py-2 font-mono text-sm" data-testid="signer-address">
            {address}
          </p>
          <Button variant="secondary" className="mt-6" onClick={onClear}>
            Reset key
          </Button>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-6">
          <Button onClick={() => store(generatePrivateKey())}>Generate new key</Button>
          <form onSubmit={onImport} className="flex flex-col gap-3">
            <label htmlFor="import-key" className="text-sm font-semibold text-muted">
              Or import an existing private key
            </label>
            <input
              id="import-key"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder="0x… (64 hex characters)"
              value={importValue}
              onChange={(event) => setImportValue(event.target.value)}
              className="rounded-chip bg-surface-sunken px-3 py-2 font-mono text-sm outline-cel"
            />
            <Button type="submit" variant="secondary" disabled={!importValue.trim()}>
              Import key
            </Button>
          </form>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 text-danger-ink">
          {error}
        </p>
      )}
    </section>
  );
}
