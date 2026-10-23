"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, EASE, useGSAP } from "@/lib/gsap";
import { Container } from "@/components/ui";
import { SplitHeading, useReducedMotion } from "@/components/animations";
import { scopeContent, ScopeContent, ScopeItem } from "@/data/home";

export interface ScopeOfCareProps {
  content?: ScopeContent;
}

// Custom crisp line icons matching the user's design screenshot
function ToothIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M7 21c-1.6 0-3.5-1.2-3.5-3.5 0-3 1.2-5.5 2.2-8.5C6.7 6 8 3.5 12 3.5s5.3 2.5 6.3 5.5c1 3 2.2 5.5 2.2 8.5 0 2.3-1.9 3.5-3.5 3.5-1.7 0-2.4-1.2-3.4-2.2-.9-.9-1.3-1.3-1.6-1.3s-.7.4-1.6 1.3C9.4 19.8 8.7 21 7 21z" />
    </svg>
  );
}

function HeartPulseIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l1.5-3 2 6 1.5-3h4.28" />
    </svg>
  );
}

function DnaIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m8 8 8 8" />
      <path d="m9 5 6 6" />
      <path d="m5 9 6 6" />
      <path d="m15 19 4-4" />
      <path d="m2 10 3-3" />
      <path d="m2 14 3 3" />
      <path d="m10 2 4 4" />
      <path d="m10 22 4-4" />
    </svg>
  );
}

function DropletIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-6l-4-4.5L8 9c-2 2.1-3 4-3 6a7 7 0 0 0 7 7z" />
    </svg>
  );
}

function renderScopeIcon(iconType?: string) {
  switch (iconType) {
    case "tooth":
      return <ToothIcon className="w-5 h-5 text-ink shrink-0" />;
    case "heart-pulse":
      return <HeartPulseIcon className="w-5 h-5 text-ink shrink-0" />;
    case "dna":
      return <DnaIcon className="w-5 h-5 text-ink shrink-0" />;
    case "droplet":
      return <DropletIcon className="w-5 h-5 text-ink shrink-0" />;
    default:
      return <ToothIcon className="w-5 h-5 text-ink shrink-0" />;
  }
}

