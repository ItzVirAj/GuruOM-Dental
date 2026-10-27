"use client";

import React, { useRef } from "react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import {
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";

export const AboutTechBento: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion || !sectionRef.current) return;

      gsap.fromTo(
        ".tech-bento-anim",
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative bg-surface py-20 sm:py-28 lg:py-32 border-b border-line/60 overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute right-0 top-1/4 w-96 h-96 bg-accent/6 rounded-full blur-[120px]"
        aria-hidden="true"
      />

      <Container>
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
          <div className="inline-flex justify-center mb-4">
            <Eyebrow variant="dot" color="accent">
              In-House Digital Infrastructure
            </Eyebrow>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink mb-6">
            Engineered for Sub-Millimeter Precision
          </h2>
          <p className="font-body text-base sm:text-lg text-ink-muted leading-relaxed">
            GuruOm operates an advanced in-house dental laboratory equipped with
            industrial-grade additive and subtractive digital technologies.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Bento Card 1: DMLS 3D Metal Printer (Large Hero Card - 7 cols) */}
          <div className="tech-bento-anim lg:col-span-7 rounded-3xl bg-white border border-line/70 p-8 sm:p-12 shadow-card hover:shadow-float transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-soft text-accent-deep text-xs font-mono font-bold mb-6">
                <Zap className="w-3.5 h-3.5" />
                DMLS Technology
              </div>

              <h3 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-4 tracking-tight">
                Direct Metal Laser Sintering (DMLS)
              </h3>

              <p className="font-body text-base text-ink-muted leading-relaxed mb-8">
                Our in-house 3D metal printer harnesses precision laser sintering
                to fuse medical-grade cobalt-chrome and titanium powders layer by
                layer. This achieves zero internal voids, ultra-high tensile
                strength, and exact passive fit for full-arch implant frameworks
                and cast partial dentures.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-surface p-4 border border-line/60">
                  <div className="font-display text-xl font-bold text-brand mb-1">
                    Zero Porosity
                  </div>
                  <div className="font-body text-xs text-ink-muted">
                    Uniform metallic density preventing structural micro-fractures
                  </div>
                </div>
                <div className="rounded-2xl bg-surface p-4 border border-line/60">
                  <div className="font-display text-xl font-bold text-brand mb-1">
                    Sub-Micron Seal
                  </div>
                  <div className="font-body text-xs text-ink-muted">
                    Tight biological fit with zero bacteria-harboring micro-gaps
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-line/60 flex items-center justify-between text-xs font-semibold text-brand-dark">
              <span>Biocompatible Medical Alloys</span>
              <span className="text-accent font-mono font-bold">100% Digital Workflow</span>
            </div>
          </div>

          {/* Bento Card 2: 3D Intraoral Optical Scanners (5 cols) */}
          <div className="tech-bento-anim lg:col-span-5 rounded-3xl bg-white border border-line/70 p-8 sm:p-10 shadow-card hover:shadow-float transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-alt text-brand text-xs font-mono font-bold mb-6">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                Zero Putty Impressions
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-4 tracking-tight">
                Intraoral 3D Optical Scanning
              </h3>

              <p className="font-body text-sm sm:text-base text-ink-muted leading-relaxed mb-6">
                High-speed chairside digital wands capture millions of 3D data points
                in seconds with natural color rendering. Completely eliminates gagging,
                tray distortion, and impression delays.
              </p>

              <div className="space-y-2.5">
                {[
                  "True real-time color margin detection",
                  "Immediate digital preview of smile aesthetics",
                  "Direct cloud transmission to CAD workstations",
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-ink/90"
                  >
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-line/60 text-xs font-mono text-ink-muted">
              First Intraoral Scanner in Ahilyanagar (2019)
            </div>
          </div>

          {/* Bento Card 3: 5-Axis Robotic CAD/CAM Milling (6 cols) */}
          <div className="tech-bento-anim lg:col-span-6 rounded-3xl bg-white border border-line/70 p-8 sm:p-10 shadow-card hover:shadow-float transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-alt text-brand text-xs font-mono font-bold mb-6">
                <Cpu className="w-3.5 h-3.5 text-accent" />
                Subtractive Precision
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-4 tracking-tight">
                5-Axis Robotic CAD/CAM Milling
              </h3>

              <p className="font-body text-sm sm:text-base text-ink-muted leading-relaxed mb-6">
                High-precision multi-axis wet and dry milling units sculpt monolithic
                zirconia, lithium disilicate (e.max), and hybrid ceramics with
                marginal tolerances down to 10 microns.
              </p>

              <div className="p-4 rounded-2xl bg-surface border border-line/60 flex items-center justify-between">
                <div>
                  <div className="font-display font-bold text-ink text-sm">
                    Monolithic Zirconia & Ceramics
                  </div>
                  <div className="font-body text-xs text-ink-muted">
                    Lifelike translucency matching natural dental enamel
                  </div>
                </div>
                <span className="font-mono text-sm font-bold text-accent-deep bg-accent-soft px-3 py-1 rounded-lg">
                  10 &mu;m fit
                </span>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-line/60 text-xs font-medium text-ink-muted">
              Robotic calibration ensures lasting occlusion balance
            </div>
          </div>

          {/* Bento Card 4: 3D Surgical Guided Stents (6 cols) */}
          <div className="tech-bento-anim lg:col-span-6 rounded-3xl bg-white border border-line/70 p-8 sm:p-10 shadow-card hover:shadow-float transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-alt text-brand text-xs font-mono font-bold mb-6">
                <Layers className="w-3.5 h-3.5 text-accent" />
                Guided Surgery
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-4 tracking-tight">
                Surgical Guides & 3D Resin Printing
              </h3>

              <p className="font-body text-sm sm:text-base text-ink-muted leading-relaxed mb-6">
                By merging 3D CBCT bone scans with optical dental models, we 3D-print
                custom surgical guides that lock implant angulation, depth, and safety
                margins for flapless, painless placement.
              </p>

              <div className="p-4 rounded-2xl bg-surface border border-line/60 flex items-center justify-between">
                <div>
                  <div className="font-display font-bold text-ink text-sm">
                    All-on-4 & Basal Protocols
                  </div>
                  <div className="font-body text-xs text-ink-muted">
                    Flapless guided surgery enables rapid recovery
                  </div>
                </div>
                <span className="font-mono text-sm font-bold text-success bg-success/10 text-success px-3 py-1 rounded-lg">
                  Flapless
                </span>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-line/60 text-xs font-medium text-ink-muted">
              Pre-planned computerized safety zones
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
