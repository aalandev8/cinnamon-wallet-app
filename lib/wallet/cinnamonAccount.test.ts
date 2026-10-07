import { decodeAbiParameters, decodeFunctionData, encodeAbiParameters, encodePacked, zeroHash } from "viem";
import { describe, expect, it } from "vitest";
import {
  CALLTYPE_BATCH_MODE,
  CALLTYPE_SINGLE_MODE,
  MODULE_TYPE_HOOK,
  STUB_SIGNATURE,
  buildFactoryArgs,
  encodeExecuteCalls,
  encodeFactoryData,
  factoryAbi,
  spendingLimitHookModule,
  walletAbi,
} from "./cinnamonAccount";

const OWNER = "0x1111111111111111111111111111111111111111";
const VALIDATOR = "0x2222222222222222222222222222222222222222";
const HOOK = "0x3333333333333333333333333333333333333333";
const TO = "0x4444444444444444444444444444444444444444";

describe("execute modes", () => {
  it("encodes single and batch call types as right-padded bytes32", () => {
    expect(CALLTYPE_SINGLE_MODE).toBe(`0x${"0".repeat(64)}`);
    expect(CALLTYPE_BATCH_MODE).toBe(`0x01${"0".repeat(62)}`);
  });
});

describe("encodeExecuteCalls", () => {
  it("encodes a single call with packed (to, value, data)", () => {
    const data = encodeExecuteCalls([{ to: TO, value: 5n, data: "0xabcd" }]);
    const { functionName, args } = decodeFunctionData({ abi: walletAbi, data });
    expect(functionName).toBe("execute");
    expect(args).toEqual([CALLTYPE_SINGLE_MODE, encodePacked(["address", "uint256", "bytes"], [TO, 5n, "0xabcd"])]);
  });

  it("defaults value to 0 and data to 0x", () => {
    const data = encodeExecuteCalls([{ to: TO }]);
    const { args } = decodeFunctionData({ abi: walletAbi, data });
    expect(args?.[1]).toBe(encodePacked(["address", "uint256", "bytes"], [TO, 0n, "0x"]));
  });

  it("encodes multiple calls as a batch of executions", () => {
    const data = encodeExecuteCalls([
      { to: TO, value: 1n },
      { to: OWNER, data: "0x12" },
    ]);
    const { args } = decodeFunctionData({ abi: walletAbi, data });
    expect(args?.[0]).toBe(CALLTYPE_BATCH_MODE);
    const [executions] = decodeAbiParameters(
      [
        {
          type: "tuple[]",
          components: [
            { name: "target", type: "address" },
            { name: "value", type: "uint256" },
            { name: "callData", type: "bytes" },
          ],
        },
      ],
      args?.[1] as `0x${string}`,
    );
    expect(executions).toEqual([
      { target: TO, value: 1n, callData: "0x" },
      { target: OWNER, value: 0n, callData: "0x12" },
    ]);
  });
});

describe("buildFactoryArgs", () => {
  it("encodes the owner as root init data with defaults", () => {
    expect(buildFactoryArgs({ owner: OWNER, rootValidator: VALIDATOR })).toEqual([
      VALIDATOR,
      encodeAbiParameters([{ type: "address" }], [OWNER]),
      [],
      zeroHash,
    ]);
  });

  it("passes extra modules and salt through", () => {
    const module = spendingLimitHookModule(HOOK, 10n);
    const salt = `0x${"ab".repeat(32)}` as const;
    const args = buildFactoryArgs({ owner: OWNER, rootValidator: VALIDATOR, extraModules: [module], salt });
    expect(args[2]).toEqual([module]);
    expect(args[3]).toBe(salt);
  });
});

describe("encodeFactoryData", () => {
  it("encodes createAccount with the factory args", () => {
    const args = buildFactoryArgs({ owner: OWNER, rootValidator: VALIDATOR });
    const { functionName, args: decoded } = decodeFunctionData({ abi: factoryAbi, data: encodeFactoryData(args) });
    expect(functionName).toBe("createAccount");
    expect(decoded).toEqual(args);
  });
});

describe("spendingLimitHookModule", () => {
  it("builds a hook module with the daily limit as init data", () => {
    expect(spendingLimitHookModule(HOOK, 7n)).toEqual({
      moduleType: MODULE_TYPE_HOOK,
      moduleAddress: HOOK,
      initData: encodeAbiParameters([{ type: "uint256" }], [7n]),
    });
  });
});

describe("STUB_SIGNATURE", () => {
  it("is a 65-byte r||s||v stub", () => {
    expect(STUB_SIGNATURE).toBe(`0x${"0".repeat(62)}01${"0".repeat(62)}011b`);
  });
});
