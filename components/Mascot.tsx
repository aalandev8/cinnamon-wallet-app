"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export type MascotState = "idle" | "sending" | "success" | "blocked" | "loading";

const ALT: Record<MascotState, string> = {
  idle: "Cinnamon mascot waving",
  sending: "Cinnamon mascot sending a payment",
  success: "Cinnamon mascot celebrating",
  blocked: "Cinnamon mascot holding a stop sign",
  loading: "Cinnamon mascot waiting",
};

type Props = {
  state: MascotState;
  size?: number;
  eager?: boolean;
  className?: string;
};

export function Mascot({ state, size = 240, eager = false, className = "" }: Props) {
  const [current, setCurrent] = useState(state);
  const [previous, setPrevious] = useState<MascotState | null>(null);
  const [failed, setFailed] = useState<Set<MascotState>>(new Set());

  // Keep the outgoing image mounted briefly so the two can crossfade.
  if (state !== current) {
    setPrevious(current);
    setCurrent(state);
  }

  useEffect(() => {
    if (!previous) return;
    const id = setTimeout(() => setPrevious(null), 350);
    return () => clearTimeout(id);
  }, [previous]);

  const layer = (s: MascotState, leaving: boolean) =>
    failed.has(s) ? (
      <div
        key={s}
        aria-hidden={leaving}
        role={leaving ? undefined : "img"}
        aria-label={leaving ? undefined : ALT[s]}
        className={`absolute inset-0 rounded-full bg-glaze outline-cel ${leaving ? "mascot-out" : "mascot-in"}`}
      />
    ) : (
      <Image
        key={s}
        src={`/mascot/${s}.png`}
        alt={leaving ? "" : ALT[s]}
        width={size}
        height={size}
        loading={eager ? "eager" : undefined}
        fetchPriority={eager ? "high" : undefined}
        onError={() => setFailed((f) => new Set(f).add(s))}
        className={`absolute inset-0 h-full w-full object-contain ${leaving ? "mascot-out" : "mascot-in"}`}
      />
    );

  return (
    <div
      className={`relative w-full shrink-0 ${className}`}
      style={{ maxWidth: size, aspectRatio: "1" }}
    >
      {previous && layer(previous, true)}
      {layer(current, false)}
    </div>
  );
}
