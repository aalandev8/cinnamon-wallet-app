"use client";

import { useCallback, useEffect, useState } from "react";
import type { Address } from "viem";
import { Button } from "@/components/Button";
import { ShieldIcon } from "@/components/icons";
import { useAccountVersion, useWallet } from "@/components/app/useWallet";
import { computeFundedBalance, formatEthBalance, isDeployedCode, toRpcQuantity } from "@/lib/wallet/accountStatus";
import { publicClient } from "@/lib/wallet/clients";

type Status = { address: Address; deployed: boolean; balance: bigint };

async function fetchStatus(address: Address): Promise<Status> {
  const [code, balance] = await Promise.all([
    publicClient.getCode({ address }),
    publicClient.getBalance({ address }),
  ]);
  return { address, deployed: isDeployedCode(code), balance };
}

function message(err: unknown, fallback: string) {
  return err instanceof Error ? err.message.split("\n")[0] : fallback;
}

export function AccountCard() {
  const { owner, account, error: accountError } = useWallet();
  const version = useAccountVersion();
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(false);
  const [funding, setFunding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!account) return;
    setLoading(true);
    setError(null);
    try {
      setStatus(await fetchStatus(await account.getAddress()));
    } catch (err) {
      setError(message(err, "Could not load account status"));
    } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch on account change
    void refresh();
  }, [refresh, version]);

  async function onFund() {
    if (!status) return;
    setFunding(true);
    setError(null);
    try {
      const current = await publicClient.getBalance({ address: status.address });
      await publicClient.request({
        // anvil_setBalance is a dev-node method outside viem's public RPC schema.
        method: "anvil_setBalance" as never,
        params: [status.address, toRpcQuantity(computeFundedBalance(current))] as never,
      });
      await refresh();
    } catch (err) {
      setError(message(err, "Funding failed. Is Anvil running?"));
    } finally {
      setFunding(false);
    }
  }

  if (!owner) return null;

  const shown = status && account ? status : null;

  return (
    <section
      aria-labelledby="account-title"
      className="w-full max-w-xl rounded-card bg-surface p-6 outline-cel shadow-soft md:p-8"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 id="account-title" className="flex items-center gap-2 font-display text-2xl font-semibold">
          <ShieldIcon className="size-6" aria-hidden />
          Smart account
        </h2>
        {shown && (
          <span
            data-testid="deploy-status"
            className="rounded-chip bg-surface-sunken px-3 py-1 font-display text-sm font-semibold"
          >
            {shown.deployed ? "Deployed" : "Not deployed"}
          </span>
        )}
      </div>

      {!shown && !accountError && !error && <p className="mt-4 text-muted">Loading account…</p>}

      {shown && (
        <div className="mt-6 flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold text-muted">Counterfactual address</p>
            <p className="mt-1 break-all rounded-chip bg-surface-sunken px-3 py-2 font-mono text-sm" data-testid="account-address">
              {shown.address}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted">Balance</p>
            <p className="mt-1 font-display text-3xl font-semibold" data-testid="account-balance">
              {formatEthBalance(shown.balance)}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={onFund} disabled={funding || loading}>
              {funding ? "Funding…" : "Fund from Anvil (+10 ETH)"}
            </Button>
            <Button variant="secondary" onClick={() => void refresh()} disabled={loading || funding}>
              {loading ? "Refreshing…" : "Refresh"}
            </Button>
          </div>
        </div>
      )}

      {(accountError || error) && (
        <div className="mt-4 flex flex-col items-start gap-3">
          <p role="alert" className="text-danger-ink">
            {accountError ?? error}
          </p>
          {!accountError && !shown && (
            <Button variant="secondary" onClick={() => void refresh()} disabled={loading}>
              Retry
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
