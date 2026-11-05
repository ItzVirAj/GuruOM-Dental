"use client";

import React, { useRef } from "react";
import { MessageSquare, ClipboardCheck, Sparkles, HeartHandshake } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { gsap, useGSAP } from "@/lib/gsap";

const steps = [
  {
    step: "01",
    title: "1. Consult",
    description:
      "Comprehensive digital diagnostics, low-radiation imaging, and an unhurried discussion of your oral health goals.",
    icon: MessageSquare,
  },
  {
    step: "02",
    title: "2. Plan",
    description:
      "Customized, transparent treatment pathway with itemized cost estimates and zero surprise clinical fees.",
    icon: ClipboardCheck,
  },
  {
    step: "03",
    title: "3. Treat",
    description:
      "Gentle, precision care using modern European technology, magnification loupes, and painless anesthesia.",
    icon: Sparkles,
  },
  {
    step: "04",
    title: "4. Follow Up",
    description:
      "Clear written aftercare guidance, scheduled progress evaluations, and proactive preventive recall visits.",
    icon: HeartHandshake,
  },
];

export function ServicesVisitSteps() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion) return;

      const cards = containerRef.current.querySelectorAll(".visit-step-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      aria-labelledby="visit-steps-heading"
      className="py-16 sm:py-20 lg:py-24 bg-surface border-y border-line"
    >
      <Container>
        <div className="max-w-2xl mb-12 sm:mb-16">
          <Eyebrow variant="dot" color="accent">
            The Patient Journey
          </Eyebrow>
          <h2
            id="visit-steps-heading"
            className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-ink tracking-tight mt-2"
          >
            How a visit works.
          </h2>
          <p className="text-sm sm:text-base text-ink-muted mt-3 font-body leading-relaxed">
            From your very first consultation to your final follow-up, every step is
            structured for complete clarity, clinical safety, and gentle comfort.
          </p>
        </div>

        <div
          ref={containerRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="visit-step-card relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white border border-line shadow-soft transition-all duration-300 hover:border-brand/40 hover:-translate-y-1 hover:shadow-card"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-display text-xs font-bold uppercase tracking-widest text-brand px-2.5 py-1 rounded-full bg-brand/10">
                      Step {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-brand border border-line">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                  </div>

                  <h3 className="font-display text-lg font-bold text-ink mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-body">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

