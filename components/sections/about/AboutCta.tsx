"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Phone, MapPin, Calendar, Clock, MessageSquare } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";

export const AboutCta: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion || !sectionRef.current) return;

      gsap.fromTo(
        ".apple-cta-anim",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.14,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-brand-dark py-24 sm:py-32 text-white"
    >
      {/* Apple-style warm ambient glow in dark mode */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-accent/12 rounded-full blur-[140px]"
        aria-hidden="true"
      />

      <Container className="relative z-10 text-center">
        {/* Eyebrow */}
        <div className="apple-cta-anim inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold tracking-wider uppercase text-accent mb-8">
          <Calendar className="w-3.5 h-3.5" />
          Join The Future of Dental Care
        </div>

        {/* Headline */}
        <h2 className="apple-cta-anim font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-3xl mx-auto leading-tight mb-6">
          Experience Dentistry Reimagined for the Digital Era.
        </h2>

        {/* Subtitle */}
        <p className="apple-cta-anim font-body text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed mb-10 sm:mb-12">
          Whether you are a patient seeking gentle restorative care or a dental
          clinician seeking precision digital lab partnership — our team is here
          to assist you.
        </p>

        {/* Action Buttons */}
        <div className="apple-cta-anim flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button
            href="/appointment"
            variant="secondary"
            size="lg"
            showIcon
            className="w-full sm:w-auto px-8 shadow-card hover:shadow-float font-semibold"
          >
            Book an Appointment
          </Button>

          <Button
            href="/contact"
            variant="light"
            size="lg"
            showIcon
            className="w-full sm:w-auto px-8 font-semibold"
          >
            Contact Clinic Desk
          </Button>
        </div>

        {/* Verified Clinic NAP & Operating Hours Strip */}
        <div className="apple-cta-anim max-w-4xl mx-auto rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {/* Address */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="font-display font-semibold text-white text-sm">
                  Clinic Location
                </p>
                <p className="font-body text-xs text-white/60 mt-1 leading-relaxed">
                  Abhiyanta Colony, Shriram Nagar, Sawli Housing Society,
                  Ahilyanagar, MH 414003
                </p>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="flex items-start gap-3 pt-4 sm:pt-0 sm:pl-6">
              <Clock className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="font-display font-semibold text-white text-sm">
                  Clinical Hours
                </p>
                <p className="font-body text-xs text-white/60 mt-1 leading-relaxed">
                  Mon – Fri: 9:00 AM – 8:30 PM
                  <br />
                  Sat: 9:00 AM – 6:00 PM
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="flex items-start gap-3 pt-4 sm:pt-0 sm:pl-6">
              <Phone className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="font-display font-semibold text-white text-sm">
                  Appointments & Desk
                </p>
                <p className="font-body text-xs text-white/60 mt-1 leading-relaxed">
                  +91 98765 43210
                  <br />
                  care@guruomdental.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
