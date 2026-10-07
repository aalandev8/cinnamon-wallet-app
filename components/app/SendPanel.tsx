"use client";

import { useReducer, useState, type FormEvent } from "react";
import { BaseError } from "viem";
import { Button } from "@/components/Button";
import { Mascot, type MascotState } from "@/components/Mascot";
import { bundlerClient } from "@/lib/wallet/clients";
import { initialSendState, parseEthAmount, sendReducer, validateRecipient } from "@/lib/wallet/send";
import { useWallet } from "./useWallet";

const mascotByStatus: Record<string, MascotState> = {
  idle: "idle",
  sending: "sending",
  success: "success",
  failed: "blocked",
};

const inputClass = "rounded-chip bg-surface-sunken px-3 py-2 font-mono text-sm outline-cel";

export function SendPanel() {
  const { account } = useWallet();
  const [state, dispatch] = useReducer(sendReducer, initialSendState);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const sending = state.status === "sending";

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const to = validateRecipient(recipient);
    if (!to.ok) return setFormError(to.error);
    const value = parseEthAmount(amount);
    if (!value.ok) return setFormError(value.error);
    if (!account) return setFormError("Set up a signer first.");
    setFormError(null);
    dispatch({ type: "submit" });
    try {
      // When the account is not yet deployed, viem fills factory/factoryData from account.getFactoryArgs().
      const userOpHash = await bundlerClient.sendUserOperation({
        account,
        calls: [{ to: to.value, value: value.value }],
      });
      dispatch({ type: "submitted", userOpHash });
      const receipt = await bundlerClient.waitForUserOperationReceipt({ hash: userOpHash });
      dispatch({ type: "confirmed", txHash: receipt.receipt.transactionHash, success: receipt.success });
    } catch (error) {
      const message = error instanceof BaseError ? error.shortMessage : (error as Error).message;
      dispatch({ type: "error", message });
    }
  }

  return (
    <section
      aria-labelledby="send-title"
      className="w-full max-w-xl rounded-card bg-surface p-6 outline-cel shadow-soft md:p-8"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 id="send-title" className="font-display text-2xl font-semibold">
          Send ETH
        </h2>
        <Mascot state={mascotByStatus[state.status]} size={72} />
      </div>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
        <label htmlFor="send-to" className="text-sm font-semibold text-muted">
          Recipient
        </label>
        <input
          id="send-to"
          autoComplete="off"
          spellCheck={false}
          placeholder="0x…"
          value={recipient}
          onChange={(event) => setRecipient(event.target.value)}
          className={inputClass}
        />
        <label htmlFor="send-amount" className="text-sm font-semibold text-muted">
          Amount (ETH)
        </label>
        <input
          id="send-amount"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className={inputClass}
        />
        <Button type="submit" className="mt-3" disabled={sending || !account || !recipient.trim() || !amount.trim()}>
          {sending ? "Sending…" : "Send"}
        </Button>
      </form>

      {(formError || state.error) && (
        <p role="alert" className="mt-4 text-danger-ink">
          {formError ?? state.error}
        </p>
      )}
      {state.status === "success" && <p className="mt-4 font-semibold">Sent!</p>}
      {state.userOpHash && <HashRow label="UserOp hash" value={state.userOpHash} />}
      {state.txHash && <HashRow label="Transaction hash" value={state.txHash} />}
    </section>
  );
}

function HashRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-4">
      <p className="text-sm font-semibold text-muted">{label}</p>
      <p className="mt-1 break-all rounded-chip bg-surface-sunken px-3 py-2 font-mono text-sm">{value}</p>
    </div>
  );
}
