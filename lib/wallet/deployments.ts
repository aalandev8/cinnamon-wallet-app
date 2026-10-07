import { type Address, isAddress, isAddressEqual } from "viem";
import { entryPoint08Address } from "viem/account-abstraction";
import localDeployments from "@/lib/deployments/local.json";

export type Deployments = {
  ecdsaValidator: Address;
  entryPoint: Address;
  factory: Address;
  spendingLimitHook: Address;
};

const REQUIRED_KEYS = ["ecdsaValidator", "entryPoint", "factory", "spendingLimitHook"] as const;

/** Validates raw deployments JSON and returns typed contract addresses. */
export function parseDeployments(raw: unknown): Deployments {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error("Invalid deployments: must be a JSON object");
  }
  const record = raw as Record<string, unknown>;
  const result = {} as Deployments;

  for (const key of REQUIRED_KEYS) {
    const value = record[key];
    if (value === undefined) {
      throw new Error(`Invalid deployments: "${key}" is missing`);
    }
    if (typeof value !== "string" || !isAddress(value, { strict: false })) {
      throw new Error(`Invalid deployments: "${key}" is not a valid address (${String(value)})`);
    }
    result[key] = value;
  }

  if (!isAddressEqual(result.entryPoint, entryPoint08Address)) {
    throw new Error(
      `Invalid deployments: "entryPoint" must be EntryPoint v0.8 (${entryPoint08Address}), got ${result.entryPoint}`,
    );
  }

  return result;
}

export const deployments: Deployments = parseDeployments(localDeployments);
