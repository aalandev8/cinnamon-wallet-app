"use client";

import { useRef } from "react";
import { ButtonLink } from "@/components/Button";
import { MOTION_OK, gsap, useGSAP } from "./gsap";
import { PoseStack } from "./PoseStack";
import { Swirl } from "./Swirl";

const SPARKS = 14;
const SPARK_COLORS = ["text-caramel", "text-strawberry", "text-mint", "text-spice"];

export function FinalCta() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 60%", toggleActions: "play none none reverse" } });
        tl.from("[data-cta-mascot]", { scale: 0.4, y: 80, autoAlpha: 0, duration: 0.9, ease: "elastic.out(1, 0.45)" })
          .fromTo(
            "[data-spark]",
            { x: 0, y: 0, scale: 0, autoAlpha: 1 },
            {
              x: (i) => Math.cos((i / SPARKS) * Math.PI * 2) * gsap.utils.random(140, 260),
              y: (i) => Math.sin((i / SPARKS) * Math.PI * 2) * gsap.utils.random(120, 220),
              scale: () => gsap.utils.random(0.8, 1.6),
              rotate: () => gsap.utils.random(-180, 180),
              autoAlpha: 0,
              duration: 1.4,
              ease: "expo.out",
              stagger: 0.015,
            },
            "-=0.6",
          )
          .from("[data-cta-text]", { y: 40, autoAlpha: 0, duration: 0.8, ease: "expo.out", stagger: 0.1 }, "-=1.2");
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="cta-title" className="relative overflow-hidden px-4 pt-28 pb-24 text-center md:pt-40">
      <div className="relative mx-auto w-[clamp(180px,44vw,340px)]">
        <div aria-hidden className="pointer-events-none absolute top-1/2 left-1/2">
          {Array.from({ length: SPARKS }, (_, i) => (
            <span key={i} data-spark className={`invisible absolute -translate-1/2 ${SPARK_COLORS[i % SPARK_COLORS.length]}`}>
              <Swirl size={22} />
            </span>
          ))}
        </div>
        <div data-cta-mascot>
          <PoseStack poses={["success"]} />
        </div>
      </div>
      <h2 id="cta-title" data-cta-text className="mt-6 font-display text-[clamp(2.6rem,9vw,7rem)] font-semibold leading-[0.9] tracking-tight">
        Ready for a sweeter wallet?
      </h2>
      <div data-cta-text className="mt-8">
        <ButtonLink href="/app" className="min-h-16 px-10 text-2xl">
          Open the app
        </ButtonLink>
      </div>
    </section>
  );
}
