const SWIRLS = [
  { left: "6%", top: "18%", size: 28, delay: "0s", duration: "9s" },
  { left: "88%", top: "12%", size: 22, delay: "1.5s", duration: "11s" },
  { left: "78%", top: "70%", size: 34, delay: "3s", duration: "10s" },
  { left: "14%", top: "78%", size: 20, delay: "2s", duration: "12s" },
  { left: "48%", top: "6%", size: 18, delay: "4s", duration: "13s" },
];

/** Decorative floating cinnamon-roll swirls. Static under reduced motion. */
export function CinnamonSwirls() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {SWIRLS.map((s, i) => (
        <svg
          key={i}
          viewBox="0 0 32 32"
          width={s.size}
          height={s.size}
          className="swirl absolute text-caramel opacity-60"
          style={{ left: s.left, top: s.top, animationDelay: s.delay, animationDuration: s.duration }}
        >
          <path
            d="M16 16c0-1.7 2.6-1.7 2.6 0 0 3-5.2 3-5.2 0 0-4.4 7.8-4.4 7.8 0 0 5.8-10.4 5.8-10.4 0 0-7.3 13-7.3 13 0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      ))}
    </div>
  );
}
