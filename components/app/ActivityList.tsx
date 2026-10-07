"use client";

import { formatEthBalance } from "@/lib/wallet/accountStatus";
import type { ActivityStatus } from "@/lib/wallet/activity";
import { useActivity } from "./useActivity";

const statusLabel: Record<ActivityStatus, string> = { pending: "Pending", success: "Success", failed: "Failed" };
const statusClass: Record<ActivityStatus, string> = {
  pending: "bg-surface-sunken",
  success: "bg-highlight",
  failed: "bg-danger",
};

export function ActivityList() {
  const entries = useActivity();

  return (
    <section
      aria-labelledby="activity-title"
      className="w-full max-w-xl rounded-card bg-surface p-6 outline-cel shadow-soft md:p-8"
    >
      <h2 id="activity-title" className="font-display text-2xl font-semibold">
        Activity
      </h2>
      <p className="mt-1 text-sm text-muted">User operations sent this session.</p>
      {entries.length === 0 ? (
        <p className="mt-4 text-muted">No activity yet.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3" data-testid="activity-list">
          {entries.map((entry) => (
            <li key={entry.id} className="rounded-chip bg-surface-sunken p-3 text-sm" data-testid="activity-item">
              <div className="flex items-center justify-between gap-3">
                <span className="font-display font-semibold">{formatEthBalance(entry.amount)}</span>
                <span
                  data-testid="activity-status"
                  className={`rounded-chip px-2 py-0.5 font-semibold ${statusClass[entry.status]}`}
                >
                  {statusLabel[entry.status]}
                </span>
              </div>
              <p className="mt-2 break-all font-mono text-xs">To {entry.recipient}</p>
              {entry.userOpHash && <p className="mt-1 break-all font-mono text-xs">UserOp {entry.userOpHash}</p>}
              {entry.txHash && <p className="mt-1 break-all font-mono text-xs">Tx {entry.txHash}</p>}
              {entry.error && <p className="mt-1 text-danger-ink">{entry.error}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
