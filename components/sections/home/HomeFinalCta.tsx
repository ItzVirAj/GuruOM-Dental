"use client";

import React from "react";
import { Phone, Calendar, ShieldCheck, Sparkles, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SmartImage } from "@/components/ui/SmartImage";
import { SplitHeading } from "@/components/animations/SplitHeading";
import { siteConfig } from "@/data/site";
import { heroContent } from "@/data/home";

const chipIcons = {
  doctor: ShieldCheck,
  hygiene: Sparkles,
  emergency: Clock,
};

export const HomeFinalCta: React.FC = () => {
  return (
    <section
      aria-label="Book your appointment"
      className="py-16 sm:py-20 md:py-28 bg-brand-dark text-white relative overflow-hidden"
    >
      {/* Subtle decorative glow overlay */}
      <div
        className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-primary via-transparent to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* LEFT: Heading, Copy, Buttons, Trust Chips */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-brand-light text-xs font-semibold backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-light" />
              Patient-Centered Excellence
            </span>

            <SplitHeading
              as="h2"
              className="text-display-md sm:text-display-lg lg:text-display-xl font-display text-white tracking-tight"
            >
              Ready for a calmer dental experience?
            </SplitHeading>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-xl">
              From routine cleanings to microscopic tooth-saving care and guided implants, our specialists ensure every treatment is gentle, clear, and unhurried.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                href="/appointment"
                variant="primary"
                size="lg"
                className="bg-brand text-brand-dark hover:bg-white transition-all shadow-md font-semibold"
              >
                <Calendar className="w-4 h-4 mr-1.5" />
                Book an Appointment
              </Button>

              <Button
                href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
                variant="secondary"
                size="lg"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 transition-all font-semibold"
                showIcon={false}
              >
                <Phone className="w-4 h-4 mr-1.5 text-brand-light" />
                {siteConfig.phone}
              </Button>
            </div>

            {/* Trust Chips */}
            <div className="pt-4 border-t border-white/15 flex flex-wrap gap-4 sm:gap-6">
              {heroContent.trustChips.map((chip) => {
                const Icon = chipIcons[chip.icon] || ShieldCheck;
                return (
                  <div
                    key={chip.id}
                    className="inline-flex items-center gap-2 text-xs font-medium text-white/90"
                  >
                    <Icon className="w-4 h-4 text-brand-light shrink-0" />
                    <span>{chip.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Visual SmartImage Slot */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl aspect-[4/3] bg-white/5">
              <SmartImage
                slot="homeCta"
                alt="GuruOm Dental welcoming reception and clinical lounge in Ahilyanagar"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-brand-dark/70 backdrop-blur-md border border-white/10 text-xs text-white/90">
                <span className="font-semibold block text-brand-light">
                  {siteConfig.name} Clinic Sanctuary
                </span>
                <span className="text-[11px] text-white/70">
                  {siteConfig.address.city}, Maharashtra • Mon – Sat
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
