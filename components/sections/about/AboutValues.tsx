"use client";

import React, { useRef } from "react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heart, ShieldCheck, Sparkles, FileCheck2 } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";

const clinicalPillars = [
  {
    icon: Sparkles,
    number: "01",
    title: "Biological Tooth Preservation",
    description:
      "We believe natural tooth enamel is irreplaceable. Using high-magnification optical microscopes and adhesive biomimetic dentistry, we remove only decayed tissue and protect healthy biological tooth structure.",
    accent: "Preserve Natural Structure",
  },
  {
    icon: ShieldCheck,
    number: "02",
    title: "Digital Predictability",
    description:
      "By replacing manual impressions and hand-waxing with optical scanners and robotic CAD/CAM workflows, we eliminate guesswork and ensure reliable, sub-micron restorative fits.",
    accent: "Sub-Micron Accuracy",
  },
  {
    icon: Heart,
    number: "03",
    title: "Anxiety-Free Patient Comfort",
    description:
      "Dental fear should never stand between a patient and a healthy smile. Gentle computer-assisted local anesthesia, acoustic dampening, and empathetic communication make every appointment calm.",
    accent: "Gentle Anesthesia",
  },
  {
    icon: FileCheck2,
    number: "04",
    title: "Radical Clinical Ethics",
    description:
      "We practice transparent, evidence-based medicine. We provide itemized written treatment breakdowns, clear digital x-ray explanations, and zero high-pressure upsells or redundant procedures.",
    accent: "Honest Healthcare",
  },
];

export const AboutValues: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion || !sectionRef.current) return;

      gsap.fromTo(
        ".value-card-anim",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
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
      className="relative bg-white py-20 sm:py-28 lg:py-32 border-b border-line/60"
    >
      <Container>
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
          <div className="inline-flex justify-center mb-4">
            <Eyebrow variant="dot" color="brand">
              Guiding Principles
            </Eyebrow>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink mb-6">
            The Four Pillars of GuruOm Care
          </h2>
          <p className="font-body text-base sm:text-lg text-ink-muted leading-relaxed">
            Every clinical diagnosis, surgical plan, and restorative design is
            grounded in medical ethics and genuine patient respect.
          </p>
        </div>

        {/* 4 Pillars Apple Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {clinicalPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="value-card-anim group rounded-3xl bg-surface border border-line/70 p-8 shadow-soft hover:shadow-card hover:-translate-y-1 hover:border-accent/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Number & Icon */}
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-mono text-xs font-bold text-ink-muted">
                      {pillar.number}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-white text-brand border border-line/70 flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:text-accent group-hover:border-accent/30 transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-ink mb-3 tracking-tight">
                    {pillar.title}
                  </h3>

                  {/* Description */}
                  <p className="font-body text-sm text-ink-muted leading-relaxed mb-6">
                    {pillar.description}
                  </p>
                </div>

                {/* Bottom Tag */}
                <div className="pt-4 border-t border-line/60 text-xs font-semibold text-accent-deep">
                  {pillar.accent}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
