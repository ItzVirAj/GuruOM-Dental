"use client";

import React, { useState, useRef, useEffect, useMemo, useLayoutEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Phone, Calendar, Award, Languages, GraduationCap } from "lucide-react";
import { Doctor } from "@/data/doctors";
import { siteConfig } from "@/data/site";
import { Container, Badge, Button, SmartImage } from "@/components/ui";
import { Counter, Reveal, useReducedMotion } from "@/components/animations";
import { gsap, Flip } from "@/lib/gsap";

export interface DoctorsListProps {
  doctors: Doctor[];
}

export function DoctorsList({ doctors }: DoctorsListProps) {
  const [activeSpecialty, setActiveSpecialty] = useState<string>("All");
  const prefersReducedMotion = useReducedMotion();

  const gridRef = useRef<HTMLDivElement | null>(null);
  const filterNavRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLSpanElement | null>(null);
  const flipStateRef = useRef<Flip.FlipState | null>(null);

  // Compute specialties list
  const specialties = useMemo(() => {
    const set = new Set<string>();
    doctors.forEach((d) => d.specialties.forEach((s) => set.add(s)));
    return ["All", ...Array.from(set)];
  }, [doctors]);

  // Compute mini-stats
  const totalDoctors = String(doctors.length).padStart(2, "0");
  const combinedExperience = String(
    doctors.reduce((sum, d) => sum + d.experienceYears, 0)
  );
  const uniqueLanguagesCount = String(
    new Set(doctors.flatMap((d) => d.languages)).size
  ).padStart(2, "0");

  // Filtered doctors
  const filteredDoctors = useMemo(() => {
    if (activeSpecialty === "All") return doctors;
    return doctors.filter((doc) => doc.specialties.includes(activeSpecialty));
  }, [doctors, activeSpecialty]);

  // Update sliding indicator on filter button
  const updatePillIndicator = useCallback(() => {
    const nav = filterNavRef.current;
    const indicator = indicatorRef.current;
    if (!nav || !indicator) return;

    const activeBtn = nav.querySelector<HTMLButtonElement>(
      `button[data-specialty="${activeSpecialty}"]`
    );

    if (activeBtn) {
      const left = activeBtn.offsetLeft;
      const width = activeBtn.offsetWidth;

      if (prefersReducedMotion) {
        gsap.set(indicator, { opacity: 1, x: left, width });
      } else {
        gsap.to(indicator, {
          opacity: 1,
          x: left,
          width,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    }
  }, [activeSpecialty, prefersReducedMotion]);

  useEffect(() => {
    updatePillIndicator();
  }, [updatePillIndicator]);

  // Handle specialty filter change with GSAP Flip
  const handleFilterClick = (spec: string) => {
    if (spec === activeSpecialty) return;

    if (gridRef.current && !prefersReducedMotion) {
      // Record initial position of all cards
      const cards = gridRef.current.querySelectorAll<HTMLElement>("[data-doctor-card]");
      flipStateRef.current = Flip.getState(cards);
    }

    setActiveSpecialty(spec);
  };

  // Run Flip animation after React DOM updates
  useLayoutEffect(() => {
    if (!flipStateRef.current || !gridRef.current || prefersReducedMotion) return;

    const state = flipStateRef.current;
    flipStateRef.current = null;

    Flip.from(state, {
      duration: 0.5,
      ease: "power2.inOut",
      scale: true,
      fade: true,
      targets: gridRef.current.querySelectorAll("[data-doctor-card]"),
      onEnter: (elements) =>
        gsap.fromTo(
          elements,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
        ),
      onLeave: (elements) =>
        gsap.to(elements, {
          opacity: 0,
          scale: 0.9,
          duration: 0.25,
          ease: "power2.in",
        }),
    });
  }, [filteredDoctors, prefersReducedMotion]);

  return (
    <div className="relative w-full bg-surface">
      {/* 1. Intro Strip: 3 Mini Stats using Counter */}
      <section
        className="border-b border-surface-alt bg-surface-alt/40 py-10 md:py-12"
        aria-label="Clinical Faculty Summary"
      >
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {/* Stat 1: Total Specialists */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-surface border border-surface-alt/80 shadow-xs">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <GraduationCap className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-baseline">
                  <Counter
                    value={totalDoctors}
                    trigger="load"
                    className="font-display text-3xl sm:text-4xl font-bold text-ink"
                    digitClassName="font-display text-ink"
                  />
                  <span className="font-display text-2xl font-bold text-brand ml-1">
                    Specialists
                  </span>
                </div>
                <p className="text-xs text-ink-muted mt-0.5">
                  Across 6 dental disciplines
                </p>
              </div>
            </div>

            {/* Stat 2: Combined Experience */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-surface border border-surface-alt/80 shadow-xs">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent-dark">
                <Award className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-baseline">
                  <Counter
                    value={combinedExperience}
                    suffix="+"
                    trigger="load"
                    className="font-display text-3xl sm:text-4xl font-bold text-ink"
                    digitClassName="font-display text-ink"
                    suffixClassName="font-display text-brand text-2xl font-bold ml-0.5"
                  />
                  <span className="font-display text-2xl font-bold text-ink ml-1.5">
                    Years
                  </span>
                </div>
                <p className="text-xs text-ink-muted mt-0.5">
                  Cumulative clinical precision
                </p>
              </div>
            </div>

            {/* Stat 3: Languages Spoken */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-surface border border-surface-alt/80 shadow-xs">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Languages className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-baseline">
                  <Counter
                    value={uniqueLanguagesCount}
                    trigger="load"
                    className="font-display text-3xl sm:text-4xl font-bold text-ink"
                    digitClassName="font-display text-ink"
                  />
                  <span className="font-display text-2xl font-bold text-brand ml-1">
                    Languages
                  </span>
                </div>
                <p className="text-xs text-ink-muted mt-0.5">
                  Fluent consultation comfort
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Doctor Directory Main Section */}
      <section
        className="py-16 sm:py-20 lg:py-24"
        aria-labelledby="doctors-catalogue-heading"
      >
        <Container>
          <div className="flex flex-col items-center mb-10 sm:mb-12">
            <h2 id="doctors-catalogue-heading" className="sr-only">
              Our Clinical Team
            </h2>

            {/* Filter Bar with Sliding Indicator */}
            <div className="w-full max-w-4xl overflow-x-auto pb-2 scrollbar-none">
              <div
                ref={filterNavRef}
                role="group"
                aria-label="Filter specialists by discipline"
                className="relative inline-flex items-center p-1.5 rounded-full bg-surface-alt/80 border border-surface-alt/90 min-w-max mx-auto shadow-inner"
              >
                {/* Sliding Active Pill Background */}
                <span
                  ref={indicatorRef}
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1.5 bottom-1.5 rounded-full bg-brand shadow-xs transition-opacity duration-200"
                  style={{ opacity: 0 }}
                />

                {specialties.map((spec) => {
                  const isActive = activeSpecialty === spec;
                  return (
                    <button
                      key={spec}
                      type="button"
                      data-specialty={spec}
                      aria-pressed={isActive}
                      onClick={() => handleFilterClick(spec)}
                      className={`relative z-10 px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                        isActive
                          ? "text-white font-semibold"
                          : "text-ink-muted hover:text-ink"
                      }`}
                    >
                      {spec}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Screen Reader Result Count Announcement */}
            <div
              className="sr-only"
              aria-live="polite"
              aria-atomic="true"
            >
              {`Showing ${filteredDoctors.length} ${
                filteredDoctors.length === 1 ? "doctor" : "doctors"
              }`}
            </div>
          </div>

          {/* 3. Doctors Cards Grid (3 cols desktop, 2 cols tablet, 1 col mobile) */}
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {filteredDoctors.map((doc, idx) => (
              <div
                key={doc.slug}
                data-doctor-card
                className="h-full"
              >
                <Reveal variant="up" delay={idx * 0.08} duration={0.6}>
                  <Link
                    href={`/doctors/${doc.slug}`}
                    className="group relative flex flex-col h-full rounded-2xl bg-surface border border-surface-alt/90 p-4 transition-all duration-300 hover:border-brand/40 hover:shadow-lg hover:-translate-y-1.5 outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    aria-label={`View clinical profile of ${doc.name}, ${doc.role}`}
                  >
                    {/* Portrait Image (Ratio 3/4) with Zoom & Overlay */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-surface-alt">
                      <SmartImage
                        slot={doc.imageSlot}
                        alt={`${doc.name} - ${doc.role}`}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />

                      {/* Glass Chip: Experience Years */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-dark/80 backdrop-blur-md text-[11px] font-medium text-white border border-white/10 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          {doc.experienceYears}+ Yrs Exp
                        </span>
                      </div>

                      {/* Slide-Up Hover Overlay (Desktop) */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-brand-dark via-brand-dark/80 to-transparent flex items-center justify-between text-white transform translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0"
                      >
                        <span className="text-xs font-semibold tracking-wide">
                          View Full Profile
                        </span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-ink">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </div>

                    {/* Card Content Details */}
                    <div className="flex flex-col flex-1 pt-4 pb-2 px-1">
                      {/* Specialties Badges */}
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {doc.specialties.map((spec) => (
                          <Badge
                            key={spec}
                            variant="accent"
                            size="sm"
                            className="text-[10px] uppercase tracking-wider py-0.5 px-2 font-medium"
                          >
                            {spec}
                          </Badge>
                        ))}
                      </div>

                      {/* Doctor Name (h3 for semantic hierarchy) */}
                      <h3 className="font-display text-lg sm:text-xl font-bold text-ink group-hover:text-brand transition-colors line-clamp-1">
                        {doc.name}
                      </h3>

                      {/* Role */}
                      <p className="text-xs font-medium text-brand mt-1 line-clamp-1">
                        {doc.role}
                      </p>

                      {/* Short Bio Snippet */}
                      <p className="text-xs text-ink-muted leading-relaxed mt-2 line-clamp-2">
                        {doc.shortBio}
                      </p>

                      {/* Bottom Card Footer: Experience line & Link indicator */}
                      <div className="mt-auto pt-4 flex items-center justify-between border-t border-surface-alt/70 text-xs">
                        <span className="text-ink-muted font-medium">
                          {doc.qualifications[0]}
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-brand group-hover:underline underline-offset-4">
                          Profile
                          <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              </div>
            ))}
          </div>

          {/* 4. CTA Band at Bottom: "Not sure who to see?" */}
          <div className="mt-16 sm:mt-20 lg:mt-24">
            <div className="relative overflow-hidden rounded-3xl bg-brand-dark text-white p-8 sm:p-12 border border-brand/40 shadow-lg">
              {/* Background ambient accents */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-brand/30 blur-3xl"
              />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="max-w-xl space-y-3">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Personalized Dental Triage
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    Not sure who to see?
                  </h3>
                  <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                    Our front-desk clinical coordinators analyze your symptoms or aesthetic goals to pair you with the ideal specialist for your first consultation.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 shrink-0">
                  <Button
                    href="/appointment"
                    variant="primary"
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Book Consultation
                  </Button>
                  <Button
                    href={`tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`}
                    variant="ghost"
                    size="lg"
                    className="flex items-center gap-2 text-white border-white/20 hover:bg-white/10"
                  >
                    <Phone className="h-4 w-4" />
                    Call Clinic
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

export default DoctorsList;
