"use client";

import { useRef } from "react";
import { Container, Eyebrow, SmartImage } from "@/components/ui";
import { SplitHeading } from "@/components/animations";
import { aboutPageContent } from "@/data/about";
import { AspectRatio } from "@/data/images";
import { gsap, useGSAP } from "@/lib/gsap";
import { Cpu, Eye, ShieldCheck, Sparkles } from "lucide-react";

const featureIcons: Record<string, React.ElementType> = {
  "Micro-Precision": Eye,
  "Digital Comfort": Sparkles,
  "Pain-Free": Cpu,
  "Hospital Safety": ShieldCheck,
};

export function AboutClinicTech() {
  const sectionRef = useRef<HTMLElement>(null);
  const bentoRef = useRef<HTMLDivElement>(null);

  const { clinicTech } = aboutPageContent;

  useGSAP(
    () => {
      if (!sectionRef.current || !bentoRef.current) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        // Subtle desktop parallax on bento items
        const bentoItems = gsap.utils.toArray<HTMLElement>(".bento-parallax");

        bentoItems.forEach((item, idx) => {
          const speed = idx % 2 === 0 ? 25 : -25;
          gsap.to(item, {
            y: speed,
            ease: "none",
            scrollTrigger: {
              trigger: item,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          });
        });
      });

      // Stagger reveal for feature cards
      gsap.fromTo(
        ".tech-feature-card",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".tech-features-grid",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative bg-surface py-20 md:py-28 lg:py-32 border-t border-border"
      aria-labelledby="clinic-tech-heading"
    >
      <Container>
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-16 md:mb-20">
          <Eyebrow className="justify-center mb-3">
            {clinicTech.eyebrow}
          </Eyebrow>
          <SplitHeading
            id="clinic-tech-heading"
            as="h2"
            className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink mb-5"
          >
            {clinicTech.title}
          </SplitHeading>
          <p className="text-ink-muted text-base md:text-lg leading-relaxed font-body">
            {clinicTech.description}
          </p>
        </div>

        {/* Bento Grid */}
        <div
          ref={bentoRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 mb-20 md:mb-24"
        >
          {clinicTech.bento.map((item, index) => {
            // Layout spans: 7 / 5 for row 1, 5 / 7 for row 2
            const colSpan =
              index === 0
                ? "lg:col-span-7"
                : index === 1
                ? "lg:col-span-5"
                : index === 2
                ? "lg:col-span-5"
                : "lg:col-span-7";

            return (
              <div
                key={item.slot}
                className={`bento-parallax relative rounded-2xl overflow-hidden shadow-card border border-border group ${colSpan}`}
              >
                <div className="w-full h-full relative">
                  <SmartImage
                    slot={item.slot}
                    ratio={item.ratio as AspectRatio}
                    alt={item.caption}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Overlay chip */}
                  <div className="absolute bottom-4 left-4 right-4 md:right-auto z-10">
                    <span className="inline-block bg-surface/95 backdrop-blur-md text-ink font-display text-xs md:text-sm font-semibold px-4 py-2 rounded-full shadow-soft border border-border/60">
                      {item.caption}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4 Technology / Comfort Features */}
        <div className="tech-features-grid grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {clinicTech.features.map((feat) => {
            const Icon = featureIcons[feat.badge] || Sparkles;

            return (
              <div
                key={feat.title}
                className="tech-feature-card bg-surface-alt p-6 md:p-8 rounded-2xl border border-border hover:border-accent/40 transition-colors shadow-soft"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center text-accent">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold font-display tracking-wider uppercase text-accent bg-accent-soft px-3 py-1 rounded-full">
                    {feat.badge}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-lg md:text-xl text-ink mb-2">
                  {feat.title}
                </h3>
                <p className="text-ink-muted text-sm md:text-base leading-relaxed font-body">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
