"use client";

import { useRef } from "react";
import { Caption } from "./Caption";
import { MOTION_OK, gsap, useGSAP } from "./gsap";
import { PoseStack } from "./PoseStack";

const TOPPINGS = [
  { id: "glaze", name: "Glaze", body: "Smooth sign-in. Use a passkey or your usual key, whatever feels right." },
  { id: "sprinkles", name: "Sprinkles", body: "Little helpers that run chores for you, like paying the same friend every week." },
  { id: "shield", name: "Shield", body: "House rules. Spending caps and checks that guard every single payment." },
] as const;

function Glaze() {
  return (
    <svg viewBox="0 0 200 80" className="w-full" aria-hidden>
      <path d="M8 30c0-14 40-24 92-24s92 10 92 24c0 10-8 12-14 10-6-2-8 22-18 22s-10-18-20-16-6 30-18 30-12-26-24-26-10 20-22 20-10-24-22-22-8 14-18 12S8 42 8 30z" fill="#FFFDF8" stroke="#7B3F1E" strokeWidth="3" />
      <ellipse cx="62" cy="20" rx="20" ry="5" fill="#fff" opacity="0.9" />
    </svg>
  );
}

function Sprinkles() {
  const bits = [
    [20, 20, 30, "#F5A3B5"], [60, 8, -20, "#9ED9C3"], [100, 26, 60, "#E0574F"], [140, 10, -45, "#F5A3B5"],
    [176, 24, 15, "#9ED9C3"], [40, 44, -60, "#E8A25C"], [120, 50, 25, "#9ED9C3"], [80, 46, 80, "#F5A3B5"],
  ] as const;
  return (
    <svg viewBox="0 0 200 64" className="w-full" aria-hidden>
      {bits.map(([x, y, r, c], i) => (
        <rect key={i} x={x} y={y} width="22" height="8" rx="4" fill={c} stroke="#7B3F1E" strokeWidth="2" transform={`rotate(${r} ${x + 11} ${y + 4})`} />
      ))}
    </svg>
  );
}

function Shield() {
  return (
    <svg viewBox="0 0 80 92" className="w-full" aria-hidden>
      <path d="M40 4l32 12v26c0 22-14 38-32 46C22 80 8 64 8 42V16z" fill="#9ED9C3" stroke="#7B3F1E" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M26 46l10 10 20-22" fill="none" stroke="#7B3F1E" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ART = { glaze: Glaze, sprinkles: Sprinkles, shield: Shield };
const PLACEMENT = {
  glaze: "top-[6%] left-[18%] w-[64%]",
  sprinkles: "top-[10%] left-[22%] w-[56%]",
  shield: "bottom-[8%] right-[2%] w-[24%]",
};

export function Toppings() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.set("[data-topping]", { autoAlpha: 0, y: () => -window.innerHeight * 0.7, rotate: -25 });
        gsap.set("[data-item]", { opacity: 0.35 });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top top", end: "+=180%", pin: true, scrub: 0.7 },
        });
        TOPPINGS.forEach((t, i) => {
          tl.to(`[data-topping="${t.id}"]`, { autoAlpha: 1, y: 0, rotate: 0, duration: 1, ease: "bounce.out" }, i * 1.2)
            .to("[data-squish]", { scaleY: 0.9, scaleX: 1.07, duration: 0.15, yoyo: true, repeat: 1, ease: "power2.out" }, i * 1.2 + 0.55)
            .to(`[data-item="${t.id}"]`, { opacity: 1, x: 8, duration: 0.4 }, i * 1.2 + 0.3);
        });
        tl.to({}, { duration: 0.5 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="toppings-title" className="relative flex min-h-[100dvh] items-center overflow-hidden px-4 py-20">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-[1.1fr_1fr]">
        <div className="relative mx-auto w-[clamp(200px,58vw,440px)]">
          <div data-squish className="relative origin-bottom">
            <PoseStack poses={["idle"]} />
            {TOPPINGS.map((t) => {
              const Art = ART[t.id];
              return (
                <div key={t.id} data-topping={t.id} className={`absolute ${PLACEMENT[t.id]}`}>
                  <Art />
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h2 id="toppings-title" className="font-display text-[clamp(2.4rem,6vw,4.5rem)] font-semibold leading-[0.95] tracking-tight">
            Plug in toppings
          </h2>
          <p className="mt-4 max-w-md text-lg text-muted">
            Start plain, then add what you need. Swap toppings any time, your money stays right where it is.
          </p>
          <ul className="mt-8 space-y-5">
            {TOPPINGS.map((t) => (
              <li key={t.id} data-item={t.id} className="max-w-md border-l-4 border-highlight pl-4">
                <h3 className="font-display text-2xl font-semibold">{t.name}</h3>
                <p className="text-muted">{t.body}</p>
              </li>
            ))}
          </ul>
          <Caption className="mt-6">ERC-7579 modules: validators, executors, hooks</Caption>
        </div>
      </div>
    </section>
  );
}
