import { describe, expect, it } from "vitest";
import { parseDeployments } from "./deployments";

const valid = {
  ecdsaValidator: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  entryPoint: "0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108",
  factory: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  spendingLimitHook: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
};

describe("parseDeployments", () => {
  it("returns typed addresses for a valid deployments object", () => {
    expect(parseDeployments(valid)).toEqual(valid);
  });

  it("throws when the input is not an object", () => {
    expect(() => parseDeployments(null)).toThrow(/must be a JSON object/);
  });

  it("throws naming a missing key", () => {
    const { factory: _omit, ...rest } = valid;
    expect(() => parseDeployments(rest)).toThrow(/"factory".*missing/);
  });

  it("throws naming a key with an invalid address", () => {
    expect(() => parseDeployments({ ...valid, spendingLimitHook: "0x123" })).toThrow(
      /"spendingLimitHook".*not a valid address/,
    );
  });

  it("rejects an entryPoint that is not v0.8", () => {
    expect(() =>
      parseDeployments({ ...valid, entryPoint: "0x0000000071727De22E5E9d8BAf0edAc6f37da032" }),
    ).toThrow(/EntryPoint v0.8/);
  });
});
