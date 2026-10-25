"use client";

import { useRef } from "react";
import { Container, Eyebrow, Button, DoctorCard } from "@/components/ui";
import { SplitHeading, MagneticWrap } from "@/components/animations";
import { doctorsData } from "@/data/doctors";
import { gsap, useGSAP } from "@/lib/gsap";

export function AboutTeam() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Take first 3 featured doctors
  const featuredDoctors = doctorsData.slice(0, 3);

  useGSAP(
    () => {
      if (!sectionRef.current || !cardsRef.current) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) return;

      const cards = cardsRef.current.children;

      gsap.fromTo(
        cards,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative bg-surface py-20 md:py-28 lg:py-32 border-t border-border"
      aria-labelledby="about-team-heading"
    >
      <Container>
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-16 md:mb-20">
          <Eyebrow className="justify-center mb-3">
            Our Specialist Team
          </Eyebrow>
          <SplitHeading
            id="about-team-heading"
            as="h2"
            className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink mb-5"
          >
            Meet the Specialists Behind Your Smile
          </SplitHeading>
          <p className="text-ink-muted text-base md:text-lg leading-relaxed font-body">
            Our multidisciplinary dental surgeons, prosthodontists, and aesthetic clinicians combine decades of shared clinical experience with empathetic bedside care.
          </p>
        </div>

        {/* 3 Doctors Grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-14"
        >
          {featuredDoctors.map((doctor) => (
            <div key={doctor.slug} className="h-full">
              <DoctorCard doctor={doctor} />
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <MagneticWrap strength={0.25}>
            <Button
              href="/contact"
              variant="primary"
              size="lg"
              showIcon
              className="px-8"
            >
              Consult Our Team
            </Button>
          </MagneticWrap>
        </div>
      </Container>
    </section>
  );
}
