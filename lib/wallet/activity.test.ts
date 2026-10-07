import { describe, expect, it } from "vitest";
import { activityReducer, createActivityStore, type ActivityEntry } from "./activity";

const to = "0x1111111111111111111111111111111111111111" as const;
const opHash = `0x${"aa".repeat(32)}` as const;
const txHash = `0x${"bb".repeat(32)}` as const;

function started(): ActivityEntry[] {
  return activityReducer([], { type: "started", id: "1", amount: BigInt(5), recipient: to });
}

describe("activityReducer", () => {
  it("adds a pending entry at the top", () => {
    const list = activityReducer(started(), { type: "started", id: "2", amount: BigInt(1), recipient: to });
    expect(list.map((e) => e.id)).toEqual(["2", "1"]);
    expect(list[1]).toEqual({
      id: "1",
      amount: BigInt(5),
      recipient: to,
      status: "pending",
      userOpHash: null,
      txHash: null,
      error: null,
    });
  });

  it("records the userOp hash while pending", () => {
    const [entry] = activityReducer(started(), { type: "submitted", id: "1", userOpHash: opHash });
    expect(entry).toMatchObject({ status: "pending", userOpHash: opHash });
  });

  it("marks success with the tx hash", () => {
    const [entry] = activityReducer(started(), { type: "confirmed", id: "1", txHash, success: true });
    expect(entry).toMatchObject({ status: "success", txHash, error: null });
  });

  it("marks a reverted operation as failed", () => {
    const [entry] = activityReducer(started(), { type: "confirmed", id: "1", txHash, success: false });
    expect(entry).toMatchObject({ status: "failed", txHash });
  });

  it("marks errors as failed with a message", () => {
    const [entry] = activityReducer(started(), { type: "failed", id: "1", error: "Daily limit reached" });
    expect(entry).toMatchObject({ status: "failed", error: "Daily limit reached" });
  });

  it("ignores actions for unknown ids", () => {
    const list = started();
    expect(activityReducer(list, { type: "failed", id: "nope", error: "x" })).toBe(list);
  });
});

describe("createActivityStore", () => {
  it("dispatches, exposes snapshots and notifies subscribers", () => {
    const store = createActivityStore();
    let calls = 0;
    const unsubscribe = store.subscribe(() => calls++);
    const before = store.getSnapshot();
    store.dispatch({ type: "started", id: "1", amount: BigInt(1), recipient: to });
    expect(store.getSnapshot()).not.toBe(before);
    expect(store.getSnapshot()).toHaveLength(1);
    expect(calls).toBe(1);
    unsubscribe();
    store.dispatch({ type: "failed", id: "1", error: "x" });
    expect(calls).toBe(1);
  });
});
