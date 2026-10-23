"use client";

import React, { useRef, useState, useEffect } from "react";
import { Check } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import {
  Container,
  Section,
  Badge,
  Eyebrow,
  Button,
  SmartImage,
} from "@/components/ui";
import { SplitHeading, useReducedMotion } from "@/components/animations";
import {
  checkupContent,
  CheckupContent,
  CheckupCard,
  CheckupTone,
} from "@/data/home";

export interface CheckupStackProps {
  content?: CheckupContent;
}

interface ToneStyle {
  card: string;
  number: string;
  title: string;
  summary: string;
  checklistText: string;
  checklistIconBg: string;
  checklistIcon: string;
  badgeVariant: "brand" | "accent" | "default" | "outline";
  note: string;
  chip: string;
  overlay: string;
}

const toneStyles: Record<CheckupTone, ToneStyle> = {
  dark: {
    card: "bg-brand-dark text-white border border-brand/50",
    number: "text-white/20",
    title: "text-white",
    summary: "text-white/80",
    checklistText: "text-white/90",
    checklistIconBg: "bg-accent/20 border border-accent/40",
    checklistIcon: "text-accent",
    badgeVariant: "accent",
    note: "text-white/60",
    chip: "bg-brand-dark/85 text-white border border-white/20 backdrop-blur-md",
    overlay: "bg-black",
  },
  brand: {
    card: "bg-brand text-white border border-brand-light/50",
    number: "text-white/20",
    title: "text-white",
    summary: "text-white/85",
    checklistText: "text-white/90",
    checklistIconBg: "bg-accent/20 border border-accent/40",
    checklistIcon: "text-accent",
    badgeVariant: "accent",
    note: "text-white/60",
    chip: "bg-brand/85 text-white border border-white/20 backdrop-blur-md",
    overlay: "bg-black",
  },
  accent: {
    card: "bg-accent-soft text-ink border border-accent/50",
    number: "text-brand/15",
    title: "text-brand-dark",
    summary: "text-ink-muted",
    checklistText: "text-ink",
    checklistIconBg: "bg-brand/10 border border-brand/20",
    checklistIcon: "text-brand",
    badgeVariant: "brand",
    note: "text-ink-muted",
    chip: "bg-white/90 text-brand-dark border border-line backdrop-blur-md",
    overlay: "bg-brand-dark",
  },
  white: {
    card: "bg-white text-ink border border-line",
    number: "text-ink/10",
    title: "text-ink",
    summary: "text-ink-muted",
    checklistText: "text-ink",
    checklistIconBg: "bg-brand/10 border border-brand/20",
    checklistIcon: "text-brand",
    badgeVariant: "accent",
    note: "text-ink-muted",
    chip: "bg-white/90 text-brand border border-line backdrop-blur-md",
    overlay: "bg-brand-dark",
  },
  alt: {
    card: "bg-surface-alt text-ink border border-line",
    number: "text-brand/15",
    title: "text-ink",
    summary: "text-ink-muted",
    checklistText: "text-ink",
    checklistIconBg: "bg-brand/10 border border-brand/20",
    checklistIcon: "text-brand",
    badgeVariant: "brand",
    note: "text-ink-muted",
    chip: "bg-surface-alt/95 text-brand border border-line backdrop-blur-md",
    overlay: "bg-brand-dark",
  },
};

