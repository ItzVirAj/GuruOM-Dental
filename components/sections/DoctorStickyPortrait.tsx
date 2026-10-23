"use client";

import React, { useRef } from "react";
import { Doctor } from "@/data/doctors";
import { SmartImage, Button } from "@/components/ui";
import { Calendar } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/components/animations";

export interface DoctorStickyPortraitProps {
  doctor: Doctor;
}

export function DoctorStickyPortrait({ doctor }: DoctorStickyPortraitProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageInnerRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const container = containerRef.current;
      const inner = imageInnerRef.current;
      if (!container || !inner || prefersReducedMotion) return;

      // Desktop scrubbed subtle parallax
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        gsap.fromTo(
          inner,
          { yPercent: -4 },
          {
            yPercent: 4,
            ease: "none",
            scrollTrigger: {
              trigger: container,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });

      return () => mm.revert();
    },
    { scope: containerRef, dependencies: [prefersReducedMotion] }
  );

  // Extract first name for booking button CTA
  const doctorFirstName = doctor.name.replace(/^Dr\.\s+(?:Placeholder\s+)?/, "");

  return (
    <div
      ref={containerRef}
      className="lg:sticky lg:top-28 space-y-5"
    >
      {/* Frame: rounded-3xl with glass chip and portrait image */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-alt border border-surface-alt/90 shadow-md">
        {/* Aspect ratio: 4/5 on mobile, 3/4 on tablet/desktop */}
        <div className="relative aspect-[4/5] sm:aspect-[3/4] w-full overflow-hidden">
          <div ref={imageInnerRef} className="h-full w-full">
            <SmartImage
              slot={doctor.imageSlot}
              alt={`${doctor.name} - ${doctor.role}`}
              className="h-full w-full object-cover scale-105"
            />
          </div>

          {/* Glass Chip: Experience Years */}
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-dark/85 backdrop-blur-md text-xs font-medium text-white border border-white/15 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              {doctor.experienceYears}+ Years Clinical Practice
            </span>
          </div>

          {/* Subtle gradient vignette at bottom */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent"
          />
        </div>
      </div>

      {/* Desktop Booking CTA Button */}
      <div className="hidden lg:block">
        <Button
          href={`/appointment?doctor=${doctor.slug}`}
          variant="primary"
          size="lg"
          className="w-full flex items-center justify-center gap-2 shadow-sm hover:shadow-md py-4 text-base"
        >
          <Calendar className="h-5 w-5" />
          Book with Dr. {doctorFirstName}
        </Button>
        <p className="text-center text-xs text-ink-muted mt-2">
          Priority consultation slots • Zero advance fee
        </p>
      </div>
    </div>
  );
}

export default DoctorStickyPortrait;
