"use client";

import React from "react";
import { Phone, Calendar } from "lucide-react";
import { siteConfig } from "@/data/site";
import { Container, Button, SmartImage } from "@/components/ui";
import { SplitHeading } from "@/components/animations";

export function PricingCta() {
  return (
    <section
      className="relative overflow-hidden bg-brand-dark text-white py-16 sm:py-20 lg:py-24 border-t border-brand/40"
      aria-labelledby="pricing-cta-heading"
    >
      {/* Decorative Ambient Radial Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 -z-10 w-[700px] h-[350px] bg-accent/15 rounded-full blur-[130px] opacity-70"
      />

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center max-w-6xl mx-auto">
          {/* Left Column: SmartImage Placeholder (pricingCta) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-surface-alt/10">
              <SmartImage
                slot="pricingCta"
                aspect="16/9"
                alt="GuruOm Dental consultation lounge and transparent pricing support"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Right Column: SplitHeading and CTA buttons */}
          <div className="lg:col-span-7 space-y-6 lg:pl-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" aria-hidden="true" />
              Direct Clinical Consultation
            </span>

            <SplitHeading
              as="h2"
              type="lines"
              mask
              className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold text-white tracking-tight leading-[1.15]"
            >
              Questions about your treatment cost?
            </SplitHeading>

            <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-xl mx-auto lg:mx-0 font-body">
              Our treatment coordinators provide private, itemized cost previews and flexible financing consultations before your first procedure. No commitment required.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Button
                href="/appointment"
                variant="primary"
                size="lg"
                className="flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <Calendar className="h-4 w-4" />
                Schedule Consultation
              </Button>

              <Button
                href={`tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`}
                variant="ghost"
                size="lg"
                className="flex items-center gap-2 text-white border-white/20 hover:bg-white/10"
              >
                <Phone className="h-4 w-4" />
                <span>{siteConfig.phone}</span>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default PricingCta;
