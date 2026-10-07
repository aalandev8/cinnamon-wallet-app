"use client";

import { useSyncExternalStore } from "react";
import { type ActivityEntry, createActivityStore } from "@/lib/wallet/activity";

/** Session-only activity store shared by SendPanel and ActivityList. */
export const activityStore = createActivityStore();

const empty: ActivityEntry[] = [];

export function useActivity(): ActivityEntry[] {
  return useSyncExternalStore(activityStore.subscribe, activityStore.getSnapshot, () => empty);
}
