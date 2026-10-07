import type { SVGProps } from "react";

// Chunky cel-style icons: 2px cinnamon stroke, caramel/strawberry fills.
const base = {
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function KeyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="16" cy="24" r="9" fill="var(--caramel)" />
      <circle cx="16" cy="24" r="3" fill="var(--glaze)" />
      <path d="M25 24h17M36 24v6M41 24v5" />
      <circle cx="12" cy="20" r="1.2" fill="var(--glaze)" stroke="none" />
    </svg>
  );
}

export function PuzzleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path
        d="M9 14h9a4 4 0 1 1 8 0h9v9a4 4 0 1 1 0 8v8H26a4 4 0 1 0-8 0H9v-9a4 4 0 1 0 0-8z"
        fill="var(--strawberry)"
      />
      <path d="M17 24h8" opacity=".5" />
    </svg>
  );
}

export function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M24 6 39 11v11c0 10-6.5 16.5-15 20-8.5-3.5-15-10-15-20V11z" fill="var(--mint)" />
      <path d="m17 24 5 5 9-10" />
    </svg>
  );
}
