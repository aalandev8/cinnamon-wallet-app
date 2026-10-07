export function Swirl({ className = "", size = 28 }: { className?: string; size?: number }) {
  return (
    <svg aria-hidden viewBox="0 0 32 32" width={size} height={size} className={className}>
      <path
        d="M16 16c0-1.7 2.6-1.7 2.6 0 0 3-5.2 3-5.2 0 0-4.4 7.8-4.4 7.8 0 0 5.8-10.4 5.8-10.4 0 0-7.3 13-7.3 13 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Coin({ className = "", size = 40 }: { className?: string; size?: number }) {
  return (
    <svg aria-hidden viewBox="0 0 40 40" width={size} height={size} className={className}>
      <circle cx="20" cy="20" r="17" fill="#E8A25C" stroke="#7B3F1E" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="11" fill="none" stroke="#7B3F1E" strokeWidth="2" strokeDasharray="3 3" />
      <ellipse cx="14" cy="13" rx="4" ry="2.4" fill="#FFFDF8" opacity="0.7" />
    </svg>
  );
}
