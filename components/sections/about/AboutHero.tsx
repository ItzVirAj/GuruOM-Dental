"use client";

import React, { useRef } from "react";
import { Sparkles, Award, MapPin, Users, Cpu } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { gsap, useGSAP } from "@/lib/gsap";

const keyStats = [
  {
    icon: Award,
    value: "2019",
    label: "Founded in Ahilyanagar",
    detail: "Region's early digital scanner pioneers",
  },
  {
    icon: Users,
    value: "40+",
    label: "Specialist Team",
    detail: "Prosthodontists, surgeons & technicians",
  },
  {
    icon: MapPin,
    value: "30+",
    label: "Maharashtra Cities",
    detail: "Ahilyanagar, Pune, Nashik & beyond",
  },
  {
    icon: Users,
    value: "800+",
    label: "Partner Dentists",
    detail: "Entrusted by clinicians statewide",
  },
  {
    icon: Cpu,
    value: "DMLS",
    label: "3D Metal Printing",
    detail: "Direct metal laser sintering lab",
  },
];

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
        <p className="apple-hero-anim font-body text-lg sm:text-xl text-ink-muted max-w-3xl mx-auto leading-relaxed mb-12 sm:mb-16">
          From acquiring Central Maharashtra's earliest intraoral scanners in 2019
          to establishing the largest emerging digital dental lab in the region —
          we unite biological preservation, computer-guided prosthetics, and
          compassionate, anxiety-free patient care.
        </p>

        {/* Floating Apple Key Metrics Ribbon */}
        <div className="apple-hero-anim max-w-5xl mx-auto">
          <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-line/70 p-6 sm:p-8 shadow-card">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 divide-y md:divide-y-0 md:divide-x divide-line/60">
              {keyStats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    className={`flex flex-col items-center text-center ${
                      idx !== 0 ? "pt-6 md:pt-0 md:pl-6" : ""
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-accent-soft text-accent-deep flex items-center justify-center mb-3 shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="font-display text-3xl sm:text-4xl font-bold text-ink mb-1 tracking-tight">
                      {stat.value}
                    </div>
                    <div className="font-display font-semibold text-ink text-xs sm:text-sm mb-0.5">
                      {stat.label}
                    </div>
                    <div className="font-body text-[11px] text-ink-muted leading-tight">
                      {stat.detail}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
