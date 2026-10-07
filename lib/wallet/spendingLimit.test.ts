import { describe, expect, it } from "vitest";
import { BaseError, encodeErrorResult, parseEther } from "viem";
import {
  DAILY_LIMIT_MESSAGE,
  decodeDailyLimitError,
  limitProgress,
  spendingLimitAbi,
  spentToday,
} from "./spendingLimit";

const DAY = 86_400;

describe("spentToday", () => {
  it("returns spent when the stored epoch is the current day", () => {
    expect(spentToday({ epoch: BigInt(5), spent: BigInt(7), timestamp: BigInt(5 * DAY + 10) })).toBe(BigInt(7));
  });

  it("returns zero when the stored epoch is a previous day", () => {
    expect(spentToday({ epoch: BigInt(4), spent: BigInt(7), timestamp: BigInt(5 * DAY) })).toBe(BigInt(0));
  });
});

describe("limitProgress", () => {
  it("computes percent and remaining", () => {
    expect(limitProgress(parseEther("0.25"), parseEther("1"))).toEqual({
      percent: 25,
      remaining: parseEther("0.75"),
      reached: false,
    });
  });

  it("clamps at 100 percent and zero remaining when over the limit", () => {
    expect(limitProgress(parseEther("2"), parseEther("1"))).toEqual({ percent: 100, remaining: BigInt(0), reached: true });
  });

  it("treats a zero limit as reached", () => {
    expect(limitProgress(BigInt(0), BigInt(0))).toEqual({ percent: 100, remaining: BigInt(0), reached: true });
  });

  it("rounds down fractional percents", () => {
    expect(limitProgress(BigInt(1), BigInt(3)).percent).toBe(33);
  });
});

describe("decodeDailyLimitError", () => {
  const data = encodeErrorResult({
    abi: spendingLimitAbi,
    errorName: "DailyLimitExceeded",
    args: [parseEther("1.5"), parseEther("1")],
  });

  it("decodes raw revert data", () => {
    expect(decodeDailyLimitError(data)).toEqual({ spent: parseEther("1.5"), limit: parseEther("1") });
  });

  it("finds revert data embedded in a nested error message", () => {
    const inner = new Error(`UserOperation reverted during simulation with reason: ${data}`);
    const outer = new BaseError("Execution reverted", { cause: inner });
    expect(decodeDailyLimitError(outer)).toEqual({ spent: parseEther("1.5"), limit: parseEther("1") });
  });

  it("finds revert data wrapped inside other revert data", () => {
    const wrapped = `0xdeadbeef${"00".repeat(32)}${data.slice(2)}`;
    expect(decodeDailyLimitError({ data: wrapped })).not.toBeNull();
  });

  it("returns null for unrelated errors", () => {
    expect(decodeDailyLimitError(new Error("insufficient funds"))).toBeNull();
    expect(decodeDailyLimitError(null)).toBeNull();
  });

  it("exposes the user-facing message", () => {
    expect(DAILY_LIMIT_MESSAGE).toBe("Daily limit reached");
  });
});
