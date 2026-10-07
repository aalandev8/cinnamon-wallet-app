import { describe, expect, it } from "vitest";
import {
  SIGNER_STORAGE_KEY,
  loadSignerKey,
  normalizePrivateKey,
  parseStoredSigner,
  removeSignerKey,
  saveSignerKey,
  serializeSigner,
  type KeyValueStore,
} from "./signer";

const KEY = `0x${"ab".repeat(32)}` as const;

function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

const throwingStore: KeyValueStore = {
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("blocked");
  },
  removeItem: () => {
    throw new Error("blocked");
  },
};

describe("normalizePrivateKey", () => {
  it("accepts a 0x-prefixed 32-byte hex key", () => {
    expect(normalizePrivateKey(KEY)).toBe(KEY);
  });

  it("adds the 0x prefix, trims and lowercases", () => {
    expect(normalizePrivateKey(`  ${"AB".repeat(32)} `)).toBe(KEY);
  });

  it("rejects wrong length", () => {
    expect(() => normalizePrivateKey("0x1234")).toThrow(/32-byte/);
  });

  it("rejects non-hex characters", () => {
    expect(() => normalizePrivateKey(`0x${"zz".repeat(32)}`)).toThrow(/32-byte/);
  });

  it("rejects the zero key", () => {
    expect(() => normalizePrivateKey(`0x${"00".repeat(32)}`)).toThrow(/zero/);
  });
});

describe("serializeSigner / parseStoredSigner", () => {
  it("round-trips a key", () => {
    expect(parseStoredSigner(serializeSigner(KEY))).toBe(KEY);
  });

  it("returns null for missing, malformed or invalid payloads", () => {
    expect(parseStoredSigner(null)).toBeNull();
    expect(parseStoredSigner("not json")).toBeNull();
    expect(parseStoredSigner(JSON.stringify({ v: 1, privateKey: "0x12" }))).toBeNull();
    expect(parseStoredSigner(JSON.stringify({ v: 2, privateKey: KEY }))).toBeNull();
  });
});

describe("storage helpers", () => {
  it("saves, loads and removes the key", () => {
    const store = memoryStore();
    expect(saveSignerKey(store, KEY)).toBe(true);
    expect(store.data.has(SIGNER_STORAGE_KEY)).toBe(true);
    expect(loadSignerKey(store)).toBe(KEY);
    expect(removeSignerKey(store)).toBe(true);
    expect(loadSignerKey(store)).toBeNull();
  });

  it("handles a missing store (SSR)", () => {
    expect(loadSignerKey(undefined)).toBeNull();
    expect(saveSignerKey(undefined, KEY)).toBe(false);
    expect(removeSignerKey(undefined)).toBe(false);
  });

  it("swallows storage errors", () => {
    expect(loadSignerKey(throwingStore)).toBeNull();
    expect(saveSignerKey(throwingStore, KEY)).toBe(false);
    expect(removeSignerKey(throwingStore)).toBe(false);
  });
});
