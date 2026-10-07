/**
 * Cinnamon smart-account adapter (EntryPoint v0.8).
 * Ported from smart-wallet/e2e/src/cinnamonAccount.ts; logic is kept identical.
 */
import {
  type Address,
  type Chain,
  type Hex,
  type LocalAccount,
  type PublicClient,
  type Transport,
  concat,
  encodeAbiParameters,
  encodeFunctionData,
  encodePacked,
  pad,
  parseAbi,
  zeroHash,
} from "viem";
import { entryPoint08Abi, getUserOperationHash, toSmartAccount } from "viem/account-abstraction";
import { readContract } from "viem/actions";

export const MODULE_TYPE_HOOK = BigInt(4);

export const walletAbi = parseAbi([
  "function execute(bytes32 mode, bytes executionCalldata) payable",
  "function rootValidator() view returns (address)",
  "function isModuleInstalled(uint256 moduleTypeId, address module, bytes additionalContext) view returns (bool)",
]);

export const factoryAbi = parseAbi([
  "struct Module { uint256 moduleType; address moduleAddress; bytes initData; }",
  "function createAccount(address rootValidator, bytes rootInitData, Module[] extraModules, bytes32 salt) returns (address)",
  "function getAddress(address rootValidator, bytes rootInitData, Module[] extraModules, bytes32 salt) view returns (address)",
]);

export const CALLTYPE_SINGLE_MODE = pad("0x00", { dir: "right", size: 32 });
export const CALLTYPE_BATCH_MODE = pad("0x01", { dir: "right", size: 32 });

export const STUB_SIGNATURE = concat([pad("0x01", { size: 32 }), pad("0x01", { size: 32 }), "0x1b"]);

export type Module = { moduleType: bigint; moduleAddress: Address; initData: Hex };

export type Call = { to: Address; value?: bigint; data?: Hex };

export type FactoryArgs = readonly [rootValidator: Address, rootInitData: Hex, extraModules: Module[], salt: Hex];

/** Builds a spending-limit hook module with the given daily limit (wei). */
export function spendingLimitHookModule(hook: Address, dailyLimit: bigint): Module {
  return {
    moduleType: MODULE_TYPE_HOOK,
    moduleAddress: hook,
    initData: encodeAbiParameters([{ type: "uint256" }], [dailyLimit]),
  };
}

export function buildFactoryArgs(params: {
  owner: Address;
  rootValidator: Address;
  extraModules?: Module[];
  salt?: Hex;
}): FactoryArgs {
  const { owner, rootValidator, extraModules = [], salt = zeroHash } = params;
  const rootInitData = encodeAbiParameters([{ type: "address" }], [owner]);
  return [rootValidator, rootInitData, extraModules, salt] as const;
}

export function encodeFactoryData(args: FactoryArgs): Hex {
  return encodeFunctionData({ abi: factoryAbi, functionName: "createAccount", args });
}

/** Encodes calls into wallet.execute calldata (single or batch mode). */
export function encodeExecuteCalls(calls: readonly Call[]): Hex {
  if (calls.length === 1) {
    const { to, value = BigInt(0), data = "0x" } = calls[0];
    return encodeFunctionData({
      abi: walletAbi,
      functionName: "execute",
      args: [CALLTYPE_SINGLE_MODE, encodePacked(["address", "uint256", "bytes"], [to, value, data])],
    });
  }
  const executions = calls.map(({ to, value = BigInt(0), data = "0x" }) => ({ target: to, value, callData: data }));
  return encodeFunctionData({
    abi: walletAbi,
    functionName: "execute",
    args: [
      CALLTYPE_BATCH_MODE,
      encodeAbiParameters(
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
        [executions],
      ),
    ],
  });
}

export type CinnamonAccountParams = {
  client: PublicClient<Transport, Chain>;
  owner: LocalAccount;
  entryPoint: Address;
  factory: Address;
  rootValidator: Address;
  extraModules?: Module[];
  salt?: Hex;
};

export async function toCinnamonAccount(params: CinnamonAccountParams) {
  const { client, owner, factory, rootValidator, extraModules, salt } = params;
  const entryPoint = { abi: entryPoint08Abi, address: params.entryPoint, version: "0.8" } as const;
  const factoryArgs = buildFactoryArgs({ owner: owner.address, rootValidator, extraModules, salt });

  const address = await readContract(client, {
    address: factory,
    abi: factoryAbi,
    functionName: "getAddress",
    args: factoryArgs,
  });

  return toSmartAccount({
    client,
    entryPoint,

    async getAddress() {
      return address;
    },

    async getFactoryArgs() {
      return { factory, factoryData: encodeFactoryData(factoryArgs) };
    },

    async getNonce() {
      return readContract(client, {
        address: entryPoint.address,
        abi: entryPoint08Abi,
        functionName: "getNonce",
        args: [address, BigInt(0)],
      });
    },

    async encodeCalls(calls) {
      return encodeExecuteCalls(calls);
    },

    async getStubSignature() {
      return STUB_SIGNATURE;
    },

    async signUserOperation(userOperation) {
      if (!owner.sign) throw new Error("Owner account cannot sign raw hashes");
      const hash = getUserOperationHash({
        chainId: client.chain.id,
        entryPointAddress: entryPoint.address,
        entryPointVersion: entryPoint.version,
        userOperation: { ...userOperation, sender: address },
      });
      return owner.sign({ hash });
    },

    async signMessage() {
      throw new Error("ERC-1271 is not supported in the MVP");
    },

    async signTypedData() {
      throw new Error("ERC-1271 is not supported in the MVP");
    },
  });
}

export type CinnamonAccount = Awaited<ReturnType<typeof toCinnamonAccount>>;
