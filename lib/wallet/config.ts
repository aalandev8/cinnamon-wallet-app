export const DEFAULT_CHAIN_ID = 31337;
export const DEFAULT_RPC_URL = "http://127.0.0.1:8545";
export const DEFAULT_BUNDLER_URL = "http://127.0.0.1:4337";

export type RawWalletEnv = {
  chainId?: string;
  rpcUrl?: string;
  bundlerUrl?: string;
};

export type WalletConfig = {
  chainId: number;
  rpcUrl: string;
  bundlerUrl: string;
};

function pick(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function parseUrl(name: string, value: string | undefined, fallback: string): string {
  const url = pick(value) ?? fallback;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid ${name}: "${url}" is not a valid URL`);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Invalid ${name}: "${url}" must use http or https`);
  }
  return url;
}

function parseChainId(value: string | undefined): number {
  const raw = pick(value);
  if (raw === undefined) return DEFAULT_CHAIN_ID;
  const id = Number(raw);
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(id) || id <= 0) {
    throw new Error(`Invalid NEXT_PUBLIC_CHAIN_ID: "${raw}" must be a positive integer`);
  }
  return id;
}

/** Parses wallet env values, applying local Anvil/Alto defaults. */
export function parseWalletEnv(env: RawWalletEnv): WalletConfig {
  return {
    chainId: parseChainId(env.chainId),
    rpcUrl: parseUrl("NEXT_PUBLIC_RPC_URL", env.rpcUrl, DEFAULT_RPC_URL),
    bundlerUrl: parseUrl("NEXT_PUBLIC_BUNDLER_URL", env.bundlerUrl, DEFAULT_BUNDLER_URL),
  };
}

// Static references so Next.js inlines NEXT_PUBLIC_* values at build time.
export const walletConfig: WalletConfig = parseWalletEnv({
  chainId: process.env.NEXT_PUBLIC_CHAIN_ID,
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL,
  bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL,
});
