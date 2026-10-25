"use client";

import React, { useRef } from "react";
import {
  Target,
  Eye,
  ShieldCheck,
  Heart,
  FileCheck,
  Sparkles,
  ShieldAlert,
  BookOpen,
  Clock,
} from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Container, Section, Eyebrow } from "@/components/ui";
import { SplitHeading, useReducedMotion } from "@/components/animations";
import { AboutPageContent, aboutPageContent } from "@/data/about";

export interface AboutMissionValuesProps {
  content?: AboutPageContent["missionVision"];
}

const iconMap: Record<string, React.ReactNode> = {
  Target: <Target className="w-6 h-6" aria-hidden="true" />,
  Eye: <Eye className="w-6 h-6" aria-hidden="true" />,
  ShieldCheck: <ShieldCheck className="w-6 h-6" aria-hidden="true" />,
  Heart: <Heart className="w-5 h-5" aria-hidden="true" />,
  FileCheck: <FileCheck className="w-5 h-5" aria-hidden="true" />,
  Sparkles: <Sparkles className="w-5 h-5" aria-hidden="true" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5" aria-hidden="true" />,
  BookOpen: <BookOpen className="w-5 h-5" aria-hidden="true" />,
  Clock: <Clock className="w-5 h-5" aria-hidden="true" />,
};

export const AboutMissionValues: React.FC<AboutMissionValuesProps> = ({
  content = aboutPageContent.missionVision,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardsRowRef = useRef<HTMLDivElement | null>(null);
  const valuesGridRef = useRef<HTMLDivElement | null>(null);

  const prefersReducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section || prefersReducedMotion) return;

      // Cards Row Stagger
      if (cardsRowRef.current) {
        const cards = cardsRowRef.current.children;
        gsap.fromTo(
          cards,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.14,
            ease: "power2.out",
            scrollTrigger: {
              trigger: cardsRowRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
              once: true,
            },
          }
        );
      }

      // Values Grid Stagger
      if (valuesGridRef.current) {
        const items = valuesGridRef.current.children;
        gsap.fromTo(
          items,
          { opacity: 0, y: 24, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: valuesGridRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
              once: true,
            },
          }
        );
      }
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion] }
  );

  return (
    <Section ref={sectionRef} variant="surface" className="py-20 sm:py-24 lg:py-32">
      <Container>
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto text-center mb-14 sm:mb-16">
          <Eyebrow variant="dot" color="accent" className="mb-4">
            {content.eyebrow}
          </Eyebrow>
          <SplitHeading
            as="h2"
            type="lines"
            mask={true}
            className="font-display text-display-sm sm:text-display-md text-ink font-bold tracking-tight text-balance"
          >
            {content.title}
          </SplitHeading>
        </div>

        {/* 3-Card Row (Mission, Vision, Ethics) */}
        <div
          ref={cardsRowRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-20 sm:mb-24"
        >
          {content.cards.map((card) => {
            const isHighlight = card.id === "mission";
            return (
              <div
                key={card.id}
                className={`group relative flex flex-col justify-between p-6 sm:p-8 rounded-3xl transition-all duration-300 hover:-translate-y-1.5 ${
                  isHighlight
                    ? "bg-brand text-white shadow-card"
                    : "bg-white text-ink border border-line/60 shadow-soft"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                        isHighlight
                          ? "bg-white/10 text-accent"
                          : "bg-brand-dark/5 text-brand"
                      }`}
                    >
                      {iconMap[card.icon]}
                    </div>
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        isHighlight
                          ? "bg-white/10 text-white/90"
                          : "bg-accent-soft text-accent-deep"
                      }`}
                    >
                      {card.tagline}
                    </span>
                  </div>

                  <h3
                    className={`font-display text-xl sm:text-2xl font-bold tracking-tight mb-3 ${
                      isHighlight ? "text-white" : "text-ink"
                    }`}
                  >
                    {card.title}
                  </h3>

                  <p
                    className={`text-sm sm:text-base leading-relaxed ${
                      isHighlight ? "text-white/80" : "text-ink-muted"
                    }`}
                  >
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Values Section Header */}
        <div className="border-t border-line/70 pt-16 mb-12 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-deep block mb-2">
            Our Guiding Values
          </span>
          <h3 className="font-display text-heading-md sm:text-display-xs text-ink font-bold tracking-tight">
            {content.valuesHeading}
          </h3>
        </div>

        {/* 6 Values Grid */}
        <div
          ref={valuesGridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {content.values.map((v) => (
            <div
              key={v.id}
              className="p-6 rounded-2xl bg-white border border-line/60 shadow-xs hover:shadow-soft hover:border-brand/30 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent-deep flex items-center justify-center mb-4 shrink-0">
                {iconMap[v.icon]}
              </div>
              <h4 className="font-display font-bold text-base sm:text-lg text-ink mb-1.5">
                {v.title}
              </h4>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                {v.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default AboutMissionValues;
