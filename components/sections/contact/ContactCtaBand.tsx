"use client";

import React from "react";
import { Calendar, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const ContactCtaBand: React.FC = () => {
  return (
    <section aria-label="Book appointment directly" className="py-10 bg-brand-dark text-white border-t border-brand/30">
      <Container>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-10 h-10 rounded-2xl bg-accent/20 text-accent flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-white text-base sm:text-lg">
                Prefer to book directly?
              </h3>
              <p className="text-xs text-white/70 mt-0.5">
                Skip the enquiry form and pick your doctor and chair time slot immediately.
              </p>
            </div>
          </div>

          <Button
            href="/appointment"
            variant="secondary"
            size="md"
            showIcon={false}
            className="shrink-0 w-full sm:w-auto"
          >
            <span className="flex items-center gap-2">
              <span>Book Appointment</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </Button>
        </div>
      </Container>
    </section>
  );
};
