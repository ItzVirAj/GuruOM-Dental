
"use client";

import { useRef, useState } from "react";
import Image from "next/image";

import {
  MapPin,
  Phone,
  Clock,
  X,
  ArrowDown,
  ArrowUpRight,
  Navigation,
  Building2,
} from "lucide-react";

import { gsap, useGSAP } from "@/lib/gsap";
import { Container, SmartImage } from "@/components/ui";
import { useLenis, useReducedMotion } from "@/components/animations";
import { heroContent } from "@/data/home";
import { labs, type LabLocation } from "@/data/labs";

export interface HeroProps {
  /**
   * Controls whether to show the decorative foreground patient portrait card.
   * Default: true
   */
  showPortrait?: boolean;
}

const LAB_CENTRES = [
  "Ahilyanagar",
  "Pune",
  "Chh. Sambhajinagar",
];

const SERVICE_REGIONS = [
  "Nashik",
  "Jalgaon",
  "Beed",
  "Latur",
  "Dharashiv",
  "Solapur",
  "Satara",
];

export function Hero({ showPortrait = true }: HeroProps) {
  const lenis = useLenis();
  const prefersReducedMotion = useReducedMotion();

  // -------------------------------------------------------------
  // References
  // -------------------------------------------------------------

  const heroSectionRef = useRef<HTMLElement | null>(null);
  const bgImageInnerRef = useRef<HTMLDivElement | null>(null);

  const contentColRef = useRef<HTMLDivElement | null>(null);
  const logoImageRef = useRef<HTMLImageElement | null>(null);
  const subheadingRef = useRef<HTMLParagraphElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const locationsBlockRef = useRef<HTMLDivElement | null>(null);

  const visualColRef = useRef<HTMLDivElement | null>(null);
  const portraitFrameRef = useRef<HTMLDivElement | null>(null);
  const scrollIndicatorRef = useRef<HTMLButtonElement | null>(null);

  // -------------------------------------------------------------
  // State
  // -------------------------------------------------------------

  const [activeLocation, setActiveLocation] =
    useState<LabLocation | null>(null);

  // -------------------------------------------------------------
  // Location handling
  // -------------------------------------------------------------

  const handleLocationClick = (name: string) => {
    const normalizedName = name.trim().toLowerCase();

    const found = labs.find(
      (location) =>
        location.name.toLowerCase() === normalizedName ||
        location.districtName?.toLowerCase().includes(normalizedName)
    );

    if (!found) return;

    setActiveLocation((current) =>
      current?.id === found.id ? null : found
    );
  };

  // -------------------------------------------------------------
  // Smooth scrolling
  // -------------------------------------------------------------

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);

    if (!target) return;

    if (lenis) {
      lenis.scrollTo(target, {
        duration: 1.2,
        offset: -20,
      });
    } else {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleScrollClick = () => {
    scrollToSection("hero-next");
  };

  const handleExploreClick = () => {
    scrollToSection("our-labs");
  };

  // -------------------------------------------------------------
  // GSAP Animations
  // -------------------------------------------------------------

  useGSAP(
    () => {
      const hero = heroSectionRef.current;

      if (!hero) return;

      // Respect reduced-motion preferences.
      if (prefersReducedMotion) {
        gsap.set(
          [
            hero,
            bgImageInnerRef.current,
            logoImageRef.current,
            subheadingRef.current,
            actionsRef.current,
            locationsBlockRef.current,
            portraitFrameRef.current,
            scrollIndicatorRef.current,
          ].filter(Boolean),
          {
            visibility: "visible",
            opacity: 1,
            y: 0,
            scale: 1,
          }
        );

        return;
      }

      gsap.set(hero, {
        visibility: "visible",
        opacity: 1,
      });

      const mm = gsap.matchMedia();

      // ---------------------------------------------------------
      // Initial entrance animation
      // ---------------------------------------------------------

      const masterTl = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      if (bgImageInnerRef.current) {
        masterTl.fromTo(
          bgImageInnerRef.current,
          {
            scale: 1.14,
            opacity: 0,
          },
          {
            scale: 1,
            opacity: 1,
            duration: 2,
            ease: "expo.out",
          },
          0
        );
      }

      if (logoImageRef.current) {
        masterTl.fromTo(
          logoImageRef.current,
          {
            yPercent: 115,
            opacity: 0,
          },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.1,
            ease: "power4.out",
          },
          0.35
        );
      }

      if (subheadingRef.current) {
        masterTl.fromTo(
          subheadingRef.current,
          {
            y: 25,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
          },
          0.75
        );
      }

      if (actionsRef.current) {
        masterTl.fromTo(
          actionsRef.current,
          {
            y: 20,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
          },
          0.9
        );
      }

      if (locationsBlockRef.current) {
        masterTl.fromTo(
          locationsBlockRef.current,
          {
            y: 25,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
          },
          1
        );
      }

      if (portraitFrameRef.current) {
        masterTl.fromTo(
          portraitFrameRef.current,
          {
            opacity: 0,
            scale: 0.93,
            y: 35,
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1.1,
            ease: "power3.out",
          },
          0.65
        );
      }

      if (scrollIndicatorRef.current) {
        masterTl.fromTo(
          scrollIndicatorRef.current,
          {
            opacity: 0,
            y: -10,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
          },
          1.3
        );
      }

      // ---------------------------------------------------------
      // Desktop scroll parallax
      // ---------------------------------------------------------

      mm.add("(min-width: 1024px)", () => {
        if (bgImageInnerRef.current) {
          gsap.to(bgImageInnerRef.current, {
            yPercent: 12,
            scale: 1.08,
            ease: "none",
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
        }

        if (contentColRef.current) {
          gsap.to(contentColRef.current, {
            yPercent: -8,
            opacity: 0.3,
            ease: "none",
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
        }
      });

      // ---------------------------------------------------------
      // Desktop mouse parallax
      // ---------------------------------------------------------

      mm.add(
        "(min-width: 1024px) and (pointer: fine)",
        () => {
          const portrait = portraitFrameRef.current;

          if (!portrait) return;

          const setX = gsap.quickTo(portrait, "x", {
            duration: 0.9,
            ease: "power2.out",
          });

          const setY = gsap.quickTo(portrait, "y", {
            duration: 0.9,
            ease: "power2.out",
          });

          const handleMouseMove = (event: MouseEvent) => {
            const xRatio =
              (event.clientX / window.innerWidth - 0.5) * 2;

            const yRatio =
              (event.clientY / window.innerHeight - 0.5) * 2;

            setX(xRatio * 9);
            setY(yRatio * 9);
          };

          window.addEventListener(
            "mousemove",
            handleMouseMove,
            { passive: true }
          );

          return () => {
            window.removeEventListener(
              "mousemove",
              handleMouseMove
            );
          };
        }
      );

      return () => {
        mm.revert();
      };
    },
    {
      scope: heroSectionRef,
      dependencies: [prefersReducedMotion],
    }
  );

  // -------------------------------------------------------------
  // Location chip component
  // -------------------------------------------------------------

  const renderLocationChip = (name: string) => {
    const location = labs.find(
      (item) =>
        item.name.toLowerCase() === name.toLowerCase() ||
        item.districtName?.toLowerCase().includes(name.toLowerCase())
    );

    const isSelected =
      !!location && activeLocation?.id === location.id;

    return (
      <button
        key={name}
        type="button"
        onClick={() => handleLocationClick(name)}
        aria-expanded={isSelected}
        aria-label={`View ${name} location details`}
        title={`View ${name} location details`}
        className={`
          group inline-flex items-center gap-2.5
          rounded-xl border px-3.5 py-2.5
          text-sm font-medium tracking-wide
          transition-all duration-300
          outline-none
          focus-visible:ring-2
          focus-visible:ring-accent
          focus-visible:ring-offset-2
          focus-visible:ring-offset-brand-dark
          ${isSelected
            ? "border-accent bg-accent text-brand-dark shadow-lg shadow-accent/20"
            : "border-white/15 bg-white/[0.06] text-white/80 hover:border-accent/70 hover:bg-accent/10 hover:text-white"
          }
        `}
      >
        <span
          className={`
            relative h-2 w-2 rounded-full
            transition-all duration-300
            ${isSelected
              ? "bg-brand-dark"
              : "bg-accent group-hover:scale-125"
            }
          `}
        />

        <span>{name}</span>

        <ArrowUpRight
          className={`
            h-3.5 w-3.5 transition-all duration-300
            ${isSelected
              ? "rotate-45 text-brand-dark"
              : "text-white/30 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
            }
          `}
        />
      </button>
    );
  };

  // -------------------------------------------------------------
  // Location details panel
  // -------------------------------------------------------------

  const renderLocationDetails = () => {
    if (!activeLocation) return null;

    const isLab = activeLocation.type === "lab";

    return (
      <div
        key={activeLocation.id}
        role="region"
        aria-label={`${activeLocation.name} location details`}
        aria-live="polite"
        className="
          relative mt-5 max-w-2xl
          overflow-hidden rounded-2xl
          border border-white/15
          bg-white/[0.96]
          p-5 text-ink
          shadow-2xl shadow-black/25
          backdrop-blur-2xl
          sm:p-6
        "
      >
        {/* Accent top line */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-accent/50 to-transparent" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={`
                  inline-flex items-center gap-1.5
                  rounded-full px-2.5 py-1
                  text-[10px] font-bold uppercase tracking-[0.12em]
                  ${isLab
                    ? "border border-accent/20 bg-accent-soft text-accent-deep"
                    : "border border-amber-200 bg-amber-50 text-amber-800"
                  }
                `}
              >
                <span
                  className={`
                    h-1.5 w-1.5 rounded-full
                    ${isLab ? "bg-accent" : "bg-amber-500"}
                  `}
                />
                {isLab ? "In-House Digital Lab" : "Regional Service Hub"}
              </span>
            </div>

            <h3 className="font-display text-xl font-bold text-ink sm:text-2xl">
              {activeLocation.name}
            </h3>

            {activeLocation.tagline && (
              <p className="mt-1.5 text-xs italic text-ink-muted">
                {activeLocation.tagline}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setActiveLocation(null)}
            aria-label="Close location details"
            className="
              flex h-9 w-9 shrink-0 items-center justify-center
              rounded-xl border border-line
              text-ink-muted
              transition-colors
              hover:border-accent/40
              hover:bg-accent-soft
              hover:text-ink
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-accent
            "
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="my-5 h-px w-full bg-line/70" />

        {/* Details */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <MapPin className="h-4 w-4" />
            </div>

            <div className="min-w-0 pt-0.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                Location
              </p>

              <p className="mt-1 text-sm font-medium leading-relaxed text-ink">
                {activeLocation.address}
              </p>
            </div>
          </div>

          {activeLocation.phone && (
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Phone className="h-4 w-4" />
              </div>

              <div className="min-w-0 pt-0.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                  Contact
                </p>

                <a
                  href={`tel:${activeLocation.phone}`}
                  className="
                    mt-1 inline-block text-sm font-semibold
                    text-brand transition-colors
                    hover:text-accent hover:underline
                  "
                >
                  {activeLocation.phone}
                </a>
              </div>
            </div>
          )}

          {activeLocation.hours && (
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Clock className="h-4 w-4" />
              </div>

              <div className="min-w-0 pt-0.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                  Working Hours
                </p>

                <p className="mt-1 text-sm font-medium text-ink">
                  {activeLocation.hours}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-wrap gap-2.5 border-t border-line/70 pt-4">
          {activeLocation.phone && (
            <a
              href={`tel:${activeLocation.phone}`}
              className="
                inline-flex items-center gap-2
                rounded-xl bg-brand px-4 py-2.5
                text-xs font-semibold text-white
                shadow-lg shadow-brand/15
                transition-all duration-300
                hover:-translate-y-0.5 hover:bg-brand-light
              "
            >
              <Phone className="h-3.5 w-3.5" />
              Call Location
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          )}

          <button
            type="button"
            onClick={() => scrollToSection("our-labs")}
            className="
              inline-flex items-center gap-2
              rounded-xl border border-line
              bg-surface px-4 py-2.5
              text-xs font-semibold text-brand
              transition-all duration-300
              hover:border-accent/50
              hover:bg-accent-soft
            "
          >
            <Navigation className="h-3.5 w-3.5 text-accent" />
            View on Maharashtra Map
          </button>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // Main component
  // -------------------------------------------------------------

  return (
    <section
      ref={heroSectionRef}
      aria-label="Welcome to GuruOm Dental"
      className="
        relative isolate flex min-h-[100svh] w-full
        flex-col justify-between overflow-hidden
        bg-brand-dark pt-[var(--nav-h,5rem)]
        text-white
      "
    >
      {/* ======================================================= */}
      {/* BACKGROUND */}
      {/* ======================================================= */}

      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div
          ref={bgImageInnerRef}
          className="absolute inset-0 will-change-transform"
        >
          <SmartImage
            slot="heroBg"
            src="/images/PRO-Craft-Homepage-Video_V2_Moment-6-1.webp"
            alt="GuruOm Dental modern clinical sanctuary"
            aspect="16/9"
            priority
            className="
              h-full min-h-[100svh] w-full
              object-cover object-center
            "
          />
        </div>

        {/* Main dark overlay */}
        <div className="absolute inset-0 bg-brand-dark/50" />

        {/* Left-side content contrast */}
        <div className="
          absolute inset-0
          bg-gradient-to-r
          from-brand-dark/[0.97]
          via-brand-dark/[0.88]
          to-brand-dark/[0.48]
        " />

        {/* Top fade */}
        <div className="
          absolute inset-0
          bg-gradient-to-b
          from-brand-dark/65
          via-transparent
          to-transparent
        " />

        {/* Bottom fade */}
        <div className="
          absolute inset-0
          bg-gradient-to-t
          from-brand-dark
          via-brand-dark/20
          to-transparent
        " />

        {/* Ambient accent glow */}
        <div className="
          absolute -left-40 top-[25%]
          h-[450px] w-[450px]
          rounded-full bg-accent/[0.10]
          blur-[140px]
        " />

        <div className="
          absolute -right-40 bottom-[5%]
          h-[500px] w-[500px]
          rounded-full bg-accent/[0.07]
          blur-[150px]
        " />

        {/* Fine texture */}
        <div className="
          absolute inset-0 opacity-[0.035]
          [background-image:radial-gradient(rgba(255,255,255,0.8)_0.6px,transparent_0.6px)]
          [background-size:6px_6px]
        " />
      </div>

      {/* ======================================================= */}
      {/* MAIN CONTENT */}
      {/* ======================================================= */}

      <Container className="
        relative z-10 flex flex-1
        flex-col justify-center
        py-12 sm:py-14 lg:py-16
      ">
        <div className="
          grid min-h-[calc(100svh-var(--nav-h,5rem)-5rem)]
          grid-cols-1 items-center
          gap-12 lg:grid-cols-12 lg:gap-8
        ">

          {/* =================================================== */}
          {/* LEFT CONTENT */}
          {/* =================================================== */}

          <div
            ref={contentColRef}
            className="
              flex max-w-[700px] flex-col
              gap-6 sm:gap-7
              lg:col-span-7
              will-change-transform
            "
          >
            {/* Logo headline */}
            <div className="max-w-[570px]">
              <h1 className="relative">
                <span className="sr-only">
                  GuruOm Dental — Healthy smiles, gently cared for.
                </span>

                <span className="block overflow-hidden py-2">
                  <Image
                    ref={logoImageRef}
                    src="/images/NewLogo-Viraj-Guru-OM-PNG.png"
                    alt="GuruOm Dental - Healthy smiles, gently cared for."
                    width={843}
                    height={193}
                    priority
                    className="
                      h-auto w-full max-w-[480px]
                      object-contain object-left
                      opacity-0
                      drop-shadow-[0_8px_25px_rgba(0,0,0,0.25)]
                      sm:max-w-[550px]
                    "
                  />
                </span>
              </h1>
            </div>

            {/* Description */}
            <div className="max-w-[550px]">
              <p
                ref={subheadingRef}
                className="
                  max-w-xl text-sm
                  font-normal leading-[1.9]
                  text-white/70 opacity-0
                  sm:text-base
                  lg:text-[16px]
                "
              >
                {heroContent.subheading}
              </p>
            </div>

            {/* Primary actions */}
            <div
              ref={actionsRef}
              className="
                flex flex-wrap items-center gap-4
                pt-1 opacity-0
              "
            >
              <button
                type="button"
                onClick={handleExploreClick}
                className="
                  group inline-flex items-center gap-3
                  rounded-xl bg-accent
                  px-5 py-3.5
                  text-sm font-bold text-brand-dark
                  shadow-xl shadow-accent/15
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:bg-white
                  hover:shadow-accent/20
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-white
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-brand-dark
                "
              >
                Explore Our Network

                <span className="
                  flex h-6 w-6 items-center justify-center
                  rounded-lg bg-brand-dark/10
                  transition-transform duration-300
                  group-hover:translate-x-1
                ">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </button>
            </div>

            {/* ================================================= */}
            {/* LOCATION EXPLORER */}
            {/* ================================================= */}

            <div
              ref={locationsBlockRef}
              className="
                relative max-w-2xl
                border-t border-white/15
                pt-6
              "
            >
              {/* Section heading */}
              <div className="mb-5 flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" />
                <h2
                  className="font-aileron text-xs font-semibold uppercase tracking-[0.18em] text-white/90 sm:text-[13px]"
                >
                  <span className="text-accent">Our Reach</span>
                  <span className="mx-2 text-white/30">—</span>
                  <span>Maharashtra, India</span>
                </h2>
              </div>

              {/* In-house labs */}
              <div className="mb-6">
                <div className="
                  mb-3 flex items-center gap-2.5
                ">
                  <div className="
                    flex h-7 w-7 items-center
                    justify-center rounded-lg
                    border border-accent/20
                    bg-accent/10 text-accent
                  ">
                    <Building2 className="h-3.5 w-3.5" />
                  </div>

                  <div>
                    <p className="
                      text-[11px] font-bold
                      uppercase tracking-[0.16em]
                      text-white/85
                    ">
                      In-House Digital Labs
                    </p>
                  </div>

                  <span className="
                    rounded-md bg-accent/10
                    px-2 py-1 text-[10px]
                    font-bold tabular-nums
                    text-accent
                  ">
                    03
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {LAB_CENTRES.map(renderLocationChip)}
                </div>
              </div>

              {/* Regional services */}
              <div>
                <div className="
                  mb-3 flex items-center gap-2.5
                ">
                  <div className="
                    flex h-7 w-7 items-center
                    justify-center rounded-lg
                    border border-white/10
                    bg-white/[0.06] text-white/65
                  ">
                    <Navigation className="h-3.5 w-3.5" />
                  </div>

                  <p className="
                    text-[11px] font-bold
                    uppercase tracking-[0.16em]
                    text-white/70
                  ">
                    Regional Service Coverage
                  </p>

                  <span className="
                    rounded-md border border-white/10
                    bg-white/[0.05] px-2 py-1
                    text-[10px] font-bold
                    tabular-nums text-white/55
                  ">
                    07
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {SERVICE_REGIONS.map(renderLocationChip)}
                </div>
              </div>

              {/* Active location details */}
              {renderLocationDetails()}
            </div>
          </div>

          {/* =================================================== */}
          {/* RIGHT VISUAL COLUMN */}
          {/* =================================================== */}

          <div
            ref={visualColRef}
            className="
              relative hidden min-h-[560px]
              items-center justify-center
              lg:col-span-5 lg:flex
            "
          >
            {/* Ambient rings */}
            <div className="
              absolute left-1/2 top-1/2
              h-[460px] w-[460px]
              -translate-x-1/2 -translate-y-1/2
              rounded-full border border-white/[0.07]
            " />

            <div className="
              absolute left-1/2 top-1/2
              h-[370px] w-[370px]
              -translate-x-1/2 -translate-y-1/2
              rounded-full border border-accent/10
            " />

            <div className="
              absolute left-1/2 top-1/2
              h-[290px] w-[290px]
              -translate-x-1/2 -translate-y-1/2
              rounded-full bg-accent/[0.06]
              blur-[90px]
            " />

            {/* Portrait */}
            <div
              ref={portraitFrameRef}
              className="
                relative z-10 w-full
                max-w-[360px]
                opacity-0 will-change-transform
              "
            >
              {showPortrait ? (
                <div className="
                  relative rounded-[2rem]
                  border border-white/20
                  bg-white/[0.07]
                  p-2.5 shadow-2xl
                  shadow-black/40
                  backdrop-blur-xl
                ">
                  <div className="
                    relative aspect-[3/4]
                    overflow-hidden rounded-[1.5rem]
                    bg-brand-dark
                  ">
                    <SmartImage
                      slot="heroPatient"
                      src="/images/DRGuruprasad.jpeg"
                      alt="Dr. Guruprasad Handal - Founder, GuruOm Dental"
                      aspect="3/4"
                      priority
                      className="
                        h-full w-full object-cover
                      "
                    />

                    {/* Image contrast gradient */}
                    <div className="
                      pointer-events-none absolute inset-0
                      bg-gradient-to-t
                      from-brand-dark/45
                      via-transparent
                      to-transparent
                    " />
                  </div>

                  {/* Founder information card */}
                  <div className="
                    absolute -bottom-7 -right-10
                    min-w-[240px]
                    rounded-2xl border border-white/15
                    bg-brand-dark/95 p-5
                    shadow-2xl shadow-black/30
                    backdrop-blur-2xl
                  ">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="
                        text-[10px] font-semibold
                        uppercase tracking-[0.2em]
                        text-accent
                      ">
                        Our Founder
                      </p>

                      <span className="
                        h-2 w-2 rounded-full
                        bg-accent shadow-[0_0_12px_var(--accent)]
                      " />
                    </div>

                    <h3
                      className="
                        font-just-serif text-lg
                        font-normal leading-snug
                        text-white
                      "
                      style={{ fontFamily: "var(--font-just-serif), serif" }}
                    >
                      Dr. Guruprasad Handal
                    </h3>
                  </div>
                </div>
              ) : (
                /* Alternative visual when portrait is disabled */
                <div className="
                  relative flex aspect-[4/5]
                  w-full flex-col justify-between
                  overflow-hidden rounded-[2rem]
                  border border-white/15
                  bg-gradient-to-br
                  from-white/[0.12]
                  via-brand-dark/80
                  to-brand-dark
                  p-8 shadow-2xl
                ">
                  <div className="
                    absolute -right-20 -top-20
                    h-72 w-72 rounded-full
                    bg-accent/10 blur-[80px]
                  " />

                  <div className="relative">
                    <span className="
                      flex h-14 w-14 items-center
                      justify-center rounded-2xl
                      border border-accent/25
                      bg-accent/10 text-accent
                    ">
                      <Building2 className="h-7 w-7" />
                    </span>

                    <p className="
                      mt-6 text-[10px]
                      font-bold uppercase
                      tracking-[0.24em] text-accent
                    ">
                      Our Founder
                    </p>

                    <h3
                      className="
                        mt-3 max-w-xs
                        font-just-serif text-3xl
                        font-normal leading-tight
                        text-white
                      "
                      style={{ fontFamily: "var(--font-just-serif), serif" }}
                    >
                      Dr. Guruprasad Handal
                    </h3>
                  </div>

                  <div className="
                    relative mt-8
                    border-t border-white/15
                    pt-5
                  ">
                    <p className="
                      text-xs font-medium
                      tracking-wide text-white/55
                    ">
                      Founder, GuruOm Dental
                    </p>

                    <div className="
                      mt-4 h-1 w-16
                      rounded-full bg-accent
                    " />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>

      {/* ======================================================= */}
      {/* BOTTOM SCROLL BAR */}
      {/* ======================================================= */}

      <div className="
        relative z-10
        border-t border-white/10
        bg-brand-dark/40
        backdrop-blur-xl
      ">
        <Container>
          <div className="
            flex min-h-[68px]
            items-center justify-between gap-4
          ">
            <button
              ref={scrollIndicatorRef}
              type="button"
              onClick={handleScrollClick}
              aria-label="Scroll to next section"
              className="
                group inline-flex items-center gap-3
                py-4 text-[10px] font-semibold
                uppercase tracking-[0.2em]
                text-white/50
                transition-colors duration-300
                hover:text-accent
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-accent
              "
            >
              <span className="
                flex h-8 w-8 items-center
                justify-center rounded-full
                border border-white/15
                transition-all duration-300
                group-hover:border-accent/50
                group-hover:bg-accent/10
              ">
                <ArrowDown className="
                  h-3.5 w-3.5
                  transition-transform duration-300
                  group-hover:translate-y-1
                " />
              </span>

              Scroll to Discover
            </button>

            <div className="
              hidden items-center gap-3
              sm:flex
            ">
              <span className="
                text-[10px] font-medium
                uppercase tracking-[0.17em]
                text-white/35
              ">
                Healthy smiles, gently cared for.
              </span>

              <span className="h-px w-8 bg-accent/50" />
            </div>

            <span className="
              text-[10px] font-semibold
              uppercase tracking-[0.15em]
              text-white/35
              sm:hidden
            ">
              GuruOm Dental
            </span>
          </div>
        </Container>
      </div>
    </section>
  );
}

export default Hero;
