"use client";

import React, { useRef } from "react";
import { Calendar, Phone } from "lucide-react";
import { Doctor } from "@/data/doctors";
import { siteConfig } from "@/data/site";
import { Button } from "@/components/ui";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/components/animations";

export interface DoctorMobileBookingBarProps {
  doctor: Doctor;
}

export function DoctorMobileBookingBar({ doctor }: DoctorMobileBookingBarProps) {
  const barRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const bar = barRef.current;
      if (!bar) return;

      const footerEl = document.querySelector("footer");
      if (!footerEl) return;

      // When the footer enters the viewport, slide the bar out of view
      const st = ScrollTrigger.create({
        trigger: footerEl,
        start: "top bottom",
        end: "bottom bottom",
        onEnter: () => {
          gsap.to(bar, {
            yPercent: 120,
            duration: prefersReducedMotion ? 0 : 0.3,
            ease: "power2.inOut",
            overwrite: "auto",
          });
        },
        onLeaveBack: () => {
          gsap.to(bar, {
            yPercent: 0,
            duration: prefersReducedMotion ? 0 : 0.3,
            ease: "power2.out",
            overwrite: "auto",
          });
        },
      });

      return () => {
        st.kill();
      };
    },
    { scope: barRef, dependencies: [prefersReducedMotion] }
  );

  const cleanName = doctor.name.replace("Placeholder ", "");

  return (
    <aside
      ref={barRef}
      aria-label="Mobile appointment booking"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-surface-alt/90 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-2xl transition-transform duration-200"
    >
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        {/* Quick Phone Call action */}
        <a
          href={`tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-alt text-ink border border-surface-alt/80 active:scale-95 transition-transform"
          aria-label={`Call GuruOm Dental clinic at ${siteConfig.phone}`}
        >
          <Phone className="h-5 w-5 text-brand" />
        </a>

        {/* Primary Booking Button */}
        <Button
          href={`/appointment?doctor=${doctor.slug}`}
          variant="primary"
          size="md"
          className="flex-1 flex items-center justify-center gap-2 h-12 text-sm font-semibold shadow-xs"
        >
          <Calendar className="h-4 w-4" />
          <span>Book with {cleanName}</span>
        </Button>
      </div>
    </aside>
  );
}

export default DoctorMobileBookingBar;
