import { type Address, type Hex, isAddress, parseEther, zeroAddress } from "viem";

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const AMOUNT_PATTERN = /^(\d+)(\.(\d+))?$|^\.(\d+)$/;

/** Parses a decimal ETH amount into wei; must be positive with at most 18 decimals. */
export function parseEthAmount(input: string): Result<bigint> {
  const raw = input.trim();
  const match = AMOUNT_PATTERN.exec(raw);
  if (!match) return { ok: false, error: "Enter a valid ETH amount." };
  const decimals = match[3] ?? match[4] ?? "";
  if (decimals.length > 18) return { ok: false, error: "Use at most 18 decimals." };
  const value = parseEther(raw);
  if (value <= BigInt(0)) return { ok: false, error: "Amount must be greater than zero." };
  return { ok: true, value };
}

/** Validates a recipient address; rejects malformed and zero addresses. */
export function validateRecipient(input: string): Result<Address> {
  const raw = input.trim();
  if (!isAddress(raw)) return { ok: false, error: "Enter a valid address." };
  if (raw.toLowerCase() === zeroAddress) return { ok: false, error: "Cannot send to the zero address." };
  return { ok: true, value: raw };
}

export type SendStatus = "idle" | "sending" | "success" | "failed";

export type SendState = {
  status: SendStatus;
  userOpHash: Hex | null;
  txHash: Hex | null;
  error: string | null;
};

export type SendAction =
  | { type: "submit" }
  | { type: "submitted"; userOpHash: Hex }
  | { type: "confirmed"; txHash: Hex; success: boolean }
  | { type: "error"; message: string }
  | { type: "reset" };

export const initialSendState: SendState = { status: "idle", userOpHash: null, txHash: null, error: null };

export function sendReducer(state: SendState, action: SendAction): SendState {
  switch (action.type) {
    case "submit":
      return { ...initialSendState, status: "sending" };
    case "submitted":
      return { ...state, userOpHash: action.userOpHash };
    case "confirmed":
      return {
        ...state,
        txHash: action.txHash,
        status: action.success ? "success" : "failed",
        error: action.success ? null : "User operation reverted.",
      };
    case "error":
      return { ...state, status: "failed", error: action.message };
    case "reset":
      return initialSendState;
  }
}
