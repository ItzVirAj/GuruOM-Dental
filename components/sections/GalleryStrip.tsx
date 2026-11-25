"use client";

import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import { Container, SmartImage } from "@/components/ui";
import { Reveal, Marquee } from "@/components/animations";
import { galleryContent, GalleryItem } from "@/data/home";

export interface GalleryStripProps {
  content?: typeof galleryContent;
}

export function GalleryStrip({ content = galleryContent }: GalleryStripProps) {
  const items = content.items;

  if (!items.length) return null;

  const cards = items.map((item: GalleryItem) => (
    <article key={item.id} className="relative shrink-0 aspect-[4/5] w-[260px] sm:w-[280px] lg:w-[320px] overflow-hidden rounded-2xl shadow-soft bg-surface-alt">
      {item.publicId ? (
        <CloudinaryImage src={item.publicId} alt={item.alt ?? item.title} fill sizes="(max-width: 640px) 260px, 320px" className="object-cover" />
      ) : (
        <SmartImage slot={item.imageSlot} label={item.title} aspect="4/5" className="h-full" />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 to-transparent px-4 pb-4 pt-12">
        <h3 className="font-semibold text-white text-lg break-words">{item.title}</h3>
        {item.label && <span className="mt-1 inline-block rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-ink break-all">{item.label}</span>}
      </div>
    </article>
  ));

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

      {/* Section Intro: Heading, Subheading & Description revealed with <Reveal> */}
      <Container className="text-center mb-12 sm:mb-16">
        <Reveal variant="up">
          <h2
            id="gallery-strip-heading"
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-[1.15]"
          >
            {content.eyebrow}
          </h2>
        </Reveal>

        <Reveal variant="up" delay={0.1}>
          <p className="font-aileron text-lg sm:text-xl lg:text-2xl font-semibold text-brand leading-snug mt-3">
            {content.title}
          </p>
        </Reveal>

        <Reveal variant="up" delay={0.2}>
          <p className="text-ink-muted text-sm sm:text-base max-w-xl mx-auto mt-2 leading-relaxed">
            {content.subtitle}
          </p>
        </Reveal>
      </Container>

      {cards.length < 4 ? (
        <div className="flex flex-wrap justify-center gap-6 px-4">{cards}</div>
      ) : (
        <div className="flex flex-col gap-6 sm:gap-8 w-full overflow-hidden">
          <Marquee speed={40} direction="left" slowOnHover scrollVelocityBoost fadeEdges gap={24} className="py-3">
            {cards}
          </Marquee>
          <Marquee speed={55} direction="right" slowOnHover scrollVelocityBoost fadeEdges gap={24} className="py-3">
            {[...cards].reverse()}
          </Marquee>
        </div>
      )}
    </section>
  );
}

export default GalleryStrip;
