"use client";

import React, { useRef } from "react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Building2, MapPin, CheckCircle2, Globe } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";

const workingCentres = [
  {
    city: "Ahilyanagar",
    title: "Flagship Dental Hospital & Central Lab",
    badge: "Headquarters & Central CAD/CAM Hub",
    description:
      "Integrated surgical operatory, high-resolution 3D CBCT imaging suite, and full-scale DMLS 3D metal printing facility.",
    address: "Abhiyanta Colony, Shriram Nagar, Sawli Housing Society, Ahilyanagar",
  },
  {
    city: "Sambhajinagar",
    title: "Digital Dental Lab Centre",
    badge: "Digital Milling & Scanning Facility",
    description:
      "Specialized in rapid turnaround monolithic zirconia, e.max aesthetic restorations, and guided implant stent fabrication.",
    address: "Chhatrapati Sambhajinagar Digital Laboratory Centre",
  },
  {
    city: "Pune",
    title: "Digital Support & Regional Lab Hub",
    badge: "Prosthetic Design & Clinician Hub",
    description:
      "Dedicated clinical support desk and digital impression reception facility coordinating with metropolitan dental specialists.",
    address: "Pune Regional Digital Support & Lab Facility",
  },
];

const serviceCities = [
  "Ahilyanagar",
  "Pune",
  "Navi Mumbai",
  "Nashik",
  "Sambhajinagar",
  "Solapur",
  "Dharashiv",
  "Dhule",
  "Amravati",
  "Kolhapur",
  "Satara",
  "Sangli",
  "Jalna",
  "Jalgaon",
  "Nanded",
  "Latur",
  "Ratnagiri",
  "Sindhudurg",
  "Beed",
  "Wardha",
  "Chandrapur",
  "Akola",
  "Yavatmal",
  "Parbhani",
];

export const AboutNetwork: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion || !sectionRef.current) return;

      gsap.fromTo(
        ".network-card-anim",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
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
      className="relative bg-surface py-20 sm:py-28 lg:py-32 border-b border-line/60"
    >
      <Container>
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
          <div className="inline-flex justify-center mb-4">
            <Eyebrow variant="dot" color="accent">
              Geographic Presence
            </Eyebrow>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink mb-6">
            Our Working Centres & Statewide Reach
          </h2>
          <p className="font-body text-base sm:text-lg text-ink-muted leading-relaxed">
            With 3 dedicated digital laboratory facilities and an active logistics
            network serving clinicians across more than 30 cities in Maharashtra.
          </p>
        </div>

        {/* 3 Working Centres Cards */}
        <div className="mb-14">
          <h3 className="font-display text-xl sm:text-2xl font-bold text-ink mb-6 flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-accent" />
            Our 3 Working Dental Lab Centres
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {workingCentres.map((centre, idx) => (
              <div
                key={idx}
                className="network-card-anim group rounded-3xl bg-white border border-line/70 p-6 sm:p-8 shadow-card hover:shadow-float hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-display text-2xl font-bold text-ink">
                      {centre.city}
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                  </div>

                  <span className="inline-block text-[11px] font-mono font-bold tracking-wider text-accent-deep bg-accent-soft px-3 py-1 rounded-full mb-3">
                    {centre.badge}
                  </span>

                  <h4 className="font-display font-semibold text-brand text-base mb-2">
                    {centre.title}
                  </h4>

                  <p className="font-body text-xs sm:text-sm text-ink-muted leading-relaxed mb-6">
                    {centre.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-line/60 text-[11px] font-body text-ink-muted flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                  <span>{centre.address}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services Across 30+ Cities Strip */}
        <div className="rounded-3xl bg-white border border-line/70 p-8 sm:p-10 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-ink flex items-center gap-2">
                <Globe className="w-5 h-5 text-accent" />
                Services Across Maharashtra
              </h3>
              <p className="font-body text-xs sm:text-sm text-ink-muted mt-1">
                Collaborating with over 800+ dental surgeons across 30+ cities for
                digital impressions, DMLS frameworks, and precision prosthetics.
              </p>
            </div>
            <span className="shrink-0 text-xs font-mono font-bold text-accent-deep bg-accent-soft px-3 py-1.5 rounded-full border border-accent/20">
              30+ Cities Statewide
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {serviceCities.map((city, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface text-ink text-xs font-medium border border-line/60 hover:border-accent/40 hover:bg-surface-alt transition-colors"
              >
                <CheckCircle2 className="w-3 h-3 text-accent" />
                {city}
              </span>
            ))}
            <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-accent-soft text-accent-deep text-xs font-semibold border border-accent/20">
              + 10 more regional towns
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
};
