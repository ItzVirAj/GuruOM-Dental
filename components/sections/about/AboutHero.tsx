"use client";

import React, { useRef } from "react";
import { Container } from "@/components/ui/Container";
import { gsap, useGSAP } from "@/lib/gsap";

export const AboutHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion || !containerRef.current) return;

      gsap.fromTo(
        ".apple-hero-anim",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-surface pt-28 pb-20 sm:pt-36 sm:pb-28 border-b border-line/60"
    >
      {/* Apple-style subtle ambient warmth radial backdrop */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(247,146,47,0.08),transparent_70%)]"
        aria-hidden="true"
      />

      <Container className="relative z-10 text-center">
        {/* Eyebrow Pill */}
        <div className="apple-hero-anim inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-line shadow-xs mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
          </span>
          <span className="font-display font-semibold text-xs tracking-wider uppercase text-ink">
            About GuruOm Dental • Founded 2019
          </span>
        </div>

        {/* Apple Display Headline */}
        <h1 className="apple-hero-anim font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-ink text-balance max-w-4xl mx-auto leading-[1.08] mb-8">
          Where Clinical Artistry Meets{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-brand-dark to-accent">
            Digital Precision.
          </span>
        </h1>

        {/* Narrative Subtitle */}
        <p className="apple-hero-anim font-body text-lg sm:text-xl text-ink-muted max-w-3xl mx-auto leading-relaxed">
          From acquiring Central Maharashtra&apos;s earliest intraoral scanners in 2019
          to establishing the largest emerging digital dental lab in the region —
          we unite biological preservation, computer-guided prosthetics, and
          compassionate, anxiety-free patient care.
        </p>
      </Container>
    </section>
  );
};
