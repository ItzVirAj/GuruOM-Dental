"use client";

import React, { useRef } from "react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import {
  ScanLine,
  Cpu,
  Users,
  MapPin,
  TrendingUp,
  Award,
  ArrowRight,
} from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";

const storyCards = [
  {
    step: "01",
    tag: "The Digital Spark",
    year: "2019",
    icon: ScanLine,
    title: "Pioneering Intraoral 3D Scanning",
    description:
      "In the heart of Ahilyanagar, Guru-Om began with conventional dentistry. Recognizing the transformative potential of digital dentistry, founder Dr. Guruprasad Handal made a bold investment in the region's first intraoral 3D optical scanner — ending gag-inducing putty impressions forever.",
    highlight: "First scanner acquired in Ahilyanagar (2019)",
  },
  {
    step: "02",
    tag: "Infrastructure Leap",
    year: "2020 — 2022",
    icon: Cpu,
    title: "CAD/CAM, 3D Printing & DMLS",
    description:
      "We transformed from clinical practice to digital pioneers. Today, our laboratory features high-performance CAD software, robotic milling units, biocompatible 3D resin printers, and Direct Metal Laser Sintering (DMLS) 3D metal printing.",
    highlight: "DMLS 3D Metal Laser Printing Lab",
  },
  {
    step: "03",
    tag: "Human Expertise",
    year: "Team Growth",
    icon: Users,
    title: "From 7 to 40+ Dedicated Specialists",
    description:
      "When we began, our team was seven dedicated individuals. Today, our vibrant workforce exceeds 40 dental professionals — prosthodontists, general dentists, biomedical CAD designers, and certified dental lab technicians working in clinical synergy.",
    highlight: "40+ Integrated Clinical & Lab Team",
  },
  {
    step: "04",
    tag: "Statewide Expansion",
    year: "Present Day",
    icon: MapPin,
    title: "Over 30 Cities Across Maharashtra",
    description:
      "What started inside Ahmednagar now extends to Pune, Navi Mumbai, Nashik, Sambhajinagar, Solapur, Dharashiv, Dhule, Amravati, and beyond — establishing GuruOm as the largest emerging digital dental lab in Central Maharashtra.",
    highlight: "Trusted by 800+ dental surgeons",
  },
];

export const AboutStoryBento: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion || !sectionRef.current) return;

      gsap.fromTo(
        ".story-bento-card",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.14,
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
              The Evolution
            </Eyebrow>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink mb-6">
            From Conventional Roots to Digital Pioneers
          </h2>
          <p className="font-body text-base sm:text-lg text-ink-muted leading-relaxed">
            The milestone moments that reshaped our capabilities, broadened our
            geographic horizons, and redefined precision restorative dentistry.
          </p>
        </div>

        {/* 4-Card Apple Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {storyCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="story-bento-card group rounded-3xl bg-surface border border-line/70 p-8 sm:p-10 shadow-soft hover:shadow-card hover:border-accent/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Step & Tag */}
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <span className="font-mono text-xs font-bold tracking-wider text-accent-deep bg-accent-soft px-3 py-1 rounded-full border border-accent/20">
                      Phase {card.step} • {card.year}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-white text-brand border border-line/80 flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:text-accent transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-4 tracking-tight">
                    {card.title}
                  </h3>

                  {/* Narrative Description */}
                  <p className="font-body text-sm sm:text-base text-ink-muted leading-relaxed mb-6">
                    {card.description}
                  </p>
                </div>

                {/* Bottom Highlight Strip */}
                <div className="pt-4 border-t border-line/60 flex items-center justify-between text-xs font-semibold text-brand">
                  <span>{card.highlight}</span>
                  <ArrowRight className="w-4 h-4 text-accent opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Specialization Callout Banner */}
        <div className="mt-12 sm:mt-16 rounded-3xl bg-surface-alt/70 border border-line/80 p-8 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-accent-deep">
                Advanced Clinical Focus
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-2">
                Specialized Prosthodontics & Surgical Care
              </h3>
              <p className="font-body text-sm text-ink-muted mt-3 leading-relaxed">
                Beyond routine dentistry, our joint clinical and laboratory team
                specializes in complex rehabilitation protocols.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                "All-on-4 Implants",
                "All-on-6 Implants",
                "Basal Implants",
                "Full Mouth Rehab",
                "DMLS Metal Printing",
                "Patient-Specific Implants",
              ].map((proc, pIdx) => (
                <div
                  key={pIdx}
                  className="rounded-xl bg-white p-3.5 border border-line/60 shadow-xs flex items-center gap-2.5 text-xs font-semibold text-ink"
                >
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  {proc}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
