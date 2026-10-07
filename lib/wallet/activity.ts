import type { Address, Hex } from "viem";

export type ActivityStatus = "pending" | "success" | "failed";

export type ActivityEntry = {
  id: string;
  amount: bigint;
  recipient: Address;
  status: ActivityStatus;
  userOpHash: Hex | null;
  txHash: Hex | null;
  error: string | null;
};

export type ActivityAction =
  | { type: "started"; id: string; amount: bigint; recipient: Address }
  | { type: "submitted"; id: string; userOpHash: Hex }
  | { type: "confirmed"; id: string; txHash: Hex; success: boolean }
  | { type: "failed"; id: string; error: string };

function update(list: ActivityEntry[], id: string, patch: Partial<ActivityEntry>): ActivityEntry[] {
  if (!list.some((entry) => entry.id === id)) return list;
  return list.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry));
}

/** Newest-first list of user operations sent this session. */
export function activityReducer(list: ActivityEntry[], action: ActivityAction): ActivityEntry[] {
  switch (action.type) {
    case "started":
      return [
        {
          id: action.id,
          amount: action.amount,
          recipient: action.recipient,
          status: "pending",
          userOpHash: null,
          txHash: null,
          error: null,
        },
        ...list,
      ];
    case "submitted":
      return update(list, action.id, { userOpHash: action.userOpHash });
    case "confirmed":
      return update(list, action.id, {
        txHash: action.txHash,
        status: action.success ? "success" : "failed",
        error: action.success ? null : "User operation reverted.",
      });
    case "failed":
      return update(list, action.id, { status: "failed", error: action.error });
  }
}

export type ActivityStore = {
  dispatch(action: ActivityAction): void;
  getSnapshot(): ActivityEntry[];
  subscribe(listener: () => void): () => void;
};

/** In-memory store compatible with useSyncExternalStore; lives only for the page session. */
export function createActivityStore(): ActivityStore {
  let state: ActivityEntry[] = [];
  const listeners = new Set<() => void>();
  return {
    dispatch(action) {
      const next = activityReducer(state, action);
      if (next === state) return;
      state = next;
      listeners.forEach((listener) => listener());
    },
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
