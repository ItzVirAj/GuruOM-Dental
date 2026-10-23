"use client";

import React from "react";
import { Container } from "@/components/ui/Container";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { SplitHeading } from "@/components/animations/SplitHeading";

export const BlogNewsletterBand: React.FC = () => {
  return (
    <section aria-label="Subscribe to oral health journal" className="py-14 sm:py-16 bg-brand-dark text-white border-t border-brand/30 relative overflow-hidden">
      {/* Decorative ambient radial accent glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 -z-10 w-[600px] h-[300px] bg-accent/15 rounded-full blur-[120px] opacity-60"
      />

      <Container>
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent block">
            Stay Ahead in Oral Wellness
          </span>

          <SplitHeading
            as="h2"
            type="lines"
            mask={true}
            className="text-display-sm sm:text-display-md font-display text-white tracking-tight"
          >
            Clinical Insights in Your Inbox
          </SplitHeading>

          <p className="text-xs sm:text-sm text-white/75 leading-relaxed font-body">
            Receive monthly evidence-based guides on preventive home care, smile restoration, and
            pediatric dental health from our Ahilyanagar clinicians.
          </p>

          <div className="pt-2 max-w-lg mx-auto">
            <NewsletterForm
              variant="dark"
              buttonText="Join Journal"
              placeholder="Enter your email address..."
            />
          </div>
        </div>
      </Container>
    </section>
  );
};
