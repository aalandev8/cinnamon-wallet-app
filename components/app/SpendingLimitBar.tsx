"use client";

import { useEffect, useState } from "react";
import type { Address } from "viem";
import { publicClient } from "@/lib/wallet/clients";
import { deployments } from "@/lib/wallet/deployments";
import { formatEthBalance } from "@/lib/wallet/accountStatus";
import { limitProgress, spendingLimitAbi, spentToday } from "@/lib/wallet/spendingLimit";

type Limits = { limit: bigint; spent: bigint };

async function fetchLimits(account: Address): Promise<Limits> {
  const read = (functionName: "limit" | "epoch" | "spent") =>
    publicClient.readContract({ address: deployments.spendingLimitHook, abi: spendingLimitAbi, functionName, args: [account] });
  const [limit, epoch, spent, block] = await Promise.all([
    read("limit"),
    read("epoch"),
    read("spent"),
    publicClient.getBlock(),
  ]);
  return { limit, spent: spentToday({ epoch, spent, timestamp: block.timestamp }) };
}

/** Daily spending limit progress for the given account, refetched whenever `version` changes. */
export function SpendingLimitBar({ address, version, fallbackLimit }: { address: Address; version: number; fallbackLimit: bigint }) {
  const [state, setState] = useState<{ key: string; limits: Limits | null; error: boolean } | null>(null);
  const key = `${address}:${version}`;

  useEffect(() => {
    let cancelled = false;
    fetchLimits(address).then(
      (limits) => !cancelled && setState({ key, limits, error: false }),
      () => !cancelled && setState({ key, limits: null, error: true }),
    );
    return () => {
      cancelled = true;
    };
  }, [address, key]);

  const current = state?.key === key ? state : null;
  if (current?.error) return <p className="text-sm text-muted">Could not load the daily limit.</p>;

  // Before first deployment the hook is not installed yet, so its limit reads as zero.
  const limits = current?.limits;
  const limit = limits && limits.limit > BigInt(0) ? limits.limit : fallbackLimit;
  const spent = limits?.spent ?? BigInt(0);
  const progress = limitProgress(spent, limit);

  return (
    <div data-testid="spending-limit">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span className="font-semibold text-muted">Spent today</span>
        <span className="font-mono" data-testid="spent-today">
          {limits ? `${formatEthBalance(spent)} / ${formatEthBalance(limit)}` : "Loading…"}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Daily spending limit used"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress.percent}
        className="mt-2 h-3 w-full overflow-hidden rounded-chip bg-surface-sunken"
      >
        <div
          className={`h-full transition-[width] ${progress.reached ? "bg-danger" : "bg-primary"}`}
          style={{ width: `${progress.percent}%` }}
        />
      </div>
    </div>
  );
}
