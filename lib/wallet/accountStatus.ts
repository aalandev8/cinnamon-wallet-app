import { type Hex, formatEther, parseEther } from "viem";

/** Amount added by the "Fund from Anvil" action. */
export const FUND_AMOUNT = parseEther("10");

const DISPLAY_DECIMALS = 4;

/** Formats a wei balance as ETH, truncated to 4 decimals. */
export function formatEthBalance(wei: bigint): string {
  if (wei === BigInt(0)) return "0 ETH";
  const [whole, fraction = ""] = formatEther(wei).split(".");
  const trimmed = fraction.slice(0, DISPLAY_DECIMALS).replace(/0+$/, "");
  if (whole === "0" && !trimmed) return "< 0.0001 ETH";
  return trimmed ? `${whole}.${trimmed} ETH` : `${whole} ETH`;
}

/** True when getCode returned non-empty bytecode. */
export function isDeployedCode(code: Hex | undefined): boolean {
  return code !== undefined && code !== "0x" && code.length > 2;
}

/** New balance after funding (anvil_setBalance sets an absolute value). */
export function computeFundedBalance(current: bigint, amount: bigint = FUND_AMOUNT): bigint {
  if (amount < BigInt(0)) throw new Error("Funding amount must be non-negative");
  return current + amount;
}

/** Encodes a bigint as a JSON-RPC hex quantity. */
export function toRpcQuantity(value: bigint): Hex {
  return `0x${value.toString(16)}`;
}
