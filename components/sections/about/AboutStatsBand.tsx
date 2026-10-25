"use client";

import { useRef } from "react";
import { Container, Eyebrow } from "@/components/ui";
import { Counter, SplitHeading } from "@/components/animations";
import { statsContent } from "@/data/home";
import { gsap, useGSAP } from "@/lib/gsap";

export function AboutStatsBand() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current || !gridRef.current) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) return;

      const lines = gridRef.current.querySelectorAll<HTMLDivElement>(
        "[data-stat-line]"
      );
      if (!lines.length) return;

      gsap.set(lines, { scaleX: 0, transformOrigin: "left center" });

      gsap.to(lines, {
        scaleX: 1,
        duration: 1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
          once: true,
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-brand-dark text-white overflow-hidden py-20 sm:py-28 lg:py-32"
      aria-labelledby="about-stats-heading"
    >
      {/* Subtle ambient accent glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] sm:w-[900px] sm:h-[450px] bg-accent/10 blur-[130px] rounded-full"
        aria-hidden="true"
      />

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end mb-16 sm:mb-20">
          <div className="lg:col-span-7 text-center lg:text-left">
            <Eyebrow color="inverse" className="mb-4">
              By The Numbers
            </Eyebrow>
            <SplitHeading
              id="about-stats-heading"
              as="h2"
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white leading-[1.12]"
            >
              {statsContent.title}
            </SplitHeading>
          </div>

          <div className="lg:col-span-5 text-center lg:text-left">
            <p className="text-white/70 text-base sm:text-lg leading-relaxed font-body max-w-xl mx-auto lg:mx-0">
              {statsContent.intro}
            </p>
          </div>
        </div>

        {/* 4-column Stats Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
          role="list"
          aria-label="Clinical impact metrics"
        >
          {statsContent.stats.map((stat) => {
            const accessibleLabel = `${stat.prefix || ""}${stat.value}${
              stat.suffix || ""
            } ${stat.label}. ${stat.description}`;

            return (
              <div
                key={stat.id}
                role="listitem"
                aria-label={accessibleLabel}
                className="group flex flex-col justify-start"
              >
                <div
                  data-stat-line
                  className="h-[1px] w-full bg-white/15 origin-left mb-6 sm:mb-8"
                  aria-hidden="true"
                />

                <div aria-hidden="true">
                  <Counter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-2"
                  />
                </div>

                <h3 className="font-display text-lg sm:text-xl font-semibold text-white/95 mb-2">
                  {stat.label}
                </h3>

                <p className="font-body text-sm sm:text-base text-white/60 leading-relaxed">
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
