"use client";

import type { Hex, LocalAccount } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { type CinnamonAccount, type Module, spendingLimitHookModule, toCinnamonAccount } from "./cinnamonAccount";
import { entryPoint, publicClient } from "./clients";
import { deployments } from "./deployments";
import { type KeyValueStore, getBrowserStorage, loadSignerKey } from "./signer";

/** Builds the owner LocalAccount from the key stored by the dev signer, or null if none. */
export function loadOwnerAccount(store: KeyValueStore | undefined = getBrowserStorage()): LocalAccount | null {
  const key: Hex | null = loadSignerKey(store);
  return key ? privateKeyToAccount(key) : null;
}

export type CreateCinnamonAccountParams = {
  owner: LocalAccount;
  /** Daily spending limit (wei); when set, installs the spending-limit hook. */
  dailyLimit?: bigint;
  extraModules?: Module[];
  salt?: Hex;
};

/** Creates the Cinnamon smart account wired to the app's client and deployments. */
export function createCinnamonAccount({
  owner,
  dailyLimit,
  extraModules = [],
  salt,
}: CreateCinnamonAccountParams): Promise<CinnamonAccount> {
  const modules =
    dailyLimit === undefined
      ? extraModules
      : [spendingLimitHookModule(deployments.spendingLimitHook, dailyLimit), ...extraModules];
  return toCinnamonAccount({
    client: publicClient,
    owner,
    entryPoint: entryPoint.address,
    factory: deployments.factory,
    rootValidator: deployments.ecdsaValidator,
    extraModules: modules,
    salt,
  });
}
