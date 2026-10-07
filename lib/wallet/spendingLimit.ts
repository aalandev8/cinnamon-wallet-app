import { type Hex, decodeErrorResult, parseAbi, parseEther, toFunctionSelector } from "viem";

/** Daily ETH limit installed on new Cinnamon accounts. */
export const DEFAULT_DAILY_LIMIT = parseEther("1");

export const DAILY_LIMIT_MESSAGE = "Daily limit reached";

export const spendingLimitAbi = parseAbi([
  "function limit(address account) view returns (uint256)",
  "function epoch(address account) view returns (uint256)",
  "function spent(address account) view returns (uint256)",
  "function isInitialized(address account) view returns (bool)",
  "error DailyLimitExceeded(uint256 spent, uint256 limit)",
]);

const SECONDS_PER_DAY = BigInt(86_400);
const DAILY_LIMIT_SELECTOR = toFunctionSelector("DailyLimitExceeded(uint256,uint256)").slice(2);
// selector (4 bytes) + two uint256 words
const ERROR_HEX_LENGTH = 8 + 64 * 2;

/** Amount spent in the current day; the hook's stored total resets when the epoch rolls over. */
export function spentToday({ epoch, spent, timestamp }: { epoch: bigint; spent: bigint; timestamp: bigint }): bigint {
  return epoch === timestamp / SECONDS_PER_DAY ? spent : BigInt(0);
}

export type LimitProgress = { percent: number; remaining: bigint; reached: boolean };

/** Progress of `spent` against `limit`, clamped to [0, 100]. */
export function limitProgress(spent: bigint, limit: bigint): LimitProgress {
  if (limit <= BigInt(0)) return { percent: 100, remaining: BigInt(0), reached: true };
  const capped = spent > limit ? limit : spent;
  return {
    percent: Number((capped * BigInt(100)) / limit),
    remaining: limit - capped,
    reached: spent >= limit,
  };
}

function collectStrings(value: unknown, out: string[], seen: Set<unknown>, depth = 0) {
  if (depth > 8 || value === null || value === undefined) return;
  if (typeof value === "string") return void out.push(value);
  if (typeof value !== "object" || seen.has(value)) return;
  seen.add(value);
  const record = value as Record<string, unknown>;
  for (const key of ["data", "reason", "message", "details", "shortMessage", "revertData"]) {
    collectStrings(record[key], out, seen, depth + 1);
  }
  collectStrings(record.cause, out, seen, depth + 1);
  collectStrings(record.error, out, seen, depth + 1);
}

/** Finds and decodes a SpendingLimitHook DailyLimitExceeded revert anywhere inside an error or hex blob. */
export function decodeDailyLimitError(error: unknown): { spent: bigint; limit: bigint } | null {
  const strings: string[] = [];
  collectStrings(error, strings, new Set());
  for (const text of strings) {
    const lower = text.toLowerCase();
    let index = lower.indexOf(DAILY_LIMIT_SELECTOR);
    while (index !== -1) {
      const candidate = lower.slice(index, index + ERROR_HEX_LENGTH);
      if (/^[0-9a-f]+$/.test(candidate) && candidate.length === ERROR_HEX_LENGTH) {
        try {
          const decoded = decodeErrorResult({ abi: spendingLimitAbi, data: `0x${candidate}` as Hex });
          const [spent, limit] = decoded.args as readonly [bigint, bigint];
          return { spent, limit };
        } catch {
          // keep scanning
        }
      }
      index = lower.indexOf(DAILY_LIMIT_SELECTOR, index + 1);
    }
  }
  return null;
}
