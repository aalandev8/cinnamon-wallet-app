"use client";

import { useRef } from "react";
import { Caption } from "./Caption";
import { MOTION_OK, gsap, useGSAP } from "./gsap";
import { PoseStack } from "./PoseStack";
import { Coin } from "./Swirl";

const CAP = 0.5;
const COINS = [
  { from: [-46, -30], amount: 0.1 },
  { from: [44, -38], amount: 0.2 },
  { from: [-40, 26], amount: 0.3 },
  { from: [48, 20], amount: 0.4 },
  { from: [-8, -48], amount: 0.5 },
];

export function DailyLimit() {
  const root = useRef<HTMLElement>(null);
  const amount = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const counter = { v: 0 };
        const render = () => {
          if (amount.current) amount.current.textContent = counter.v.toFixed(2);
        };
        gsap.set("[data-fill]", { scaleX: 0 });
        gsap.set('[data-pose="blocked"], [data-nope], [data-bounce]', { autoAlpha: 0 });
        gsap.set('[data-pose="sending"]', { autoAlpha: 1 });
        counter.v = 0;
        render();

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root.current, start: "top top", end: "+=220%", pin: true, scrub: 0.8 },
        });

        COINS.forEach((c, i) => {
          const at = i * 1;
          tl.fromTo(
            `[data-coin="${i}"]`,
            { xPercent: -50, yPercent: -50, x: `${c.from[0]}vw`, y: `${c.from[1]}vh`, autoAlpha: 0, scale: 1.3 },
            { x: 0, y: 0, autoAlpha: 1, scale: 0.4, rotate: 360, duration: 0.8, ease: "power2.in" },
            at,
          )
            .to(`[data-coin="${i}"]`, { autoAlpha: 0, duration: 0.1 }, at + 0.8)
            .to("[data-gulp]", { scaleY: 0.9, scaleX: 1.08, duration: 0.1, yoyo: true, repeat: 1 }, at + 0.8)
            .to("[data-fill]", { scaleX: c.amount / CAP, duration: 0.4, ease: "power2.out" }, at + 0.8)
            .to(counter, { v: c.amount, duration: 0.4, onUpdate: render }, at + 0.8);
        });

        const capAt = COINS.length + 0.1;
        tl.to('[data-pose="sending"]', { autoAlpha: 0, duration: 0.3 }, capAt)
          .to('[data-pose="blocked"]', { autoAlpha: 1, duration: 0.3 }, capAt)
          .to("[data-gulp]", { keyframes: { rotate: [0, -7, 6, -4, 2, 0] }, duration: 0.9, ease: "power1.inOut" }, capAt)
          .to("[data-fill]", { backgroundColor: "#E0574F", duration: 0.3 }, capAt)
          .fromTo("[data-nope]", { autoAlpha: 0, scale: 0.6, y: 20 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(2)" }, capAt + 0.2)
          .fromTo(
            "[data-bounce]",
            { xPercent: -50, yPercent: -50, x: "40vw", y: "-30vh", autoAlpha: 1 },
            { keyframes: [{ x: "4vw", y: "-4vh", duration: 0.5, ease: "power2.in" }, { x: "30vw", y: "40vh", rotate: 220, autoAlpha: 0, duration: 0.7, ease: "power1.out" }] },
            capAt + 0.4,
          )
          .to({}, { duration: 0.6 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="limit-title" className="relative flex min-h-[100dvh] items-center overflow-hidden bg-surface-sunken px-4 py-20">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-[1fr_1.1fr]">
        <div className="order-2 md:order-1">
          <h2 id="limit-title" className="font-display text-[clamp(2.2rem,5.5vw,4.25rem)] font-semibold leading-[0.95] tracking-tight text-balance">
            Your wallet says no so you don&apos;t have to
          </h2>
          <p className="mt-5 max-w-md text-lg text-muted">
            Pick a daily budget. Cinnamon happily gobbles up payments until it is full, then politely refuses
            anything more until tomorrow. No willpower required.
          </p>

          <div className="mt-8 max-w-md" role="group" aria-label="Daily spending">
            <div className="mb-2 flex items-baseline justify-between font-display">
              <span className="text-base font-semibold">Spent today</span>
              <span className="tabular text-2xl font-semibold">
                <span ref={amount}>0.50</span>
                <span className="text-muted"> / 0.50 ETH</span>
              </span>
            </div>
            {/* Cinnamon-stick progress bar */}
            <div className="relative h-7 overflow-hidden rounded-chip bg-[#a0582d] outline-cel shadow-[inset_0_-4px_0_rgb(0_0_0/0.18)]">
              <div aria-hidden className="absolute inset-0 bg-[repeating-linear-gradient(115deg,transparent_0_14px,rgb(123_63_30/0.45)_14px_17px)]" />
              <div data-fill className="absolute inset-y-0 left-0 w-full origin-left rounded-chip bg-caramel shadow-[inset_0_4px_0_rgb(255_253_248/0.45)]" />
            </div>
            <Caption className="mt-3">A rule module checks every payment against your cap.</Caption>
          </div>
        </div>

        <div className="relative order-1 mx-auto w-[clamp(200px,60vw,440px)] md:order-2">
          <div data-gulp className="origin-bottom">
            <PoseStack poses={["sending", "blocked"]} shown="blocked" />
          </div>
          <p data-nope className="absolute -top-2 right-0 rotate-6 rounded-pill bg-danger px-4 py-2 font-display text-xl font-semibold text-on-danger outline-cel shadow-soft">
            Nope! Try tomorrow.
          </p>
          {COINS.map((_, i) => (
            <span key={i} data-coin={i} className="invisible absolute top-1/2 left-1/2">
              <Coin size={48} />
            </span>
          ))}
          <span data-bounce className="invisible absolute top-1/2 left-1/2">
            <Coin size={48} />
          </span>
        </div>
      </div>
    </section>
  );
}
