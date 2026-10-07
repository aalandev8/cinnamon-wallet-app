"use client";

import { useRef } from "react";
import { Caption } from "./Caption";
import { MOTION_OK, gsap, useGSAP } from "./gsap";
import { Coin } from "./Swirl";

const STOPS = [
  { name: "Sign", body: "You tap approve. Your key puts its little seal on the payment." },
  { name: "Bundler", body: "A courier scoops it up with others headed the same way." },
  { name: "EntryPoint", body: "The front desk of the chain checks the paperwork." },
  { name: "Your wallet", body: "Cinnamon receives it and gets ready to pay." },
  { name: "Rule check", body: "Your house rules get the final say. Within budget? Off it goes." },
];

/** Curvy route in a 1000x240 box; stops sit at x = 100, 300, 500, 700, 900. */
const ROUTE = "M0 140 C 50 140, 60 60, 100 60 S 200 200, 300 180 S 420 50, 500 60 S 620 200, 700 180 S 820 50, 900 70 S 980 140, 1000 140";
const STOP_Y = [60, 180, 60, 180, 70];

export function PaymentJourney() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(`${MOTION_OK} and (min-width: 768px)`, () => {
        const el = track.current;
        if (!el) return;
        const distance = () => el.scrollWidth - window.innerWidth;
        const stops = gsap.utils.toArray<HTMLElement>("[data-stop]");
        const light = (p: number) => stops.forEach((s, i) => s.toggleAttribute("data-lit", p >= (i * 2 + 1) / 10 - 0.04));
        light(0);

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance() + window.innerHeight * 0.5}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => light(self.progress),
          },
        });
        tl.to(el, { x: () => -distance(), duration: 1 }, 0).to(
          "[data-traveler]",
          { motionPath: { path: "#route", align: "#route", alignOrigin: [0.5, 0.5], autoRotate: false }, rotate: 720, duration: 1 },
          0,
        );
        return () => stops.forEach((s) => s.removeAttribute("data-lit"));
      });

      mm.add(`${MOTION_OK} and (max-width: 767px)`, () => {
        gsap.utils.toArray<HTMLElement>("[data-stop]").forEach((s) => {
          gsap.from(s, { autoAlpha: 0, y: 40, duration: 0.7, ease: "back.out(1.6)", scrollTrigger: { trigger: s, start: "top 85%", toggleActions: "play none none reverse" } });
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="journey-title" className="relative overflow-hidden bg-surface-sunken py-20 md:flex md:min-h-[100dvh] md:flex-col md:justify-center md:py-12">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 id="journey-title" className="font-display text-[clamp(2.4rem,6vw,4.5rem)] font-semibold leading-[0.95] tracking-tight">
          How a payment travels
        </h2>
        <p className="mt-3 max-w-md text-lg text-muted">Five quick stops between your tap and the other side.</p>
        <Caption className="mt-3">ERC-4337 UserOperation flow</Caption>
      </div>

      <div ref={track} className="relative mt-10 px-4 md:mt-6 md:w-[max(260vw,1800px)] md:px-0 motion-reduce:md:mx-auto motion-reduce:md:w-full motion-reduce:md:max-w-6xl motion-reduce:md:px-4">
        <svg aria-hidden viewBox="0 0 1000 240" preserveAspectRatio="none" className="absolute inset-x-0 top-0 hidden h-[240px] w-full md:block motion-reduce:md:hidden">
          <path id="route" d={ROUTE} fill="none" stroke="var(--highlight)" strokeWidth="6" strokeLinecap="round" strokeDasharray="2 14" vectorEffect="non-scaling-stroke" />
        </svg>
        <span data-traveler aria-hidden className="absolute top-0 left-0 z-10 hidden md:block motion-reduce:md:hidden">
          <Coin size={56} />
        </span>

        <ol className="relative flex flex-col gap-4 md:block md:h-[440px] motion-reduce:md:grid motion-reduce:md:h-auto motion-reduce:md:grid-cols-5">
          {STOPS.map((s, i) => (
            <li
              key={s.name}
              data-stop
              className="group rounded-card bg-surface p-5 outline-cel shadow-soft md:absolute md:w-[min(22vw,320px)] md:-translate-x-1/2 md:opacity-50 md:transition-[opacity,transform] md:duration-500 md:ease-spring md:data-lit:-translate-y-2 md:data-lit:opacity-100 motion-reduce:md:static motion-reduce:md:w-auto motion-reduce:md:translate-x-0 motion-reduce:md:opacity-100"
              style={{ left: `${10 + i * 20}%`, top: STOP_Y[i] + 50 }}
            >
              <span className="mb-2 flex items-center gap-2 font-mono text-xs text-muted">
                <span className="grid size-7 place-items-center rounded-full bg-highlight font-display text-sm font-semibold text-cinnamon group-data-lit:bg-primary group-data-lit:text-on-primary">
                  {i + 1}
                </span>
              </span>
              <h3 className="font-display text-2xl font-semibold">{s.name}</h3>
              <p className="mt-1 text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
