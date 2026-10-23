"use client";

import React from "react";
import { Banknote, CreditCard, CalendarClock, ShieldCheck } from "lucide-react";
import { paymentOptions, PaymentOption } from "@/data/pricing";
import { Container } from "@/components/ui";
import { Reveal } from "@/components/animations";

export interface PaymentOptionsProps {
  options?: PaymentOption[];
}

const iconMap = {
  Banknote,
  CreditCard,
  CalendarClock,
  ShieldCheck,
};

export function PaymentOptions({ options = paymentOptions }: PaymentOptionsProps) {
  return (
    <section
      className="py-16 sm:py-20 lg:py-24 bg-white"
      aria-labelledby="payment-options-heading"
    >
      <Container>
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand mb-2">
            Flexible Financial Comfort
          </span>

          <h2
            id="payment-options-heading"
            className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink leading-tight mb-3.5"
          >
            Payment & financing methods
          </h2>

          <p className="text-body text-ink-muted leading-relaxed max-w-xl font-body">
            We provide versatile payment channels and structured treatment milestones so you can focus entirely on your health.
          </p>
        </div>

        {/* 4 Icon Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {options.map((option, idx) => {
            const IconComponent = iconMap[option.icon] || Banknote;

            return (
              <div key={idx} className="h-full">
                <Reveal variant="up" delay={idx * 0.08} duration={0.5}>
                  <div className="group h-full rounded-3xl bg-surface border border-surface-alt/80 p-6 sm:p-7 flex flex-col justify-start transition-all duration-300 hover:border-brand/40 hover:shadow-lg hover:-translate-y-1.5">
                    {/* Icon Badge */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:bg-brand group-hover:text-white">
                      <IconComponent className="h-6 w-6" aria-hidden="true" />
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-lg font-bold text-ink mb-2.5 group-hover:text-brand transition-colors">
                      {option.title}
                    </h3>

                    {/* Text */}
                    <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                      {option.text}
                    </p>
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export default PaymentOptions;
