"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { Container, Button, SmartImage } from "@/components/ui";
import { MagneticWrap, useLenis, useReducedMotion } from "@/components/animations";
import { heroContent } from "@/data/home";

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
  const subheadingRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRowRef = useRef<HTMLDivElement | null>(null);
  const statsStripRef = useRef<HTMLDivElement | null>(null);
  const trustChipsRef = useRef<HTMLDivElement | null>(null);
  const visualColRef = useRef<HTMLDivElement | null>(null);
  const portraitFrameRef = useRef<HTMLDivElement | null>(null);
  const ratingCardRef = useRef<HTMLDivElement | null>(null);
  const scrollIndicatorRef = useRef<HTMLButtonElement | null>(null);
  const floatTweenRef = useRef<gsap.core.Tween | null>(null);

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

      // Wait for fonts to be loaded so SplitText calculates dimensions accurately
      document.fonts.ready.then(() => {
        if (!headlineRef.current) return;

        // Headline SplitText: splits into masked lines/words
        const split = new SplitText(headlineRef.current, {
          type: "lines,words",
          linesClass: "overflow-hidden leading-tight text-white",
          wordsClass: "text-white inline-block",
        });

        // ---------------------------------------------------------
        // A) Master Page-Load Timeline
        // ---------------------------------------------------------
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

        // 2. Headline words mask slide-up
        if (split.words && split.words.length > 0) {
          masterTl.fromTo(
            split.words,
            { yPercent: 125, opacity: 0 },
            { yPercent: 0, opacity: 1, stagger: 0.04, duration: 0.9, ease: "power3.out" },
            0.25
          );
        }

        // 4. Subheading, CTAs, and Stats Strip
        const textElements = [
          subheadingRef.current,
          ctaRowRef.current,
          statsStripRef.current,
        ].filter(Boolean);

        if (textElements.length > 0) {
          masterTl.fromTo(
            textElements,
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.1, duration: 0.7 },
            "-=0.5"
          );
        }

        // 5. Trust chips stagger in from below with subtle scale
        if (trustChipsRef.current && trustChipsRef.current.children.length > 0) {
          masterTl.fromTo(
            trustChipsRef.current.children,
            { y: 18, scale: 0.94, opacity: 0 },
            { y: 0, scale: 1, opacity: 1, stagger: 0.07, duration: 0.5 },
            "-=0.3"
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

        // 7. Floating Rating Card slide in with overshoot + start yoyo float
        if (ratingCardRef.current) {
          masterTl.fromTo(
            ratingCardRef.current,
            { x: 40, opacity: 0, scale: 0.95 },
            {
              x: 0,
              opacity: 1,
              scale: 1,
              duration: 0.8,
              ease: "back.out(1.2)",
              onComplete: () => {
                // Desktop yoyo float loop
                if (window.innerWidth >= 1024 && ratingCardRef.current) {
                  floatTweenRef.current = gsap.to(ratingCardRef.current, {
                    y: -10,
                    duration: 2.6,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                  });
                }
              },
            },
            "-=0.4"
          );
        }

        // 8. Scroll Indicator fade in
        if (scrollIndicatorRef.current) {
          masterTl.fromTo(
            scrollIndicatorRef.current,
            { opacity: 0, y: -10 },
            { opacity: 1, y: 0, duration: 0.5 },
            "-=0.2"
          );
        }
      });

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
        if (!ratingCardRef.current) return;

        const setCardX = gsap.quickTo(ratingCardRef.current, "x", {
          duration: 0.7,
          ease: "power2.out",
        });
        const setCardY = gsap.quickTo(ratingCardRef.current, "y", {
          duration: 0.7,
          ease: "power2.out",
        });

        const setPortraitX = portraitFrameRef.current
          ? gsap.quickTo(portraitFrameRef.current, "x", { duration: 0.9, ease: "power2.out" })
          : null;
        const setPortraitY = portraitFrameRef.current
          ? gsap.quickTo(portraitFrameRef.current, "y", { duration: 0.9, ease: "power2.out" })
          : null;

        const handleMouseMove = (e: MouseEvent) => {
          const { clientX, clientY } = e;
          const { innerWidth, innerHeight } = window;
          const xRatio = (clientX / innerWidth - 0.5) * 2; // -1 to 1
          const yRatio = (clientY / innerHeight - 0.5) * 2; // -1 to 1

          // Subtle offset opposite to cursor movement
          setCardX(-xRatio * 14);
          setCardY(-yRatio * 14);

          if (setPortraitX && setPortraitY) {
            setPortraitX(xRatio * 10);
            setPortraitY(yRatio * 10);
          }
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

        {/* Subtle mint/teal atmospheric radial glow */}
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
            {/* Accessible Single <h1> Headline */}
            <h1
              ref={headlineRef}
              className="font-rainbow-miracles text-display-xl !font-rainbow-miracles !text-white text-white font-normal tracking-tight text-balance"
              style={{ fontFamily: "var(--font-rainbow-miracles)" }}
            >
              {heroContent.headline}
            </h1>

            {/* Subheading */}
            <p
              ref={subheadingRef}
              className="text-white/80 text-base sm:text-lg lg:text-xl font-normal leading-relaxed text-balance"
            >
              {heroContent.subheading}
            </p>

            {/* CTA Action Buttons */}
            <div ref={ctaRowRef} className="flex flex-wrap items-center gap-4 pt-1">
              <MagneticWrap strength={0.25}>
                <Button
                  href={heroContent.primaryCta.href}
                  variant="secondary"
                  size="lg"
                  className="font-bold text-dark shadow-soft hover:shadow-float"
                >
                  {heroContent.primaryCta.label}
                </Button>
              </MagneticWrap>

              <Button
                href={heroContent.secondaryCta.href}
                variant="light"
                size="lg"
                className="bg-white text-brand font-semibold hover:bg-surface-alt hover:text-brand-dark shadow-soft"
              >
                {heroContent.secondaryCta.label}
              </Button>
            </div>

            {/* Mini Stats Strip */}
            {heroContent.statsStrip && heroContent.statsStrip.length > 0 && (
              <div
                ref={statsStripRef}
                className="grid grid-cols-3 gap-4 pt-4 border-t border-white/15 max-w-lg"
              >
                {heroContent.statsStrip.map((stat, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="font-aileron text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {stat.value}
                    </span>
                    <span className="text-[11px] sm:text-xs text-white/80 font-medium">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Glass Trust Chips */}
            <div
              ref={trustChipsRef}
              className="flex flex-wrap items-center gap-2.5 pt-1"
              aria-label="Clinical Trust Highlights"
            >
              {heroContent.trustChips.map((chip) => (
                <div
                  key={chip.id}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-white shadow-xs"
                >
                  {chip.icon === "doctor" && (
                    <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2a5 5 0 100 10 5 5 0 000-10zm-7 18c0-3.87 3.13-7 7-7s7 3.13 7 7H5z" />
                    </svg>
                  )}
                  {chip.icon === "hygiene" && (
                    <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                    </svg>
                  )}
                  {chip.icon === "emergency" && (
                    <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                  )}
                  <span className="text-white">{chip.label}</span>
                </div>
              ))}
            </div>

            {/* Mobile Viewport Rating Card (Displayed in normal flow below CTAs) */}
            <div className="block lg:hidden pt-4">
              <div className="rounded-2xl bg-white/95 text-ink p-5 shadow-2xl backdrop-blur-md border border-white/40 max-w-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400" aria-label="Rated 4.9 out of 5 stars">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="font-display font-bold text-base text-ink">
                    {heroContent.ratingCard.score} <span className="text-xs text-ink-muted font-normal">/ 5.0</span>
                  </span>
                </div>
                <p className="text-xs italic text-ink-muted mt-2">
                  &ldquo;{heroContent.ratingCard.quote}&rdquo;
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-ink-muted border-t border-line/60 pt-2">
                  <span className="font-medium text-ink">{heroContent.ratingCard.author}</span>
                  <span>{heroContent.ratingCard.count}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Decorative Frame & Desktop Floating Card (Span 5) */}
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

            {/* Desktop Floating Rating Card */}
            <div
              ref={ratingCardRef}
              className={`rounded-2xl bg-white/95 text-ink p-5 shadow-2xl backdrop-blur-md border border-white/40 max-w-xs will-change-transform ${showPortrait
                  ? "absolute -bottom-6 -left-6 z-20"
                  : "relative z-20 ml-auto"
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-400" aria-label="Rated 4.9 out of 5 stars">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-bold text-base text-ink">
                    {heroContent.ratingCard.score}
                  </span>
                  <span className="text-[10px] text-ink-muted">/ 5.0</span>
                </div>
              </div>

              <p className="text-xs italic text-ink-muted mt-2.5 leading-snug">
                &ldquo;{heroContent.ratingCard.quote}&rdquo;
              </p>

              <div className="mt-3.5 flex items-center gap-2.5 border-t border-line/70 pt-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-brand-dark font-bold text-xs">
                  {heroContent.ratingCard.author
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-ink leading-none">
                    {heroContent.ratingCard.author}
                  </span>
                  <span className="text-[10px] text-ink-muted leading-tight mt-0.5">
                    {heroContent.ratingCard.count}
                  </span>
                </div>
              </div>
            </div>
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
