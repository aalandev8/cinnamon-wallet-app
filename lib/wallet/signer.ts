import type { Hex } from "viem";

/** DEV ONLY: the signer key is stored unencrypted in localStorage. */
export const SIGNER_STORAGE_KEY = "cinnamon.signer.v1";

const STORAGE_VERSION = 1;

export type KeyValueStore = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type StoredSigner = { v: number; privateKey: string };

/** Validates and normalizes a private key to lowercase 0x-prefixed 32-byte hex. */
export function normalizePrivateKey(input: string): Hex {
  const raw = input.trim().toLowerCase();
  const hex = raw.startsWith("0x") ? raw.slice(2) : raw;
  if (!/^[0-9a-f]{64}$/.test(hex)) {
    throw new Error("Invalid private key: expected 32-byte hex (64 characters)");
  }
  if (/^0+$/.test(hex)) {
    throw new Error("Invalid private key: zero key is not allowed");
  }
  return `0x${hex}`;
}

export function serializeSigner(privateKey: Hex): string {
  const payload: StoredSigner = { v: STORAGE_VERSION, privateKey };
  return JSON.stringify(payload);
}

/** Parses a stored payload, returning null for anything missing or invalid. */
export function parseStoredSigner(raw: string | null): Hex | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredSigner> | null;
    if (parsed?.v !== STORAGE_VERSION || typeof parsed.privateKey !== "string") return null;
    return normalizePrivateKey(parsed.privateKey);
  } catch {
    return null;
  }
}

/** Returns window.localStorage, or undefined during SSR or when access is blocked. */
export function getBrowserStorage(): KeyValueStore | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

export function loadSignerKey(store: KeyValueStore | undefined): Hex | null {
  if (!store) return null;
  try {
    return parseStoredSigner(store.getItem(SIGNER_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function saveSignerKey(store: KeyValueStore | undefined, privateKey: Hex): boolean {
  if (!store) return false;
  try {
    store.setItem(SIGNER_STORAGE_KEY, serializeSigner(privateKey));
    return true;
  } catch {
    return false;
  }
}

export function removeSignerKey(store: KeyValueStore | undefined): boolean {
  if (!store) return false;
  try {
    store.removeItem(SIGNER_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
