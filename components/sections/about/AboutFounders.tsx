"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Badge } from "@/components/ui/Badge";
import { Quote, Award, Sparkles, CheckCircle2 } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";

const founders = [
  {
    name: "Dr. Guruprasad Handal",
    degree: "M.D.S. (Prosthodontics)",
    role: "Founder & Chief Prosthodontist",
    imageSrc: "/images/DRGuruprasad.jpeg",
    bio: "A pioneer in digital restorative sciences across Maharashtra. In 2019, Dr. Guruprasad foresaw the tectonic shift toward digital dentistry and introduced intraoral optical scanning to Ahilyanagar. Today, he directs full-arch implant reconstructions, computer-guided surgical planning, and direct metal laser sintering (DMLS) protocols.",
    quote:
      "Dentistry is biological engineering. By replacing unpredictable manual impressions with sub-micron digital 3D scans, we craft restorations that feel effortless and natural from day one.",
    specialties: [
      "All-on-4 / All-on-6 Implants",
      "Full Mouth Rehabilitation",
      "DMLS 3D Metal Prosthetics",
      "Digital Occlusal Design",
    ],
    experience: "16+ Years Clinical Mastery",
  },
  {
    name: "Dr. Akshata Handal",
    degree: "B.D.S.",
    role: "Co-Founder & Dental Surgeon",
    imageSrc: "/images/DRAkshata.jpeg",
    bio: "Focused on aesthetic smile harmony, preventive micro-dentistry, and anxiety-free patient care. Dr. Akshata champions an empathetic clinical atmosphere where patient comfort is prioritized through gentle anesthesia delivery, clear visual treatment communication, and strict hospital-grade sterilization protocols.",
    quote:
      "Every patient deserves to be heard, respected, and treated with unhurried gentleness. We combine digital accuracy with genuine clinical warmth.",
    specialties: [
      "Aesthetic Smile Design",
      "Conservative Micro-Dentistry",
      "Painless Dental Operatory",
      "Preventive Oral Wellness",
    ],
    experience: "Dedicated Restorative Care",
  },
];

export const AboutFounders: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion || !sectionRef.current) return;

      gsap.fromTo(
        ".founder-card-anim",
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.18,
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
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
          <div className="inline-flex justify-center mb-4">
            <Eyebrow variant="dot" color="accent">
              Clinical Leadership
            </Eyebrow>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink mb-6">
            The Visionaries Behind GuruOm
          </h2>
          <p className="font-body text-base sm:text-lg text-ink-muted leading-relaxed">
            United by a singular purpose: pairing world-class digital dental
            precision with unhurried, patient-first empathy.
          </p>
        </div>

        {/* 2-Column Apple Executive Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {founders.map((founder, idx) => (
            <div
              key={idx}
              className="founder-card-anim group rounded-3xl bg-white border border-line/70 p-6 sm:p-8 lg:p-10 shadow-card hover:shadow-float hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Doctor Portrait + Header Info */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 mb-8">
                  {/* Portrait Container */}
                  <div className="relative w-44 h-56 sm:w-48 sm:h-64 shrink-0 rounded-2xl overflow-hidden shadow-card border border-line/80 bg-surface-alt">
                    <Image
                      src={founder.imageSrc}
                      alt={`${founder.name}, ${founder.degree}`}
                      fill
                      sizes="(max-width: 640px) 176px, 192px"
                      className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                      priority={idx === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                    <span className="absolute bottom-2.5 left-2.5 right-2.5 text-center text-[10px] font-medium tracking-wider uppercase text-white/90 bg-brand-dark/70 backdrop-blur-md py-1 px-2 rounded-full border border-white/10">
                      {founder.experience}
                    </span>
                  </div>

                  {/* Name, Degrees, and Role */}
                  <div className="flex-1 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-soft text-accent-deep text-xs font-semibold mb-3">
                      <Sparkles className="w-3.5 h-3.5" />
                      {founder.degree}
                    </div>

                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-1 tracking-tight">
                      {founder.name}
                    </h3>

                    <p className="font-display font-semibold text-brand text-sm sm:text-base mb-4">
                      {founder.role}
                    </p>

                    {/* Bio */}
                    <p className="font-body text-sm sm:text-base text-ink-muted leading-relaxed">
                      {founder.bio}
                    </p>
                  </div>
                </div>

                {/* Doctor's Quote Box */}
                <div className="rounded-2xl bg-surface p-5 border border-line/60 mb-8 relative">
                  <Quote className="w-5 h-5 text-accent/50 mb-2" />
                  <p className="font-display italic text-ink/90 text-sm sm:text-base leading-relaxed">
                    &ldquo;{founder.quote}&rdquo;
                  </p>
                </div>
              </div>

              {/* Specializations Tags */}
              <div className="pt-6 border-t border-line/60">
                <p className="font-display text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3">
                  Focus Disciplines
                </p>
                <div className="flex flex-wrap gap-2">
                  {founder.specialties.map((spec, specIdx) => (
                    <span
                      key={specIdx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-alt/70 text-ink text-xs font-medium border border-line/60"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
