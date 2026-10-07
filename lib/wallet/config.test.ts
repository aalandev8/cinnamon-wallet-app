import { describe, expect, it } from "vitest";
import { parseWalletEnv } from "./config";

describe("parseWalletEnv", () => {
  it("falls back to local defaults when vars are unset", () => {
    expect(parseWalletEnv({})).toEqual({
      chainId: 31337,
      rpcUrl: "http://127.0.0.1:8545",
      bundlerUrl: "http://127.0.0.1:4337",
    });
  });

  it("treats empty strings as unset", () => {
    expect(parseWalletEnv({ rpcUrl: "", bundlerUrl: "  " }).rpcUrl).toBe("http://127.0.0.1:8545");
  });

  it("uses provided URLs and chain id", () => {
    expect(
      parseWalletEnv({ rpcUrl: "https://rpc.example", bundlerUrl: "https://b.example", chainId: "8453" }),
    ).toEqual({ chainId: 8453, rpcUrl: "https://rpc.example", bundlerUrl: "https://b.example" });
  });

  it("throws on an invalid URL", () => {
    expect(() => parseWalletEnv({ rpcUrl: "not a url" })).toThrow(/NEXT_PUBLIC_RPC_URL/);
  });

  it("throws on a non-http URL", () => {
    expect(() => parseWalletEnv({ bundlerUrl: "ftp://x" })).toThrow(/NEXT_PUBLIC_BUNDLER_URL/);
  });

  it("throws on an invalid chain id", () => {
    expect(() => parseWalletEnv({ chainId: "abc" })).toThrow(/NEXT_PUBLIC_CHAIN_ID/);
    expect(() => parseWalletEnv({ chainId: "0" })).toThrow(/NEXT_PUBLIC_CHAIN_ID/);
  });
});
