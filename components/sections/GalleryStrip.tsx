"use client";

import { useMemo } from "react";
import { Container, Eyebrow, SmartImage } from "@/components/ui";
import { Reveal, Marquee } from "@/components/animations";
import { galleryContent, GalleryItem } from "@/data/home";

export interface GalleryStripProps {
  content?: typeof galleryContent;
}

export function GalleryStrip({ content = galleryContent }: GalleryStripProps) {
  const items = content.items;

  // Row 2 uses the items reversed so the two rows have visual variety
  const reversedItems = useMemo(() => [...items].reverse(), [items]);

  return (
    <section
      className="relative w-full bg-surface overflow-hidden pt-0 pb-24 sm:pb-32 lg:pb-36"
      aria-labelledby="gallery-strip-heading"
    >
      {/* Soft curved organic divider between brand-dark Stats and surface Gallery */}
      <div className="w-full overflow-hidden leading-none -mt-[1px] mb-16 sm:mb-20" aria-hidden="true">
        <svg
          className="relative block w-full h-8 sm:h-12 lg:h-16 text-brand-dark fill-current"
          viewBox="0 0 1440 64"
          preserveAspectRatio="none"
        >
          <path d="M0,0 C480,64 960,64 1440,0 L1440,0 L0,0 Z" />
        </svg>
      </div>

      {/* Section Intro: Centered Eyebrow & Headline revealed with <Reveal> */}
      <Container className="text-center mb-12 sm:mb-16">
        <Reveal variant="up">
          <Eyebrow color="brand" className="mb-3 justify-center">
            {content.eyebrow}
          </Eyebrow>
        </Reveal>

        <Reveal variant="up" delay={0.1}>
          <h2
            id="gallery-strip-heading"
            className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-ink"
          >
            {content.title}
          </h2>
        </Reveal>

        <Reveal variant="up" delay={0.2}>
          <p className="text-ink-muted text-sm sm:text-base max-w-xl mx-auto mt-3 leading-relaxed">
            {content.subtitle}
          </p>
        </Reveal>
      </Container>

      {/* Two Marquee Rows Container */}
      <div className="flex flex-col gap-6 sm:gap-8 w-full overflow-hidden">
        {/* Row 1: moves Left at 40 px/s */}
        <Marquee
          speed={40}
          direction="left"
          slowOnHover={true}
          hoverSlowFactor={0.2}
          scrollVelocityBoost={true}
          pauseWhenHidden={true}
          fadeEdges={true}
          gap={24}
          className="py-3"
        >
          {items.map((item: GalleryItem) => (
            <div
              key={`row1-${item.id}`}
              className="group/card relative shrink-0 w-[260px] sm:w-[280px] lg:w-[320px] rounded-2xl overflow-hidden shadow-soft transition-all duration-300 hover:scale-[1.04] hover:-translate-y-2 hover:shadow-card cursor-pointer will-change-transform bg-surface-alt"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
                <SmartImage
                  slot={item.imageSlot}
                  aspect="4/5"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-105"
                  sizes="(max-width: 640px) 260px, (max-width: 1024px) 280px, 320px"
                />
              </div>

              {/* Pill label chip overlaid at bottom-left */}
              <div className="absolute bottom-3.5 left-3.5 z-10 pointer-events-none">
                <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/60 shadow-xs text-[11px] font-bold uppercase tracking-wider text-ink transition-colors group-hover/card:bg-brand group-hover/card:text-white">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </Marquee>

        {/* Row 2: moves Right at 55 px/s in reversed order */}
        <Marquee
          speed={55}
          direction="right"
          slowOnHover={true}
          hoverSlowFactor={0.2}
          scrollVelocityBoost={true}
          pauseWhenHidden={true}
          fadeEdges={true}
          gap={24}
          className="py-3"
        >
          {reversedItems.map((item: GalleryItem) => (
            <div
              key={`row2-${item.id}`}
              className="group/card relative shrink-0 w-[260px] sm:w-[280px] lg:w-[320px] rounded-2xl overflow-hidden shadow-soft transition-all duration-300 hover:scale-[1.04] hover:-translate-y-2 hover:shadow-card cursor-pointer will-change-transform bg-surface-alt"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
                <SmartImage
                  slot={item.imageSlot}
                  aspect="4/5"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-105"
                  sizes="(max-width: 640px) 260px, (max-width: 1024px) 280px, 320px"
                />
              </div>

              {/* Pill label chip overlaid at bottom-left */}
              <div className="absolute bottom-3.5 left-3.5 z-10 pointer-events-none">
                <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/60 shadow-xs text-[11px] font-bold uppercase tracking-wider text-ink transition-colors group-hover/card:bg-brand group-hover/card:text-white">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}

export default GalleryStrip;
