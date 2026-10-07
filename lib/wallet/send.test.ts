import { describe, expect, it } from "vitest";
import { initialSendState, parseEthAmount, sendReducer, validateRecipient } from "./send";

describe("parseEthAmount", () => {
  it("parses valid amounts to wei", () => {
    expect(parseEthAmount("1")).toEqual({ ok: true, value: BigInt("1000000000000000000") });
    expect(parseEthAmount(" 0.5 ")).toEqual({ ok: true, value: BigInt("500000000000000000") });
    expect(parseEthAmount("0.000000000000000001")).toEqual({ ok: true, value: BigInt(1) });
  });
  it("rejects zero and negatives", () => {
    expect(parseEthAmount("0").ok).toBe(false);
    expect(parseEthAmount("-1").ok).toBe(false);
  });
  it("rejects more than 18 decimals", () => {
    expect(parseEthAmount("0.0000000000000000001").ok).toBe(false);
  });
  it("rejects junk", () => {
    for (const v of ["", "abc", "1e18", "1.2.3", "0x10", ".", "1,5"]) expect(parseEthAmount(v).ok).toBe(false);
  });
});

describe("validateRecipient", () => {
  it("accepts a valid address", () => {
    const a = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    expect(validateRecipient(` ${a} `)).toEqual({ ok: true, value: a });
  });
  it("rejects invalid and zero addresses", () => {
    expect(validateRecipient("0x123").ok).toBe(false);
    expect(validateRecipient("0x0000000000000000000000000000000000000000").ok).toBe(false);
  });
});

describe("sendReducer", () => {
  it("walks submit -> submitted -> success", () => {
    let s = sendReducer(initialSendState, { type: "submit" });
    expect(s.status).toBe("sending");
    s = sendReducer(s, { type: "submitted", userOpHash: "0xaa" });
    expect(s.userOpHash).toBe("0xaa");
    s = sendReducer(s, { type: "confirmed", txHash: "0xbb", success: true });
    expect(s).toMatchObject({ status: "success", userOpHash: "0xaa", txHash: "0xbb" });
  });
  it("marks reverted ops and errors as failed", () => {
    expect(sendReducer(initialSendState, { type: "confirmed", txHash: "0xbb", success: false }).status).toBe("failed");
    expect(sendReducer(initialSendState, { type: "error", message: "x" })).toMatchObject({
      status: "failed",
      error: "x",
    });
  });
  it("resets", () => {
    expect(sendReducer({ ...initialSendState, status: "failed", error: "x" }, { type: "reset" })).toEqual(
      initialSendState,
    );
  });
});
