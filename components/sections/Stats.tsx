"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, EASE, useGSAP } from "@/lib/gsap";
import { Container, Eyebrow } from "@/components/ui";
import { Counter, SplitHeading, useReducedMotion } from "@/components/animations";
import { statsContent, StatItem } from "@/data/home";

export interface StatsProps {
  content?: typeof statsContent;
}

export function Stats({ content = statsContent }: StatsProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // -------------------------------------------------------------
  // GSAP: Animate the top border lines of each stat cell & sync with fonts
  // -------------------------------------------------------------
  useGSAP(
    () => {
      // Refresh ScrollTrigger when fonts are loaded to accurately calculate layout positions
      if (typeof document !== "undefined" && document.fonts) {
        document.fonts.ready.then(() => {
          ScrollTrigger.refresh();
        });
      }

      if (!gridRef.current || prefersReducedMotion) return;

      const lines = gridRef.current.querySelectorAll<HTMLDivElement>("[data-stat-line]");
      if (!lines.length) return;

      // Initial state: scaled to 0 on X axis from left
      gsap.set(lines, { scaleX: 0, transformOrigin: "left center" });

      gsap.to(lines, {
        scaleX: 1,
        duration: 1.1,
        ease: EASE.smooth,
        stagger: 0.12,
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
          once: true,
        },
      });
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion] }
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-brand-dark text-white overflow-hidden py-24 sm:py-32 lg:py-36"
      aria-labelledby="stats-heading"
    >
      {/* Subtle large radial ambient glow in accent token behind the numbers */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] sm:w-[900px] sm:h-[480px] bg-accent/10 blur-[130px] rounded-full"
        aria-hidden="true"
      />

      <Container>
        {/* Top Header: Eyebrow + SplitHeading (Mobile centered, Desktop Left/Right split) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end mb-16 sm:mb-20 lg:mb-24">
          <div className="lg:col-span-7 text-center lg:text-left">
            <Eyebrow color="inverse" className="mb-4">
              {content.eyebrow}
            </Eyebrow>
            <SplitHeading
              as="h2"
              type="lines"
              mask
              start="top 80%"
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white leading-[1.12]"
            >
              {content.title}
            </SplitHeading>
          </div>

          <div className="lg:col-span-5 text-center lg:text-left">
            <p className="text-white/70 text-base sm:text-lg leading-relaxed font-sans max-w-xl mx-auto lg:mx-0">
              {content.intro}
            </p>
          </div>
        </div>

        {/* 4-Column Stats Grid (1 col mobile, 2x2 tablet, 4 cols desktop) */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 sm:gap-x-10 sm:gap-y-14 lg:gap-x-12"
          role="list"
          aria-label="Clinical impact metrics"
        >
          {content.stats.map((stat: StatItem, idx: number) => {
            const accessibleLabel = `${stat.prefix || ""}${stat.value}${stat.suffix || ""} ${stat.label}. ${stat.description}`;

            return (
              <div
                key={stat.id}
                role="listitem"
                aria-label={accessibleLabel}
                className="group flex flex-col justify-start"
              >
                {/* Thin top border (white at 15%) that draws left to right on entry */}
                <div
                  data-stat-line
                  className="h-[1px] w-full bg-white/15 origin-left mb-6 sm:mb-8"
                  style={prefersReducedMotion ? { transform: "none" } : undefined}
                  aria-hidden="true"
                />

                {/* Counter visual display */}
                <div aria-hidden="true">
                  <Counter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    delay={idx * 0.12}
                    start="top 75%"
                    duration={1.8}
                    stagger={0.07}
                    triggerRef={gridRef}
                    className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-aileron font-semibold text-white tracking-tight leading-none"
                    digitClassName="text-white font-aileron font-semibold"
                    prefixClassName="text-white font-aileron font-semibold text-[0.6em] mr-1"
                    suffixClassName="text-white font-aileron font-semibold text-[0.65em] ml-1"
                  />
                </div>

                {/* Label in uppercase small eyebrow style */}
                <h3
                  aria-hidden="true"
                  className="text-xs sm:text-sm font-aileron font-normal uppercase tracking-widest text-white/90 mt-4 sm:mt-5"
                >
                  {stat.label}
                </h3>

                {/* Description in white at 60% */}
                <p
                  aria-hidden="true"
                  className="text-sm text-white/60 leading-relaxed mt-2"
                >
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export default Stats;
