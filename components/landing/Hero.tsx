"use client";

import { useRef } from "react";
import { ButtonLink } from "@/components/Button";
import { MOTION_OK, gsap, useGSAP } from "./gsap";
import { PoseStack } from "./PoseStack";
import { Swirl } from "./Swirl";

/** `front` words sit above the mascot, the rest peek out from behind it. */
const LINES = [
  [{ w: "A", front: false }, { w: "tiny", front: true }, { w: "wallet", front: false }],
  [{ w: "with", front: false }, { w: "big", front: false }, { w: "rules", front: true }],
];

const PARTICLES = [
  { left: "5%", top: "16%", size: 34 },
  { left: "90%", top: "10%", size: 26 },
  { left: "82%", top: "66%", size: 40 },
  { left: "10%", top: "72%", size: 24 },
  { left: "50%", top: "4%", size: 20 },
  { left: "28%", top: "40%", size: 18 },
  { left: "70%", top: "34%", size: 22 },
];

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
        intro
          .from("[data-word]", { yPercent: 115, rotate: 4, duration: 1.1, stagger: 0.08 })
          .from("[data-drop]", { y: () => -window.innerHeight, duration: 0.7, ease: "power3.in" }, 0.15)
          .to("[data-drop]", { scaleY: 0.72, scaleX: 1.22, duration: 0.12, ease: "power2.out" })
          .to("[data-drop]", { scaleY: 1, scaleX: 1, duration: 1.1, ease: "elastic.out(1.1, 0.32)" })
          .from("[data-hero-fade]", { autoAlpha: 0, y: 20, duration: 0.8, stagger: 0.1 }, "-=0.9");

        gsap.utils.toArray<HTMLElement>("[data-particle]").forEach((el, i) => {
          gsap.to(el, { y: "random(-18, 18)", rotate: "random(-40, 40)", duration: "random(4, 7)", repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * 0.3 });
          gsap.to(el, { yPercent: -120 * (1 + (i % 3)), ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
        });

        // On scroll the mascot shrinks and slides down toward the next chapter.
        gsap.to("[data-travel]", {
          scale: 0.38,
          y: () => window.innerHeight * 0.55,
          autoAlpha: 0,
          ease: "power1.in",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.6 },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="hero-title" className="relative isolate flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-16">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 size-[min(120vw,900px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(232_162_92/0.35),transparent_65%)]" />
        {PARTICLES.map((p, i) => (
          <span key={i} data-particle className="absolute text-caramel opacity-70" style={{ left: p.left, top: p.top }}>
            <Swirl size={p.size} />
          </span>
        ))}
      </div>

      <h1 id="hero-title" className="relative w-full max-w-7xl text-center font-display font-semibold leading-[0.88] tracking-tight text-balance text-[clamp(3.4rem,14vw,11.5rem)]">
        {LINES.map((line, li) => (
          <span key={li} className={`flex flex-wrap justify-center gap-x-[0.22em] ${li === 1 ? "mt-[clamp(9rem,34vw,17rem)]" : ""}`}>
            {line.map(({ w, front }) => (
              <span key={w} className={`relative inline-block overflow-hidden pb-[0.08em] ${front ? "z-20" : "z-0"}`}>
                <span data-word className={`inline-block ${w === "big" || w === "tiny" ? "text-primary" : ""}`}>
                  {w}
                </span>
              </span>
            ))}
          </span>
        ))}
      </h1>

      <div data-travel className="pointer-events-none absolute top-1/2 left-1/2 z-10 w-[clamp(220px,52vw,500px)] -translate-x-1/2 -translate-y-[46%]">
        <div data-drop className="origin-bottom">
          <PoseStack poses={["idle"]} priority sizes="(min-width: 768px) 500px, 60vw" className="drop-shadow-[0_30px_40px_rgb(var(--shadow-color)/0.35)]" />
        </div>
      </div>

      <div className="relative z-20 mt-10 flex flex-col items-center gap-5 text-center">
        <p data-hero-fade className="max-w-md text-lg text-muted">
          Meet Cinnamon. A pocket-sized wallet that keeps its promises, even when you would rather it did not.
        </p>
        <div data-hero-fade>
          <ButtonLink href="/app">Open the app</ButtonLink>
        </div>
      </div>
    </section>
  );
}
