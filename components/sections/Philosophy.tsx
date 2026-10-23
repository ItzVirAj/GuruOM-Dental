"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, EASE, useGSAP } from "@/lib/gsap";
import { Container } from "@/components/ui";
import { SplitHeading, useReducedMotion } from "@/components/animations";
import { philosophyContent, PhilosophyContent, PhilosophySlide } from "@/data/home";
import { plannedImages } from "@/data/images";

const SLIDE_DURATION = 5.5; // seconds per slide

export interface PhilosophyProps {
  content?: PhilosophyContent;
}

export function Philosophy({ content }: PhilosophyProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(!prefersReducedMotion);
  const isHoveredRef = useRef(false);

  // Fallback safe data
  const contentData: PhilosophyContent = content || philosophyContent;
  const slides: PhilosophySlide[] = contentData?.slides || [];
  const totalSlides = slides.length;

  // DOM Refs
  const sectionRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const leftCardRef = useRef<HTMLDivElement | null>(null);
  const rightCardRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const textRef = useRef<HTMLParagraphElement | null>(null);
  const dashRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timerTweenRef = useRef<gsap.core.Tween | null>(null);

  // Active slide data
  const currentSlide = slides[activeIndex] || slides[0];

  // Resolve slide image (defaults to philosophy1 if empty)
  const getSlideImage = useCallback((slide: PhilosophySlide | undefined) => {
    if (!slide) return "/images/philosophy-tools.jpg";
    const slot = slide.imageSlot ? plannedImages[slide.imageSlot] : undefined;
    return slot?.src && slot.src.trim() !== "" ? slot.src : "/images/philosophy-tools.jpg";
  }, []);

  // -------------------------------------------------------------
  // GSAP: Initial Entrance Animations on Scroll
  // -------------------------------------------------------------
  useGSAP(
    () => {
      // Refresh ScrollTrigger when fonts are ready
      if (typeof document !== "undefined" && document.fonts) {
        document.fonts.ready.then(() => {
          ScrollTrigger.refresh();
        });
      }

      if (prefersReducedMotion) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 0px)", () => {
        // Entrance animation for the two cards
        if (leftCardRef.current && rightCardRef.current) {
          gsap.fromTo(
            [leftCardRef.current, rightCardRef.current],
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              stagger: 0.15,
              ease: EASE.smooth,
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 78%",
                toggleActions: "play none none none",
                once: true,
              },
            }
          );
        }

        // Viewport-based auto-play pause/resume to save CPU/battery
        if (sectionRef.current) {
          ScrollTrigger.create({
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            onLeave: () => {
              if (timerTweenRef.current && timerTweenRef.current.isActive()) {
                timerTweenRef.current.pause();
              }
            },
            onLeaveBack: () => {
              if (timerTweenRef.current && timerTweenRef.current.isActive()) {
                timerTweenRef.current.pause();
              }
            },
            onEnter: () => {
              if (isPlaying && !isHoveredRef.current && timerTweenRef.current) {
                timerTweenRef.current.resume();
              }
            },
            onEnterBack: () => {
              if (isPlaying && !isHoveredRef.current && timerTweenRef.current) {
                timerTweenRef.current.resume();
              }
            },
          });
        }
      });

      return () => {
        mm.revert();
      };
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion, isPlaying] }
  );

  // -------------------------------------------------------------
  // Advance to Next Slide
  // -------------------------------------------------------------
  const goToNextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  // -------------------------------------------------------------
  // GSAP: Slide Progress Bar & Auto-Advance Timeline
  // -------------------------------------------------------------
  useEffect(() => {
    if (totalSlides <= 1) return;

    // Kill any existing timer tween
    if (timerTweenRef.current) {
      timerTweenRef.current.kill();
      timerTweenRef.current = null;
    }

    // Reset all dash indicators
    dashRefs.current.forEach((dash, idx) => {
      if (!dash) return;
      if (idx < activeIndex) {
        gsap.set(dash, { scaleX: 1 });
      } else if (idx > activeIndex) {
        gsap.set(dash, { scaleX: 0 });
      } else {
        gsap.set(dash, { scaleX: 0 });
      }
    });

    // Animate active slide text elements
    if (titleRef.current && textRef.current && !prefersReducedMotion) {
      gsap.fromTo(
        [titleRef.current, textRef.current],
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: EASE.smooth,
        }
      );
    }

    // If auto-advance is disabled (reduced motion or user paused), don't create timer
    if (prefersReducedMotion || !isPlaying) return;

    const activeDash = dashRefs.current[activeIndex];
    if (!activeDash) return;

    // Create GSAP tween for the current active dash
    const tween = gsap.fromTo(
      activeDash,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: SLIDE_DURATION,
        ease: "none",
        onComplete: () => {
          goToNextSlide();
        },
      }
    );

    // If currently hovered, start paused
    if (isHoveredRef.current) {
      tween.pause();
    }

    timerTweenRef.current = tween;

    return () => {
      tween.kill();
    };
  }, [activeIndex, isPlaying, prefersReducedMotion, totalSlides, goToNextSlide]);

  // -------------------------------------------------------------
  // Dash Navigation Click
  // -------------------------------------------------------------
  const handleSelectSlide = (index: number) => {
    if (index === activeIndex) return;
    setActiveIndex(index);
  };

  // -------------------------------------------------------------
  // Play / Pause Toggle
  // -------------------------------------------------------------
  const togglePlayPause = () => {
    setIsPlaying((prev) => {
      const nextState = !prev;
      if (timerTweenRef.current) {
        if (nextState) {
          timerTweenRef.current.resume();
        } else {
          timerTweenRef.current.pause();
        }
      }
      return nextState;
    });
  };

  // -------------------------------------------------------------
  // Hover Handlers (Pause on hover, resume on leave)
  // -------------------------------------------------------------
  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    if (isPlaying && timerTweenRef.current) {
      timerTweenRef.current.pause();
    }
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    if (isPlaying && timerTweenRef.current) {
      timerTweenRef.current.resume();
    }
  };

  return (
    <section
      id="philosophy"
      ref={sectionRef}
      className="relative w-full bg-white text-ink overflow-hidden py-16 sm:py-20 lg:py-28 border-b border-line/40"
      aria-label="Our Dental Care Philosophy"
    >
      <Container>
        {/* 1. Header: Pill Eyebrow + Split Title and Intro Paragraph */}
        <div ref={headerRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start mb-12 sm:mb-16">
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Pill Eyebrow matching the design badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F1F3F5] border border-[#E5E7EB] text-[#4B5563] text-[11px] font-mono font-semibold tracking-wider uppercase mb-5 shadow-2xs">
              <span className="text-[#374151] font-bold text-sm leading-none">+</span>
              <span>{contentData.eyebrow}</span>
            </div>

            <SplitHeading
              as="h2"
              type="lines"
              mask
              start="top 85%"
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[46px] xl:text-[52px] font-bold tracking-tight text-ink leading-[1.12]"
            >
              {contentData.title}
            </SplitHeading>
          </div>

          <div className="lg:col-span-5 lg:pt-12">
            <p className="text-base sm:text-lg text-ink-muted leading-relaxed font-sans max-w-lg">
              {contentData.intro}
            </p>
          </div>
        </div>

        {/* 2. Two-Card Visual Grid (Left: Active Pillar Slider / Right: Treatment Photo with Play/Pause) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          {/* Card 1: Diagnostic Accuracy & Philosophy Pillars (~60% width on desktop) */}
          <div
            ref={leftCardRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="lg:col-span-7 relative rounded-[28px] sm:rounded-3xl overflow-hidden min-h-[460px] sm:min-h-[500px] lg:h-[530px] flex flex-col justify-between p-6 sm:p-8 lg:p-10 select-none shadow-sm"
          >
            {/* Background Images with cross-fade */}
            {slides.map((s, idx) => {
              const isCurrent = idx === activeIndex;
              const imgSrc = getSlideImage(s);
              return (
                <div
                  key={s.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out pointer-events-none ${
                    isCurrent ? "opacity-100 z-1" : "opacity-0 z-0"
                  }`}
                  aria-hidden={!isCurrent}
                >
                  <Image
                    src={imgSrc}
                    alt={s.title}
                    fill
                    priority={idx === 0}
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                </div>
              );
            })}

            {/* Subtle dark vignette & bottom gradient to guarantee crisp white text contrast */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/35 z-2 pointer-events-none"
              aria-hidden="true"
            />

            {/* Top-Left: Pillar Title */}
            <div className="relative z-10">
              <h3
                ref={titleRef}
                className="font-display font-semibold text-xl sm:text-2xl text-white tracking-tight drop-shadow-sm"
              >
                {currentSlide.title}
              </h3>
            </div>

            {/* Bottom Section: Text Description on Left, Dash Indicators on Right */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-12">
              {/* Slide Description */}
              <div ref={textRef} className="max-w-md lg:max-w-lg">
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-sans font-normal drop-shadow-sm">
                  {currentSlide.text}
                </p>
              </div>

              {/* 4 Dash Indicators (Clickable, fills with progress) */}
              <div
                className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-end"
                role="tablist"
                aria-label="Philosophy pillars navigation"
              >
                {slides.map((s, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="tab"
                      onClick={() => handleSelectSlide(idx)}
                      aria-selected={isActive}
                      aria-label={`Slide ${idx + 1}: ${s.title}`}
                      className="group relative h-6 flex items-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full py-1"
                    >
                      {/* Outer track */}
                      <div className="w-8 sm:w-10 h-0.75 bg-white/35 rounded-full overflow-hidden relative transition-colors duration-200 group-hover:bg-white/50">
                        {/* Inner animated progress bar */}
                        <div
                          ref={(el) => {
                            dashRefs.current[idx] = el;
                          }}
                          className="h-full bg-white rounded-full w-full origin-left"
                          style={{
                            transform: isActive
                              ? "scaleX(0)"
                              : idx < activeIndex
                              ? "scaleX(1)"
                              : "scaleX(0)",
                          }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 2: Patient Treatment Photo & Pause/Play Control (~40% width on desktop) */}
          <div
            ref={rightCardRef}
            className="lg:col-span-5 relative rounded-[28px] sm:rounded-3xl overflow-hidden min-h-[400px] sm:min-h-[460px] lg:h-[530px] shadow-sm group"
          >
            <Image
              src="/images/philosophy-care.jpg"
              alt="Dental specialist providing gentle care treatment to patient"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-102"
            />

            {/* Subtle bottom vignette */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"
              aria-hidden="true"
            />

            {/* Bottom-Right: Dark Glass Pause / Play Button */}
            <button
              type="button"
              onClick={togglePlayPause}
              aria-label={
                isPlaying
                  ? "Pause philosophy auto-advancing slides"
                  : "Play philosophy auto-advancing slides"
              }
              className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 z-10 w-11 h-11 rounded-xl bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {isPlaying ? (
                // Pause Icon (||)
                <svg
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect x="6" y="5" width="3.5" height="14" rx="1" />
                  <rect x="14.5" y="5" width="3.5" height="14" rx="1" />
                </svg>
              ) : (
                // Play Icon (▶)
                <svg
                  className="w-4 h-4 fill-current translate-x-0.5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <polygon points="6,4 20,12 6,20" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Screen Reader Full Pillar Outline for Complete Accessibility */}
        <div className="sr-only">
          <h3>All Philosophy Pillars</h3>
          <ul>
            {slides.map((s) => (
              <li key={s.id}>
                <h4>{s.title}</h4>
                <p>{s.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

export default Philosophy;
