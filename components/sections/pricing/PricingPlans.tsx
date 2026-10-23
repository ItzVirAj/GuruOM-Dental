"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Check, X } from "lucide-react";
import { carePlans, CarePlan, getMaxSavingPercent } from "@/data/pricing";
import { Container, Badge, Button } from "@/components/ui";
import { Reveal, useReducedMotion } from "@/components/animations";
import { gsap } from "@/lib/gsap";

export interface PricingPlansProps {
  plans?: CarePlan[];
}

export function PricingPlans({ plans = carePlans }: PricingPlansProps) {
  const [isYearly, setIsYearly] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const toggleContainerRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLSpanElement | null>(null);
  const monthlyBtnRef = useRef<HTMLButtonElement | null>(null);
  const yearlyBtnRef = useRef<HTMLButtonElement | null>(null);

  const maxSaving = useMemo(() => getMaxSavingPercent(), []);

  // Update sliding indicator on billing switch
  useEffect(() => {
    const indicator = indicatorRef.current;
    const targetBtn = isYearly ? yearlyBtnRef.current : monthlyBtnRef.current;
    if (!indicator || !targetBtn) return;

    const left = targetBtn.offsetLeft;
    const width = targetBtn.offsetWidth;

    if (prefersReducedMotion) {
      gsap.set(indicator, { x: left, width });
    } else {
      gsap.to(indicator, {
        x: left,
        width,
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  }, [isYearly, prefersReducedMotion]);

  return (
    <section
      className="py-16 sm:py-20 lg:py-24 bg-surface"
      aria-labelledby="pricing-plans-heading"
    >
      <Container>
        {/* Section Heading & Billing Switch */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand mb-2.5">
            Predictable Dental Wellness
          </span>

          <h2
            id="pricing-plans-heading"
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-tight mb-4"
          >
            Choose your care plan
          </h2>

          <p className="text-body text-ink-muted leading-relaxed max-w-xl font-body mb-8">
            Simple, all-inclusive monthly memberships designed for consistent hygiene, preventive checkups, and exclusive treatment privileges.
          </p>

          {/* Accessible Billing Switch with Sliding Indicator */}
          <div className="flex items-center gap-3">
            <div
              ref={toggleContainerRef}
              role="group"
              aria-label="Billing frequency toggle"
              className="relative inline-flex items-center p-1 rounded-full bg-surface-alt border border-surface-alt/90 shadow-inner"
            >
              {/* Sliding Pill Indicator */}
              <span
                ref={indicatorRef}
                aria-hidden="true"
                className="pointer-events-none absolute top-1 bottom-1 left-0 rounded-full bg-brand shadow-xs"
              />

              {/* Monthly Option Button */}
              <button
                ref={monthlyBtnRef}
                type="button"
                role="switch"
                aria-checked={!isYearly}
                aria-label="Billed monthly"
                onClick={() => setIsYearly(false)}
                className={`relative z-10 px-5 py-2 text-xs sm:text-sm font-semibold rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  !isYearly ? "text-white" : "text-ink-muted hover:text-ink"
                }`}
              >
                Monthly
              </button>

              {/* Yearly Option Button */}
              <button
                ref={yearlyBtnRef}
                type="button"
                role="switch"
                aria-checked={isYearly}
                aria-label="Billed yearly"
                onClick={() => setIsYearly(true)}
                className={`relative z-10 px-5 py-2 text-xs sm:text-sm font-semibold rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  isYearly ? "text-white" : "text-ink-muted hover:text-ink"
                }`}
              >
                Yearly
              </button>
            </div>

            {/* Computed Savings Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                isYearly
                  ? "bg-accent/20 text-accent-dark scale-100 opacity-100"
                  : "bg-surface-alt text-ink-muted scale-95 opacity-80"
              }`}
            >
              Save up to {maxSaving}%
            </span>
          </div>

          {/* Screen Reader polite live announcement */}
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {`Showing ${isYearly ? "yearly" : "monthly"} care plan pricing.`}
          </div>
        </div>

        {/* 3 Care Plan Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
          {plans.map((plan, idx) => {
            const isHighlighted = plan.highlighted;
            const currentPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const originalMonthly = plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={`w-full ${
                  isHighlighted
                    ? "order-first lg:order-none lg:-translate-y-2 lg:scale-105 z-10"
                    : "z-0"
                }`}
              >
                <Reveal variant="up" delay={idx * 0.1}>
                  <div
                    className={`relative rounded-3xl p-7 sm:p-8 transition-all duration-300 flex flex-col h-full ${
                      isHighlighted
                        ? "bg-brand-dark text-white border-2 border-brand shadow-2xl shadow-brand/15 hover:-translate-y-1"
                        : "bg-surface text-ink border border-surface-alt/90 shadow-sm hover:shadow-lg hover:-translate-y-1.5"
                    }`}
                  >
                    {/* Highlight Pill Badge */}
                    {isHighlighted && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <Badge
                          variant="accent"
                          size="sm"
                          className="font-bold uppercase tracking-wider px-3.5 py-1 shadow-md"
                        >
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    {/* Card Header */}
                    <div className="mb-6">
                      <h3
                        className={`font-display text-2xl font-bold tracking-tight ${
                          isHighlighted ? "text-white" : "text-ink"
                        }`}
                      >
                        {plan.name}
                      </h3>
                      <p
                        className={`text-xs mt-2 leading-relaxed min-h-[2rem] ${
                          isHighlighted ? "text-white/75" : "text-ink-muted"
                        }`}
                      >
                        {plan.tagline}
                      </p>
                    </div>

                    {/* Price Block (Fixed height to prevent layout jump) */}
                    <div className="mb-6 pb-6 border-b border-white/10 dark:border-line">
                      <div className="flex items-baseline gap-1.5 h-12">
                        <span
                          className={`text-sm font-semibold ${
                            isHighlighted ? "text-accent" : "text-brand"
                          }`}
                        >
                          {plan.currency}
                        </span>

                        {/* Animated Price Digits */}
                        <span
                          key={currentPrice}
                          className={`font-display text-4xl sm:text-5xl font-bold tracking-tight animate-in fade-in duration-200 ${
                            isHighlighted ? "text-white" : "text-ink"
                          }`}
                        >
                          {currentPrice.toLocaleString()}
                        </span>

                        <span
                          className={`text-xs font-medium ${
                            isHighlighted ? "text-white/70" : "text-ink-muted"
                          }`}
                        >
                          /month
                        </span>
                      </div>

                      {/* Billed Cadence Subtext */}
                      <p
                        className={`text-[11px] font-medium mt-1 transition-opacity duration-200 ${
                          isHighlighted ? "text-white/60" : "text-ink-muted"
                        }`}
                      >
                        {isYearly ? (
                          <>
                            Billed annually (
                            <span className="line-through opacity-70">
                              Rs. {originalMonthly}
                            </span>
                            )
                          </>
                        ) : (
                          "Billed monthly, cancel anytime"
                        )}
                      </p>
                    </div>

                    {/* Feature List */}
                    <ul className="space-y-3.5 mb-8 flex-1 text-xs sm:text-sm">
                      {plan.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-3">
                          {feature.included ? (
                            <>
                              <span className="sr-only">Included: </span>
                              <div
                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full mt-0.5 ${
                                  isHighlighted
                                    ? "bg-accent/20 text-accent"
                                    : "bg-brand/10 text-brand"
                                }`}
                              >
                                <Check className="h-2.5 w-2.5 stroke-[3]" />
                              </div>
                              <span
                                className={
                                  isHighlighted ? "text-white/90" : "text-ink/90"
                                }
                              >
                                {feature.text}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="sr-only">Not included: </span>
                              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-surface-alt/50 text-ink-muted/50 mt-0.5">
                                <X className="h-2.5 w-2.5 stroke-[2]" />
                              </div>
                              <span
                                className={
                                  isHighlighted ? "text-white/40" : "text-ink-muted/60"
                                }
                              >
                                {feature.text}
                              </span>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <div className="mt-auto">
                      <Button
                        href={`/appointment?plan=${plan.id}`}
                        variant={isHighlighted ? "primary" : "secondary"}
                        size="lg"
                        className={`w-full justify-center text-sm font-bold shadow-xs ${
                          isHighlighted ? "shadow-md hover:shadow-lg" : ""
                        }`}
                      >
                        {plan.ctaLabel}
                      </Button>
                    </div>
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>

        {/* Small Disclaimer Under Cards */}
        <p className="text-center text-xs text-ink-muted max-w-xl mx-auto mt-10">
          Prices are indicative and may change after thorough clinical examination and diagnostic imaging.
        </p>
      </Container>
    </section>
  );
}

export default PricingPlans;
