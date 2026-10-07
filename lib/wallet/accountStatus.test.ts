import { describe, expect, it } from "vitest";
import { parseEther } from "viem";
import { FUND_AMOUNT, computeFundedBalance, formatEthBalance, isDeployedCode, toRpcQuantity } from "./accountStatus";

describe("formatEthBalance", () => {
  it("formats zero", () => {
    expect(formatEthBalance(BigInt(0))).toBe("0 ETH");
  });
  it("trims to 4 decimals", () => {
    expect(formatEthBalance(parseEther("1.23456789"))).toBe("1.2345 ETH");
  });
  it("shows whole numbers without decimals", () => {
    expect(formatEthBalance(parseEther("10"))).toBe("10 ETH");
  });
  it("shows tiny non-zero balances as < 0.0001", () => {
    expect(formatEthBalance(BigInt(1))).toBe("< 0.0001 ETH");
  });
});

describe("isDeployedCode", () => {
  it("is false for undefined or empty bytecode", () => {
    expect(isDeployedCode(undefined)).toBe(false);
    expect(isDeployedCode("0x")).toBe(false);
  });
  it("is true for non-empty bytecode", () => {
    expect(isDeployedCode("0x6080")).toBe(true);
  });
});

describe("computeFundedBalance", () => {
  it("adds 10 ETH by default", () => {
    expect(FUND_AMOUNT).toBe(parseEther("10"));
    expect(computeFundedBalance(parseEther("1"))).toBe(parseEther("11"));
  });
  it("accepts a custom amount", () => {
    expect(computeFundedBalance(BigInt(5), BigInt(3))).toBe(BigInt(8));
  });
  it("rejects negative amounts", () => {
    expect(() => computeFundedBalance(BigInt(0), BigInt(-1))).toThrow();
  });
});

describe("toRpcQuantity", () => {
  it("encodes as hex quantity", () => {
    expect(toRpcQuantity(BigInt(0))).toBe("0x0");
    expect(toRpcQuantity(BigInt(255))).toBe("0xff");
  });
});
