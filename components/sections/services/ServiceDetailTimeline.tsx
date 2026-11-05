"use client";

import React, { useRef } from "react";
import { ServiceProcessStep } from "@/data/services";
import { gsap, useGSAP } from "@/lib/gsap";

export interface ServiceDetailTimelineProps {
  steps: ServiceProcessStep[];
}

export function ServiceDetailTimeline({ steps }: ServiceDetailTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current || !lineRef.current) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        gsap.set(lineRef.current, { scaleY: 1 });
        return;
      }

      // Vertical line draws as the user scrolls through the timeline steps
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
            end: "bottom 75%",
            scrub: 0.6,
          },
        }
      );
    },
    { scope: containerRef, dependencies: [steps] }
  );

  return (
    <div ref={containerRef} className="relative mt-8">
      {/* Background Rail Line */}
      <div
        className="absolute top-4 bottom-4 left-4 sm:left-5 w-0.5 bg-line -translate-x-1/2"
        aria-hidden="true"
      />

      {/* Animated Foreground Drawing Line */}
      <div
        ref={lineRef}
        className="absolute top-4 bottom-4 left-4 sm:left-5 w-0.5 bg-brand -translate-x-1/2 origin-top will-change-transform"
        aria-hidden="true"
      />

      <div className="space-y-8 sm:space-y-10">
        {steps.map((step, idx) => (
          <div key={idx} className="relative flex items-start gap-4 sm:gap-6 pl-1 sm:pl-2">
            {/* Center Circle Indicator */}
            <div
              className="relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border-2 border-brand flex items-center justify-center font-display text-xs font-bold text-brand shadow-xs shrink-0 mt-0.5"
              aria-hidden="true"
            >
              {idx + 1}
            </div>

            {/* Step Card Content */}
            <div className="flex-1 p-5 sm:p-6 rounded-2xl bg-surface border border-line shadow-xs">
              <h3 className="font-display text-base sm:text-lg font-bold text-ink mb-1.5">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-body">
                {step.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