export function ScopeOfCare({ content = scopeContent }: ScopeOfCareProps) {
  const items: ScopeItem[] = content?.items || [];
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  // Refs
  const sectionRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const leftColRef = useRef<HTMLDivElement | null>(null);
  const rightColRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // -------------------------------------------------------------
  // GSAP Entrance Animation & Desktop Pinned ScrollTrigger
  // -------------------------------------------------------------
  useGSAP(
    () => {
      if (typeof document !== "undefined" && document.fonts) {
        document.fonts.ready.then(() => {
          ScrollTrigger.refresh();
        });
      }

      if (prefersReducedMotion) return;

      const mm = gsap.matchMedia();

      // Entrance animation on all screen sizes
      mm.add("(min-width: 0px)", () => {
        if (leftColRef.current && rightColRef.current) {
          gsap.fromTo(
            cardRefs.current.filter(Boolean),
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              stagger: 0.09,
              ease: EASE.smooth,
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 78%",
                toggleActions: "play none none none",
                once: true,
              },
            }
          );

          gsap.fromTo(
            rightColRef.current,
            { opacity: 0, scale: 0.97, y: 30 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.85,
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
      });

      // Desktop Pinned ScrollTrigger: starts 15px above the headline
      mm.add("(min-width: 1024px)", () => {
        const triggerTarget = headerRef.current || sectionRef.current;
        if (!sectionRef.current || !triggerTarget || items.length <= 1) return;

        let lastIndex = 0;

        const pinTrigger = ScrollTrigger.create({
          trigger: triggerTarget,
          pin: sectionRef.current,
          start: "top 15px",
          end: `+=${items.length * 450}`,
          pinSpacing: true,
          scrub: 0.8,
          anticipatePin: 1,
          onUpdate: (self) => {
            const progress = self.progress;
            const newIndex = Math.min(
              items.length - 1,
              Math.floor(progress * items.length)
            );
            if (newIndex !== lastIndex) {
              lastIndex = newIndex;
              setActiveIndex(newIndex);
            }
          },
        });

        return () => {
          pinTrigger.kill();
        };
      });

      return () => {
        mm.revert();
      };
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion, items.length] }
  );

  // -------------------------------------------------------------
  // Selection handler
  // -------------------------------------------------------------
  const handleSelect = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  return (
    <section
      id="scope"
      ref={sectionRef}
      className="relative w-full bg-white text-ink overflow-hidden pt-4 pb-12 sm:pt-6 sm:pb-16 lg:pt-6 lg:pb-16"
      aria-label="The Scope of Our Care"
    >
      <Container>
        {/* Header Title & Subtext */}
        <div ref={headerRef} className="mb-8 sm:mb-10 max-w-2xl">
          {content.eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-wider text-brand font-body mb-2.5">
              {content.eyebrow}
            </p>
          )}
          <SplitHeading
            as="h2"
            type="lines"
            mask
            start="top 85%"
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-bold tracking-tight text-ink leading-[1.12]"
          >
            {content.title}
          </SplitHeading>
          {content.intro && (
            <p className="mt-3.5 text-base sm:text-lg text-ink-muted leading-relaxed font-body">
              {content.intro}
            </p>
          )}
        </div>

        {/* Two-Column Grid: Left Accordion Cards, Right Image Frame */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start"
        >
          {/* Left Column: Interactive Cards (~42% width) */}
          <div
            ref={leftColRef}
            className="lg:col-span-5 flex flex-col gap-3 sm:gap-3.5"
            role="tablist"
            aria-label="Scope of care categories"
          >
            {items.map((item, idx) => {
              const isActive = idx === activeIndex;

              return (
                <button
                  key={item.id}
                  ref={(el) => {
                    cardRefs.current[idx] = el;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`scope-panel-${item.id}`}
                  onClick={() => handleSelect(idx)}
                  className={`group w-full text-left rounded-2xl transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand cursor-pointer border ${
                    isActive
                      ? "bg-[#F2F4F7] border-[#E5E7EB] p-5 sm:p-6 shadow-2xs"
                      : "bg-[#F2F4F7]/80 hover:bg-[#EAECEF] border-transparent px-5 py-4 sm:py-4.5"
                  }`}
                >
                  {/* Card Header: Icon + Title */}
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 transition-transform duration-200 group-hover:scale-105">
                      {renderScopeIcon(item.icon)}
                    </div>
                    <span className="font-sans font-semibold text-[15px] sm:text-base text-[#1D2939] tracking-tight">
                      {item.title}
                    </span>
                  </div>

                  {/* Expanded Body Content */}
                  <div
                    id={`scope-panel-${item.id}`}
                    className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${
                      isActive
                        ? "grid-rows-[1fr] opacity-100 mt-3 sm:mt-3.5"
                        : "grid-rows-[0fr] opacity-0 mt-0 pointer-events-none"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-xs sm:text-[13.5px] text-[#475467] leading-relaxed font-sans font-normal">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Responsive Image Frame (~58% width) */}
          <div
            ref={rightColRef}
            className="lg:col-span-7 relative rounded-[26px] sm:rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-[4/3] lg:aspect-auto lg:h-[490px] xl:h-[510px] w-full shadow-sm bg-neutral-100"
          >
            {items.map((item, idx) => {
              const isCurrent = idx === activeIndex;
              const imgSrc = item.imageSrc || `/images/scope/scope-diagnostic.jpg`;

              return (
                <div
                  key={item.id}
                  className={`absolute inset-0 transition-opacity duration-600 ease-in-out ${
                    isCurrent ? "opacity-100 z-1" : "opacity-0 z-0 pointer-events-none"
                  }`}
                  aria-hidden={!isCurrent}
                >
                  <Image
                    src={imgSrc}
                    alt={item.title}
                    fill
                    priority={idx === 0}
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="object-cover"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default ScopeOfCare;
