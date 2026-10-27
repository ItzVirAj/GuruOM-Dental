"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { MapPin, Phone, Clock, X } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Container, SmartImage } from "@/components/ui";
import { useLenis, useReducedMotion } from "@/components/animations";
import { heroContent } from "@/data/home";
import { labs, type LabLocation } from "@/data/labs";

export interface HeroProps {
  /**
   * Controls whether to show the decorative foreground patient portrait card on desktop.
   * Default: true
   */
  showPortrait?: boolean;
}

export function Hero({ showPortrait = true }: HeroProps) {
  const lenis = useLenis();
  const prefersReducedMotion = useReducedMotion();

  // Root & element refs
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const bgWrapperRef = useRef<HTMLDivElement | null>(null);
  const bgImageInnerRef = useRef<HTMLDivElement | null>(null);
  const contentColRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const logoImageRef = useRef<HTMLImageElement | null>(null);
  const subheadingRef = useRef<HTMLParagraphElement | null>(null);
  const locationsBlockRef = useRef<HTMLDivElement | null>(null);
  const visualColRef = useRef<HTMLDivElement | null>(null);
  const portraitFrameRef = useRef<HTMLDivElement | null>(null);
  const scrollIndicatorRef = useRef<HTMLButtonElement | null>(null);
  const floatTweenRef = useRef<gsap.core.Tween | null>(null);

  // Active location state for small details popover
  const [activeLocation, setActiveLocation] = useState<LabLocation | null>(null);

  const handleLocationClick = (name: string) => {
    const found = labs.find(
      (l) =>
        l.name.toLowerCase() === name.toLowerCase() ||
        l.districtName?.toLowerCase().includes(name.toLowerCase())
    );
    if (!found) return;

    if (activeLocation?.id === found.id) {
      setActiveLocation(null);
    } else {
      setActiveLocation(found);
    }
  };

  // -------------------------------------------------------------
  // GSAP Animations (Load Timeline, Scroll Parallax, Mouse Parallax)
  // -------------------------------------------------------------
  useGSAP(
    () => {
      const hero = heroSectionRef.current;
      if (!hero) return;

      // Handle Reduced Motion preference
      if (prefersReducedMotion) {
        gsap.to(hero, { opacity: 1, duration: 0.4 });
        return;
      }

      // Initial anti-FOUC set
      gsap.set(hero, { visibility: "visible", opacity: 1 });

      const mm = gsap.matchMedia();

      // Master Page-Load Timeline
      const masterTl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      // 1. Background image: subtle scale down from 1.15 to 1.0 with soft fade
      if (bgImageInnerRef.current) {
        masterTl.fromTo(
          bgImageInnerRef.current,
          { scale: 1.15, opacity: 0 },
          { scale: 1.0, opacity: 1, duration: 1.8, ease: "expo.out" },
          0
        );
      }

      // 2. Headline logo mask slide-up (preserving exact animation from previous text)
      if (logoImageRef.current) {
        masterTl.fromTo(
          logoImageRef.current,
          { yPercent: 125, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.9, ease: "power3.out" },
          0.25
        );
      }

        // 4. Subheading and Working Centres / Services Block
        const textElements = [
          subheadingRef.current,
          locationsBlockRef.current,
        ].filter(Boolean);

        if (textElements.length > 0) {
          masterTl.fromTo(
            textElements,
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.12, duration: 0.7 },
            "-=0.5"
          );
        }

        // 6. Right side portrait frame (desktop)
        if (portraitFrameRef.current) {
          masterTl.fromTo(
            portraitFrameRef.current,
            { opacity: 0, scale: 0.94, y: 30 },
            { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: "power2.out" },
            "-=0.6"
          );
        }

        // 7. Scroll Indicator fade in
        if (scrollIndicatorRef.current) {
          masterTl.fromTo(
            scrollIndicatorRef.current,
            { opacity: 0, y: -10 },
            { opacity: 1, y: 0, duration: 0.5 },
            "-=0.2"
          );
        }

      // ---------------------------------------------------------
      // B) Desktop-Only Scroll Parallax (Lenis synced)
      // ---------------------------------------------------------
      mm.add("(min-width: 1024px)", () => {
        if (bgImageInnerRef.current) {
          gsap.to(bgImageInnerRef.current, {
            yPercent: 14,
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
            yPercent: -12,
            opacity: 0.25,
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
      // C) Subtle Mouse Parallax (Desktop Fine Pointer Only)
      // ---------------------------------------------------------
      mm.add("(min-width: 1024px) and (pointer: fine)", () => {
        if (!portraitFrameRef.current) return;

        const setPortraitX = gsap.quickTo(portraitFrameRef.current, "x", {
          duration: 0.9,
          ease: "power2.out",
        });
        const setPortraitY = gsap.quickTo(portraitFrameRef.current, "y", {
          duration: 0.9,
          ease: "power2.out",
        });

        const handleMouseMove = (e: MouseEvent) => {
          const { clientX, clientY } = e;
          const { innerWidth, innerHeight } = window;
          const xRatio = (clientX / innerWidth - 0.5) * 2; // -1 to 1
          const yRatio = (clientY / innerHeight - 0.5) * 2; // -1 to 1

          setPortraitX(xRatio * 10);
          setPortraitY(yRatio * 10);
        };

        window.addEventListener("mousemove", handleMouseMove, { passive: true });

        return () => {
          window.removeEventListener("mousemove", handleMouseMove);
        };
      });

      return () => {
        mm.revert();
        if (floatTweenRef.current) {
          floatTweenRef.current.kill();
        }
      };
    },
    { scope: heroSectionRef, dependencies: [prefersReducedMotion] }
  );

  // Smooth scroll handler for scroll indicator
  const handleScrollClick = () => {
    const nextSection = document.getElementById("hero-next");
    if (nextSection) {
      if (lenis) {
        lenis.scrollTo(nextSection, { duration: 1.2 });
      } else {
        nextSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section
      ref={heroSectionRef}
      className="relative min-h-[100svh] w-full flex flex-col justify-between overflow-hidden bg-brand-dark text-white pt-[var(--nav-h,5rem)]"
      aria-label="Welcome to GuruOm Dental"
    >
      {/* 1. Immersive Background & Ambient Gradients */}
      <div
        ref={bgWrapperRef}
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Animated background photo placeholder wrapper */}
        <div ref={bgImageInnerRef} className="relative w-full h-full will-change-transform">
          <SmartImage
            slot="heroBg"
            src="/images/hero-bg.webp"
            alt="GuruOm Dental modern clinical sanctuary"
            aspect="16/9"
            priority
            className="w-full h-full object-cover min-h-[100svh]"
          />
        </div>

        {/* Brand-tinted gradient overlays: 70% dark left fading to 25% right */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/95 via-brand-dark/80 to-brand-dark/40 z-10" />

        {/* Bottom edge fade for seamless visual connection to following sections */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-90 z-10" />

        {/* Subtle orange atmospheric radial glow */}
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px] z-10" />
      </div>

      {/* 2. Main Content Grid */}
      <Container className="relative z-10 flex-1 flex flex-col justify-center py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center min-h-[calc(100svh-var(--nav-h,5rem)-5rem)]">
          {/* Left Column: Headline, Subheading, CTAs, Stats, Trust Chips (Span 7) */}
          <div
            ref={contentColRef}
            className="lg:col-span-7 flex flex-col gap-6 sm:gap-7 max-w-[640px] will-change-transform"
          >
            {/* Accessible Single <h1> Headline with Brand Logo */}
            <h1
              ref={headlineRef}
              className="relative max-w-xl"
            >
              <span className="sr-only">GuruOm Dental — Healthy smiles, gently cared for.</span>
              <div className="overflow-hidden py-1">
                <Image
                  ref={logoImageRef}
                  src="/images/NewLogo-Viraj-Guru-OM-PNG.png"
                  alt="GuruOm Dental - Healthy smiles, gently cared for."
                  width={843}
                  height={193}
                  priority
                  className="w-full max-w-[460px] sm:max-w-[540px] h-auto object-contain will-change-transform drop-shadow-md"
                />
              </div>
            </h1>

            {/* Subheading */}
            <p
              ref={subheadingRef}
              className="text-white/80 text-sm sm:text-base font-normal leading-relaxed max-w-xl"
            >
              {heroContent.subheading}
            </p>

            {/* Network Highlights: Our Working Centres & Services Across */}
            {/* Network Highlights: Our Lab Centres & Services Across */}
            <div ref={locationsBlockRef} className="flex flex-col gap-6 pt-2">
              {/* 1. Our Lab Centres */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3 items-center justify-center">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: "var(--accent)" }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-2.5 w-2.5"
                      style={{ backgroundColor: "var(--accent)" }}
                    />
                  </span>
                  <span className="text-base sm:text-lg font-bold uppercase tracking-wider text-accent font-body">
                    Our Lab Centres
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  {[
                    "Ahilyanagar",
                    "Pune",
                    "Chh. Sambhajinagar",
                  ].map((centre) => {
                    const locData = labs.find((l) => l.name === centre);
                    const isSelected = activeLocation?.id === locData?.id;
                    return (
                      <button
                        key={centre}
                        type="button"
                        onClick={() => handleLocationClick(centre)}
                        className={`group inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-white font-body text-sm font-bold shadow-sm transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                          isSelected
                            ? "bg-accent text-brand-dark border-accent ring-2 ring-accent/60 shadow-lg scale-105"
                            : "bg-accent/15 hover:bg-accent/25 border border-accent/40 hover:border-accent text-white"
                        }`}
                        title={`Click to view address and contact for ${centre}`}
                        aria-expanded={isSelected}
                      >
                        <span
                          className={`w-2 h-2 rounded-full transition-transform ${
                            isSelected ? "bg-brand-dark" : "bg-accent group-hover:scale-125"
                          }`}
                        />
                        <span className={`font-bold tracking-normal ${isSelected ? "text-brand-dark" : "text-white"}`}>
                          {centre}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Services Across */}
              <div className="flex flex-col gap-3 pt-1">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3 items-center justify-center">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: "var(--accent)" }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-2.5 w-2.5"
                      style={{ backgroundColor: "var(--accent)" }}
                    />
                  </span>
                  <span className="text-base sm:text-lg font-bold uppercase tracking-wider text-accent font-body">
                    Services Across
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  {[
                    "Nashik",
                    "Jalgaon",
                    "Beed",
                    "Latur",
                    "Dharashiv",
                    "Solapur",
                    "Satara",
                  ].map((city) => {
                    const locData = labs.find((l) => l.name === city);
                    const isSelected = activeLocation?.id === locData?.id;
                    return (
                      <button
                        key={city}
                        type="button"
                        onClick={() => handleLocationClick(city)}
                        className={`group inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-white font-body text-sm font-bold shadow-sm transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                          isSelected
                            ? "bg-accent text-brand-dark border-accent ring-2 ring-accent/60 shadow-lg scale-105"
                            : "bg-accent/15 hover:bg-accent/25 border border-accent/40 hover:border-accent text-white"
                        }`}
                        title={`Click to view address and contact for ${city}`}
                        aria-expanded={isSelected}
                      >
                        <span
                          className={`w-2 h-2 rounded-full transition-transform ${
                            isSelected ? "bg-brand-dark" : "bg-accent group-hover:scale-125"
                          }`}
                        />
                        <span className={`font-bold tracking-normal ${isSelected ? "text-brand-dark" : "text-white"}`}>
                          {city}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Location & Contact Details Box */}
              {activeLocation && (
                <div
                  role="region"
                  aria-label={`${activeLocation.name} location details`}
                  className="relative mt-1 rounded-2xl bg-white/95 text-ink p-5 sm:p-6 shadow-2xl backdrop-blur-xl border border-white/90 animate-in fade-in zoom-in-95 duration-200 z-20 max-w-xl"
                >
                  {/* Top Bar with Name & Close Button */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          activeLocation.type === "lab" ? "bg-accent" : "bg-amber-500"
                        }`}
                      />
                      <h3 className="font-display text-lg sm:text-xl font-bold text-ink">
                        {activeLocation.name}
                      </h3>
                      <span
                        className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full ${
                          activeLocation.type === "lab"
                            ? "bg-accent-soft text-accent-deep border border-accent/20"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {activeLocation.type === "lab"
                          ? "In-House Digital Lab"
                          : "Regional Service Hub"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveLocation(null)}
                      className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-alt transition-colors"
                      aria-label="Close location box"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Tagline */}
                  <p className="text-xs text-brand font-medium italic mb-4">
                    {activeLocation.tagline}
                  </p>

                  {/* Details: Location, Contact Number, Hours */}
                  <div className="space-y-2.5 text-xs sm:text-sm">
                    {/* Location / Address */}
                    <div className="flex items-start gap-2.5 text-ink/90">
                      <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span className="leading-snug">
                        <strong className="text-ink">Location: </strong>
                        {activeLocation.address}
                      </span>
                    </div>

                    {/* Contact Number */}
                    <div className="flex items-center gap-2.5 text-ink/90">
                      <Phone className="w-4 h-4 text-accent shrink-0" />
                      <div className="flex items-center gap-2">
                        <strong className="text-ink">Contact: </strong>
                        <a
                          href={`tel:${activeLocation.phone}`}
                          className="font-bold text-brand hover:text-accent hover:underline transition-colors"
                        >
                          {activeLocation.phone}
                        </a>
                      </div>
                    </div>

                    {/* Hours */}
                    <div className="flex items-center gap-2.5 text-ink-muted text-xs">
                      <Clock className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span>{activeLocation.hours}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3.5 border-t border-line/60 flex flex-wrap items-center gap-3">
                    <a
                      href={`tel:${activeLocation.phone}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand-light transition-colors shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Call {activeLocation.phone}
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById("our-labs");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-alt text-brand text-xs font-semibold border border-line/70 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-accent" />
                      View on Maharashtra Map
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Decorative Frame (Span 5) */}
          <div
            ref={visualColRef}
            className="hidden lg:flex lg:col-span-5 relative justify-end items-center will-change-transform min-h-[460px]"
          >
            {/* Optional foreground portrait frame */}
            {showPortrait && (
              <div
                ref={portraitFrameRef}
                className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-surface/10 backdrop-blur-xs p-2 will-change-transform"
              >
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden">
                  <SmartImage
                    slot="heroPatient"
                    src="/images/hero-patient.jpeg"
                    alt="Patient smiling with confidence after precision dental care"
                    aspect="3/4"
                    priority
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>

      {/* 3. Accessible Scroll Down Indicator */}
      <div className="relative z-10 w-full py-4 border-t border-white/10 bg-brand-dark/30 backdrop-blur-xs">
        <Container>
          <div className="flex items-center justify-between">
            <button
              ref={scrollIndicatorRef}
              type="button"
              onClick={handleScrollClick}
              aria-label="Scroll to next section"
              className="group flex items-center gap-3 text-xs uppercase tracking-widest text-white/70 hover:text-white transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md py-1"
            >
              <div className="w-[2px] h-6 bg-white/20 rounded-full relative overflow-hidden">
                <span className="absolute top-0 left-0 w-full h-1/2 bg-accent rounded-full animate-bounce" />
              </div>
              <span className="group-hover:translate-x-0.5 transition-transform">Scroll down</span>
            </button>

            <span className="hidden sm:inline-block text-[11px] text-white/50 tracking-wider">
              GuruOm Speciality Dental Sanctuary
            </span>
          </div>
        </Container>
      </div>
    </section>
  );
}
export default Hero;