export const CheckupStack: React.FC<CheckupStackProps> = ({
  content = checkupContent,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isSectionInView, setIsSectionInView] = useState(false);
  const [isStickyLayout, setIsStickyLayout] = useState(true);

  const sectionRef = useRef<HTMLElement | null>(null);
  const stackWrapperRef = useRef<HTMLDivElement | null>(null);
  const cardElementsRef = useRef<(HTMLElement | null)[]>([]);

  // Check screen dimensions for sticky fallback (<640px height)
  useEffect(() => {
    const checkLayout = () => {
      if (typeof window === "undefined") return;
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const isHeightOk = window.matchMedia("(min-height: 640px)").matches;

      // On reduced motion or very short screens, disable sticky stacking
      if (prefersReduced || !isHeightOk) {
        setIsStickyLayout(false);
      } else {
        setIsStickyLayout(true);
      }
    };

    checkLayout();
    window.addEventListener("resize", checkLayout);
    return () => window.removeEventListener("resize", checkLayout);
  }, []);

  // --------------------------------------------------------------------------
  // GSAP: ScrollTrigger Scrubbed Stacking & Scaling
  // --------------------------------------------------------------------------
  useGSAP(
    () => {
      if (
        !sectionRef.current ||
        !stackWrapperRef.current ||
        prefersReducedMotion ||
        !isStickyLayout
      ) {
        return;
      }

      // Refresh ScrollTrigger when web fonts are ready
      if (typeof document !== "undefined" && document.fonts) {
        document.fonts.ready.then(() => {
          ScrollTrigger.refresh();
        });
      }

      const mm = gsap.matchMedia();

      // Desktop & Tablet Stacking scrub effects
      mm.add("(min-width: 640px) and (min-height: 640px)", () => {
        const cards = cardElementsRef.current.filter(Boolean) as HTMLElement[];
        if (cards.length === 0) return;

        // 1. Monitor section in-view state for progress indicator dots
        ScrollTrigger.create({
          trigger: stackWrapperRef.current,
          start: "top 70%",
          end: "bottom 30%",
          onToggle: (self) => {
            setIsSectionInView(self.isActive);
          },
        });

        // 2. Track which card is currently active as user scrolls
        cards.forEach((card, idx) => {
          ScrollTrigger.create({
            trigger: card,
            start: "top 35%",
            end: "bottom 35%",
            onToggle: (self) => {
              if (self.isActive) {
                setActiveCardIndex(idx);
              }
            },
          });
        });

        // 3. Stacking scrubbed scale-down & dimming for covered cards
        cards.forEach((card, idx) => {
          // Last card does NOT scale down
          if (idx === cards.length - 1) return;

          const nextCard = cards[idx + 1];
          if (!nextCard) return;

          const overlay = card.querySelector<HTMLElement>("[data-dim-overlay]");
          const img = card.querySelector<HTMLElement>("[data-card-img]");

          // Scale down from 1 to 0.94 as next card stacks on top
          gsap.fromTo(
            card,
            { scale: 1 },
            {
              scale: 0.94,
              ease: "none",
              scrollTrigger: {
                trigger: nextCard,
                start: "top 80%",
                end: "top 160px",
                scrub: true,
              },
            }
          );

          // Dimming overlay
          if (overlay) {
            gsap.fromTo(
              overlay,
              { opacity: 0 },
              {
                opacity: 0.3,
                ease: "none",
                scrollTrigger: {
                  trigger: nextCard,
                  start: "top 80%",
                  end: "top 160px",
                  scrub: true,
                },
              }
            );
          }

          // Subtle parallax shift up on image inside covered card
          if (img) {
            gsap.fromTo(
              img,
              { yPercent: 0 },
              {
                yPercent: -8,
                ease: "none",
                scrollTrigger: {
                  trigger: nextCard,
                  start: "top 80%",
                  end: "top 160px",
                  scrub: true,
                },
              }
            );
          }
        });

        // 4. Subtle rotation settling on incoming card
        cards.forEach((card, idx) => {
          if (idx === 0) return; // First card enters normally

          gsap.fromTo(
            card,
            { rotate: idx % 2 === 0 ? 1.5 : -1.5 },
            {
              rotate: 0,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top bottom",
                end: "top 180px",
                scrub: true,
              },
            }
          );
        });

        // 5. Quick roll tween for huge card number when reaching sticky threshold
        cards.forEach((card) => {
          const numEl = card.querySelector<HTMLElement>("[data-card-number]");
          if (numEl) {
            gsap.fromTo(
              numEl,
              { yPercent: 50, opacity: 0 },
              {
                yPercent: 0,
                opacity: 1,
                duration: 0.55,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: card,
                  start: "top 45%",
                  once: true,
                },
              }
            );
          }
        });
      });

      return () => {
        mm.revert();
      };
    },
    {
      scope: sectionRef,
      dependencies: [prefersReducedMotion, isStickyLayout, content.cards.length],
    }
  );

  // Scroll directly to a specific card when clicking a progress dot
  const scrollToCard = (index: number) => {
    const targetCard = cardElementsRef.current[index];
    if (!targetCard) return;

    if (typeof window !== "undefined") {
      const lenis = (
        window as unknown as {
          __lenis?: {
            scrollTo: (
              target: HTMLElement | string,
              options?: { offset?: number; duration?: number }
            ) => void;
          };
        }
      ).__lenis;

      const offset = -(80 + 24 + index * 20);

      if (lenis) {
        lenis.scrollTo(targetCard, { offset, duration: 1.2 });
      } else {
        const topPos =
          targetCard.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({ top: topPos, behavior: "smooth" });
      }
    }
  };

  return (
    <Section
      id="what-we-check"
      variant="surface"
      ref={sectionRef}
      className="relative py-20 md:py-28"
    >
      <Container>
        {/* Top Header Block: Eyebrow + SplitHeading (left), Intro + CTA (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end mb-16 sm:mb-20 pb-10 border-b border-line/60">
          <div className="lg:col-span-7 space-y-4">
            <Eyebrow variant="dot" color="brand">
              {content.eyebrow}
            </Eyebrow>
            <SplitHeading
              as="h2"
              className="text-display-lg font-display text-ink leading-tight"
            >
              {content.title}
            </SplitHeading>
          </div>

          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-5">
            <p className="text-body text-ink-muted leading-relaxed max-w-md lg:text-right font-body">
              {content.intro}
            </p>
            <Button href={content.cta.href} variant="primary" size="md">
              {content.cta.label}
            </Button>
          </div>
        </div>

        {/* ================================================================ */}
        {/* CARDS STACK AREA                                                 */}
        {/* ================================================================ */}
        <div
          ref={stackWrapperRef}
          className="relative space-y-6 sm:space-y-8 lg:space-y-12 pb-24 sm:pb-32 lg:pb-40"
        >
          {content.cards.map((card: CheckupCard, index: number) => {
            const tone = toneStyles[card.tone];

            // Sticky top calculation:
            // Desktop: nav height (80px) + 24px + index * 20px
            // Mobile: nav height (80px) + 12px + index * 10px
            const stickyStyle: React.CSSProperties =
              isStickyLayout && !prefersReducedMotion
                ? {
                    position: "sticky",
                    top: `calc(var(--nav-h, 5rem) + 20px + ${index * 20}px)`,
                    zIndex: 10 + index,
                  }
                : {
                    position: "static",
                  };

            return (
              <article
                key={card.id}
                ref={(el) => {
                  cardElementsRef.current[index] = el;
                }}
                id={`checkup-card-${card.id}`}
                style={stickyStyle}
                className={`relative w-full rounded-3xl overflow-hidden shadow-card p-6 sm:p-8 lg:p-12 min-h-[auto] lg:min-h-[70svh] flex flex-col justify-between transition-shadow will-change-transform ${tone.card}`}
              >
                {/* Scrubbed Dimming Overlay for Covered Cards */}
                <div
                  data-dim-overlay
                  className={`pointer-events-none absolute inset-0 opacity-0 z-20 transition-opacity ${tone.overlay}`}
                  aria-hidden="true"
                />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-1">
                  {/* Left Column: Number, Title, Summary, Checklist, Footer */}
                  <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-6 sm:space-y-8">
                    <div>
                      {/* Huge Outlined Number */}
                      <span
                        data-card-number
                        className={`font-display text-6xl sm:text-7xl lg:text-8xl font-bold leading-none select-none tracking-tight block mb-3 ${tone.number}`}
                        style={{
                          WebkitTextStroke: "1.5px currentColor",
                        }}
                        aria-hidden="true"
                      >
                        {card.number}
                      </span>

                      {/* Card Title */}
                      <h3
                        className={`font-display text-display-md text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight ${tone.title}`}
                      >
                        {card.title}
                      </h3>

                      {/* Summary */}
                      <p
                        className={`mt-4 text-sm sm:text-base leading-relaxed font-body ${tone.summary}`}
                      >
                        {card.summary}
                      </p>
                    </div>

                    {/* 2-Column Checklist */}
                    <div className="pt-2">
                      <p
                        className={`text-xs font-semibold uppercase tracking-wider mb-3.5 font-body ${tone.note}`}
                      >
                        Diagnostic Protocols
                      </p>
                      <ul
                        role="list"
                        className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3"
                      >
                        {card.checklist.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2.5 font-body text-xs sm:text-sm"
                          >
                            <span
                              className={`flex items-center justify-center w-5 h-5 rounded-full shrink-0 ${tone.checklistIconBg}`}
                              aria-hidden="true"
                            >
                              <Check
                                className={`w-3 h-3 ${tone.checklistIcon}`}
                                strokeWidth={2.5}
                              />
                            </span>
                            <span className={tone.checklistText}>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Footer Row: Duration Badge + Note */}
                    <div className="pt-6 border-t border-current/10 flex flex-wrap items-center justify-between gap-4 font-body">
                      <div className="flex items-center gap-3">
                        <Badge variant={tone.badgeVariant} size="sm">
                          {card.duration} Duration
                        </Badge>
                        <span className={`text-xs ${tone.note}`}>
                          Included in every routine checkup
                        </span>
                      </div>
                      <span
                        className={`text-xs font-semibold tracking-wider uppercase ${tone.title}`}
                      >
                        Step {card.number} of 05
                      </span>
                    </div>
                  </div>

                  {/* Right Column: SmartImage in Rounded Frame with Floating Glass Chip */}
                  <div className="lg:col-span-5 h-full">
                    <div className="relative w-full aspect-[16/10] sm:aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[420px] rounded-2xl overflow-hidden bg-black/10 border border-current/15">
                      <div
                        data-card-img
                        className="w-full h-full will-change-transform"
                      >
                        <SmartImage
                          slot={card.imageSlot}
                          ratio="4/3"
                          alt={card.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Floating Glass Chip */}
                      <div className="absolute top-4 left-4 z-10 max-w-[88%]">
                        <div
                          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-soft ${tone.chip}`}
                        >
                          <span className="truncate">{card.title}</span>
                          <span className="opacity-40">•</span>
                          <span className="shrink-0">{card.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Container>

      {/* ================================================================ */}
      {/* FLOATING PROGRESS INDICATOR (Fixed Right Edge, In-View Only)     */}
      {/* ================================================================ */}
      {isStickyLayout && !prefersReducedMotion && (
        <nav
          aria-label="Checkup steps progress"
          className={`hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-3 py-3.5 px-2.5 rounded-full bg-white/85 backdrop-blur-md border border-line shadow-card transition-all duration-300 ${
            isSectionInView
              ? "opacity-100 translate-x-0 pointer-events-auto"
              : "opacity-0 translate-x-8 pointer-events-none"
          }`}
        >
          {content.cards.map((card, idx) => {
            const isActive = idx === activeCardIndex;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => scrollToCard(idx)}
                aria-label={`Go to check ${card.number}: ${card.title}`}
                aria-current={isActive ? "step" : undefined}
                className="group relative flex items-center justify-center p-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-full"
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-3 h-3 bg-brand scale-110 shadow-xs"
                      : "w-2 h-2 bg-ink/25 group-hover:bg-brand/60"
                  }`}
                />
                {/* Tooltip on hover */}
                <span className="pointer-events-none absolute right-full mr-3.5 whitespace-nowrap rounded-md bg-brand-dark px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 font-body">
                  {card.number}. {card.title}
                </span>
              </button>
            );
          })}
        </nav>
      )}
    </Section>
  );
};

export default CheckupStack;
