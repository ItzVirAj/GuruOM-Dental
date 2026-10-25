"use client";

import { useRef } from "react";
import { Container, Eyebrow } from "@/components/ui";
import { SplitHeading } from "@/components/animations";
import { aboutPageContent } from "@/data/about";
import { gsap, useGSAP } from "@/lib/gsap";

export function AboutApproach() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const stepsContainerRef = useRef<HTMLDivElement>(null);

  const { approach } = aboutPageContent;

  useGSAP(
    () => {
      if (!sectionRef.current || !lineRef.current) return;

      const mm = gsap.matchMedia();

      // Check reduced motion
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        gsap.set(lineRef.current, { scaleY: 1 });
        return;
      }

      mm.add(
        {
          isDesktop: "(min-width: 1024px)",
          isMobile: "(max-width: 1023px)",
        },
        (context) => {
          const { isDesktop } = context.conditions as {
            isDesktop: boolean;
            isMobile: boolean;
          };

          // 1. Scrubbed vertical line draw
          gsap.fromTo(
            lineRef.current,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: {
                trigger: stepsContainerRef.current,
                start: "top 70%",
                end: "bottom 80%",
                scrub: 0.8,
              },
            }
          );

          // 2. Step cards reveal progressively
          const stepCards = gsap.utils.toArray<HTMLElement>(".approach-card");
          const stepNodes = gsap.utils.toArray<HTMLElement>(".approach-node");

          stepCards.forEach((card, index) => {
            const isEven = index % 2 === 0;
            const xOffset = isDesktop ? (isEven ? -40 : 40) : 30;

            gsap.fromTo(
              card,
              {
                opacity: 0,
                x: xOffset,
                y: 20,
              },
              {
                opacity: 1,
                x: 0,
                y: 0,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: card,
                  start: "top 80%",
                  toggleActions: "play none none reverse",
                },
              }
            );
          });

          stepNodes.forEach((node) => {
            gsap.fromTo(
              node,
              { scale: 0, opacity: 0 },
              {
                scale: 1,
                opacity: 1,
                duration: 0.5,
                ease: "back.out(2)",
                scrollTrigger: {
                  trigger: node,
                  start: "top 78%",
                  toggleActions: "play none none reverse",
                },
              }
            );
          });
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative bg-surface-alt py-20 md:py-28 lg:py-32 overflow-hidden border-t border-border"
      aria-labelledby="approach-heading"
    >
      <Container>
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16 md:mb-24">
          <Eyebrow className="justify-center mb-3">
            {approach.eyebrow}
          </Eyebrow>
          <SplitHeading
            id="approach-heading"
            as="h2"
            className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink mb-5"
          >
            {approach.title}
          </SplitHeading>
          <p className="text-ink-muted text-base md:text-lg leading-relaxed font-body">
            {approach.description}
          </p>
        </div>

        {/* Steps Timeline */}
        <div ref={stepsContainerRef} className="relative mx-auto max-w-5xl">
          {/* Vertical Tracking Line */}
          {/* Desktop: center line */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-border pointer-events-none"
          >
            <div
              ref={lineRef}
              className="w-full h-full bg-accent origin-top scale-y-0"
            />
          </div>

          {/* Mobile: left-aligned line */}
          <div
            aria-hidden="true"
            className="lg:hidden absolute left-6 top-0 bottom-0 w-0.5 bg-border pointer-events-none"
          >
            <div className="w-full h-full bg-accent origin-top" />
          </div>

          {/* Steps List */}
          <div className="space-y-12 lg:space-y-20">
            {approach.steps.map((stepItem, index) => {
              const isEven = index % 2 === 0;

              return (
                <div
                  key={stepItem.step}
                  className="relative flex flex-col lg:grid lg:grid-cols-2 lg:gap-16 items-center"
                >
                  {/* Left Column (Desktop) */}
                  <div
                    className={`w-full ${
                      isEven
                        ? "lg:text-right order-2 lg:order-1"
                        : "lg:order-1 hidden lg:block"
                    }`}
                  >
                    {isEven && (
                      <div className="approach-card bg-surface p-6 sm:p-8 rounded-2xl shadow-card border border-border/80 ml-12 lg:ml-0 hover:border-accent/40 transition-colors">
                        <div className="inline-flex items-center gap-2 mb-3 lg:justify-end">
                          <span className="font-display font-semibold text-xs tracking-wider uppercase text-accent bg-accent-soft px-3 py-1 rounded-full">
                            Step {stepItem.step}
                          </span>
                        </div>
                        <h3 className="font-display font-semibold text-xl md:text-2xl text-ink mb-3">
                          {stepItem.title}
                        </h3>
                        <p className="text-ink-muted text-sm md:text-base leading-relaxed font-body mb-4">
                          {stepItem.description}
                        </p>
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          <span>{stepItem.highlight}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Center Node (Desktop & Mobile) */}
                  <div
                    className="approach-node absolute left-6 lg:left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-surface border-4 border-accent shadow-md z-10 text-ink font-display font-bold text-sm"
                    aria-hidden="true"
                  >
                    {stepItem.step}
                  </div>

                  {/* Right Column (Desktop) */}
                  <div
                    className={`w-full ${
                      !isEven
                        ? "order-2 lg:order-2"
                        : "lg:order-2 hidden lg:block"
                    }`}
                  >
                    {!isEven ? (
                      <div className="approach-card bg-surface p-6 sm:p-8 rounded-2xl shadow-card border border-border/80 ml-12 lg:ml-0 hover:border-accent/40 transition-colors">
                        <div className="inline-flex items-center gap-2 mb-3">
                          <span className="font-display font-semibold text-xs tracking-wider uppercase text-accent bg-accent-soft px-3 py-1 rounded-full">
                            Step {stepItem.step}
                          </span>
                        </div>
                        <h3 className="font-display font-semibold text-xl md:text-2xl text-ink mb-3">
                          {stepItem.title}
                        </h3>
                        <p className="text-ink-muted text-sm md:text-base leading-relaxed font-body mb-4">
                          {stepItem.description}
                        </p>
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          <span>{stepItem.highlight}</span>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Mobile Fallback for Odd Items */}
                  <div className="w-full lg:hidden order-2 mt-0">
                    {!isEven && (
                      <div className="approach-card bg-surface p-6 sm:p-8 rounded-2xl shadow-card border border-border/80 ml-12 hover:border-accent/40 transition-colors">
                        <div className="inline-flex items-center gap-2 mb-3">
                          <span className="font-display font-semibold text-xs tracking-wider uppercase text-accent bg-accent-soft px-3 py-1 rounded-full">
                            Step {stepItem.step}
                          </span>
                        </div>
                        <h3 className="font-display font-semibold text-xl md:text-2xl text-ink mb-3">
                          {stepItem.title}
                        </h3>
                        <p className="text-ink-muted text-sm md:text-base leading-relaxed font-body mb-4">
                          {stepItem.description}
                        </p>
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          <span>{stepItem.highlight}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
