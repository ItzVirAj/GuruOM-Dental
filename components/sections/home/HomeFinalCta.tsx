"use client";

import React from "react";
import Link from "next/link";
import { Phone, Calendar, ShieldCheck, Sparkles, Clock, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
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
      className="py-12 sm:py-16 md:py-24 bg-brand-dark text-white relative overflow-hidden"
    >
      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Clinic Sanctuary Plate: Anchors top on mobile, right column on desktop */}
          <div className="order-first lg:order-last lg:col-span-5">
            <figure className="overflow-hidden rounded-sm border border-white/15 bg-black/25">
              <div className="relative aspect-[16/10] lg:aspect-[4/3] overflow-hidden border-b-[3px] border-accent">
                <SmartImage
                  slot="homeCta"
                  alt="GuruOm Dental welcoming reception and clinical lounge in Ahilyanagar"
                  className="w-full h-full object-cover"
                />
              </div>
              <figcaption className="flex items-baseline justify-between gap-3 px-4 py-3 text-xs">
                <span className="font-display text-sm text-white">
                  {siteConfig.name} Sanctuary
                </span>
                <span className="font-body text-white/70">
                  {siteConfig.address.city} — Mon to Sat
                </span>
              </figcaption>
            </figure>
          </div>

          {/* Copy, Ergonomic Mobile CTAs, and Clinical Guarantees */}
          <div className="lg:col-span-7 flex flex-col gap-5 sm:gap-6">
            <p className="text-sm font-semibold text-accent font-body">
              Visit our clinic
            </p>

            <SplitHeading
              as="h2"
              className="text-display-md sm:text-display-lg font-display text-white tracking-tight"
            >
              Ready for a calmer dental experience?
            </SplitHeading>

            <p className="text-white/80 text-body font-body max-w-xl">
              From routine cleanings to microscopic tooth-saving care and guided implants, our specialists ensure every treatment is gentle, clear, and unhurried.
            </p>

            {/* Primary & Direct Call Actions */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-1">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 rounded-full bg-accent text-on-accent hover:bg-white hover:text-brand-dark transition-colors font-semibold text-sm sm:text-base shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark"
              >
                <Calendar className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Book an appointment</span>
                <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </Link>

              <a
                href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 rounded-full border border-white/25 bg-white/5 hover:bg-white/15 text-white transition-colors font-semibold text-sm sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark"
              >
                <Phone className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                <span>{siteConfig.phone}</span>
              </a>
            </div>

            {/* Trust Guarantees */}
            <div className="pt-5 border-t border-white/15 grid grid-cols-1 sm:flex sm:flex-wrap gap-3 sm:gap-6">
              {heroContent.trustChips.map((chip) => {
                const Icon = chipIcons[chip.icon] || ShieldCheck;
                return (
                  <div
                    key={chip.id}
                    className="inline-flex items-center gap-2.5 text-sm sm:text-xs font-medium text-white/85 font-body"
                  >
                    <Icon className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                    <span>{chip.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
