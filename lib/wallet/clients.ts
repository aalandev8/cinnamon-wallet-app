"use client";

import { createPublicClient, defineChain, http } from "viem";
import { createBundlerClient } from "viem/account-abstraction";
import { walletConfig } from "./config";
import { deployments } from "./deployments";

export const chain = defineChain({
  id: walletConfig.chainId,
  name: walletConfig.chainId === 31337 ? "Anvil" : `Chain ${walletConfig.chainId}`,
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [walletConfig.rpcUrl] } },
});

export const publicClient = createPublicClient({
  chain,
  transport: http(walletConfig.rpcUrl),
});

export const bundlerClient = createBundlerClient({
  client: publicClient,
  chain,
  transport: http(walletConfig.bundlerUrl),
});

export const entryPoint = {
  address: deployments.entryPoint,
  version: "0.8",
} as const;
