"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Pause, Play, X } from "lucide-react";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";
import { SmartImage } from "@/components/ui";
import { galleryContent, GalleryItem } from "@/data/home";

export interface GalleryStripProps {
  content?: typeof galleryContent;
  headingId?: string;
  tone?: "surface" | "alt";
}

const SLIDER_MIN_COUNT = 5; // Desktop slider activates strictly when items.length > 5
const AUTO_SCROLL_PX_PER_SEC = 48;
const MOBILE_MEDIA_QUERY = "(max-width: 767px)";

function subscribeMobile(callback: () => void) {
  const mql = window.matchMedia(MOBILE_MEDIA_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

function getServerMobileSnapshot() {
  return false;
}

function PlateImage({
  item,
  sizes,
  className = "object-cover",
}: {
  item: GalleryItem;
  sizes: string;
  className?: string;
}) {
  if (item.publicId) {
    return (
      <CloudinaryImage
        src={item.publicId}
        alt={item.alt ?? item.title}
        fill
        sizes={sizes}
        className={className}
      />
    );
  }
  return <SmartImage slot={item.imageSlot} label={item.title} aspect="4/5" className="h-full" />;
}

function PlateCard({
  item,
  sizes,
  tabIndex,
  onSelect,
}: {
  item: GalleryItem;
  sizes: string;
  tabIndex?: number;
  onSelect: () => void;
}) {
  return (
    <article className="clinic-plate">
      <button
        type="button"
        className="clinic-plate-trigger"
        tabIndex={tabIndex}
        onClick={onSelect}
        aria-label={`Inspect ${item.title}`}
      >
        <div className="clinic-plate-frame">
          <PlateImage item={item} sizes={sizes} />
        </div>
        <div className="clinic-plate-meta">
          <h3 className="clinic-plate-name">{item.title}</h3>
          {item.label && <span className="clinic-plate-tag">{item.label}</span>}
        </div>
      </button>
    </article>
  );
}

export function GalleryStrip({
  content = galleryContent,
  headingId = "gallery-strip-heading",
  tone = "surface",
}: GalleryStripProps) {
  const items = content.items;
  const isMobile = useSyncExternalStore(subscribeMobile, getMobileSnapshot, getServerMobileSnapshot);
  const isSlider = items.length > SLIDER_MIN_COUNT || (isMobile && items.length > 1);
  // Ensure even a 2-card gallery on mobile fills wide enough before wrapping cleanly
  const sliderItems = isSlider && items.length < 3 ? [...items, ...items] : items;

  const sectionRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const setARef = useRef<HTMLDivElement>(null);
  const setBRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [inView, setInView] = useState(true);

  const prefersReducedMotion = useReducedMotion() ?? false;
  const x = useMotionValue(0);
  const loopWidthRef = useRef(0);
  const velocityRef = useRef(-AUTO_SCROLL_PX_PER_SEC);
  const stepRemainingRef = useRef(0);

  // Measure the exact pixel distance between Set A and Set B for seamless wrapping
  useEffect(() => {
    if (!isSlider || prefersReducedMotion) return;
    const setA = setARef.current;
    const setB = setBRef.current;
    if (!setA || !setB) return;

    const measure = () => {
      loopWidthRef.current = setB.offsetLeft - setA.offsetLeft;
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(setA);
    observer.observe(setB);
    return () => observer.disconnect();
  }, [isSlider, prefersReducedMotion, items.length]);

  // Pause animation automatically while section is scrolled out of view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !isSlider) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? true),
      { threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isSlider]);

  useAnimationFrame((_, delta) => {
    if (!isSlider || prefersReducedMotion) return;
    const loopWidth = loopWidthRef.current;
    if (loopWidth <= 0) return;

    const dt = Math.min(delta, 50) / 1000;
    const shouldPause = userPaused || hovered || focusWithin || activeIndex !== null || !inView;
    const targetVelocity = shouldPause ? 0 : -AUTO_SCROLL_PX_PER_SEC;

    // Ease current drift velocity smoothly so hover/pause stops cleanly
    const blend = 1 - Math.exp(-dt * 8);
    velocityRef.current += (targetVelocity - velocityRef.current) * blend;

    let move = velocityRef.current * dt;
    if (Math.abs(stepRemainingRef.current) > 0.25) {
      const stepSlice = stepRemainingRef.current * (1 - Math.exp(-dt * 12));
      stepRemainingRef.current -= stepSlice;
      move += stepSlice;
    } else {
      stepRemainingRef.current = 0;
    }

    if (Math.abs(move) < 0.001) return;

    let next = x.get() + move;
    while (next <= -loopWidth) next += loopWidth;
    while (next > 0) next -= loopWidth;
    x.set(next);
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (activeIndex !== null && !dialog.open) {
      dialog.showModal();
    } else if (activeIndex === null && dialog.open) {
      dialog.close();
    }
  }, [activeIndex]);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setActiveIndex((prev) => (prev === null ? null : (prev + 1) % items.length));
      } else if (event.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev === null ? null : (prev - 1 + items.length) % items.length));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, items.length]);

  if (!items.length) return null;

  function stepSlider(direction: -1 | 1) {
    if (prefersReducedMotion && sliderRef.current) {
      sliderRef.current.scrollBy({
        left: direction * Math.max(280, Math.round(sliderRef.current.clientWidth * 0.65)),
        behavior: "auto",
      });
      return;
    }
    const cardStep = setARef.current?.firstElementChild
      ? Math.round((setARef.current.firstElementChild as HTMLElement).offsetWidth + 28)
      : 360;
    stepRemainingRef.current += -direction * cardStep;
  }

  const activeItem = activeIndex !== null ? items[activeIndex] ?? null : null;
  const gridSizes = "(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 24vw";
  const sliderSizes = "(max-width: 640px) 260px, 355px";

  return (
    <section
      ref={sectionRef}
      className="clinic-gallery"
      data-tone={tone}
      aria-labelledby={headingId}
    >
      <div className="clinic-gallery-head">
        <div>
          <p className="clinic-gallery-kicker">{content.eyebrow}</p>
          <h2 id={headingId} className="clinic-gallery-title">
            {content.title}
          </h2>
        </div>

        <div className="clinic-gallery-aside">
          <p className="clinic-gallery-summary">{content.subtitle}</p>
          {isSlider && (
            <div className="clinic-gallery-controls">
              <button
                type="button"
                className="clinic-gallery-nav-btn"
                aria-label={`Previous ${content.eyebrow} photo`}
                onClick={() => stepSlider(-1)}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="clinic-gallery-nav-btn"
                aria-label={userPaused ? `Play ${content.eyebrow} slider` : `Pause ${content.eyebrow} slider`}
                aria-pressed={userPaused}
                onClick={() => setUserPaused((p) => !p)}
              >
                {userPaused ? (
                  <Play className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Pause className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                className="clinic-gallery-nav-btn"
                aria-label={`Next ${content.eyebrow} photo`}
                onClick={() => stepSlider(1)}
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="clinic-gallery-count">
                {items.length} photographs
              </span>
            </div>
          )}
        </div>
      </div>

      {isSlider ? (
        <div
          ref={sliderRef}
          className="clinic-gallery-slider"
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onFocusCapture={() => setFocusWithin(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setFocusWithin(false);
            }
          }}
        >
          <motion.div className="clinic-gallery-track" style={prefersReducedMotion ? undefined : { x }}>
            <div ref={setARef} className="clinic-gallery-set">
              {sliderItems.map((item, index) => (
                <PlateCard
                  key={`${item.id}-a-${index}`}
                  item={item}
                  sizes={sliderSizes}
                  tabIndex={index >= items.length ? -1 : undefined}
                  onSelect={() => setActiveIndex(index % items.length)}
                />
              ))}
            </div>
            <div ref={setBRef} className="clinic-gallery-set" aria-hidden="true">
              {sliderItems.map((item, index) => (
                <PlateCard
                  key={`${item.id}-b-${index}`}
                  item={item}
                  sizes={sliderSizes}
                  tabIndex={-1}
                  onSelect={() => setActiveIndex(index % items.length)}
                />
              ))}
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="clinic-gallery-grid">
          {items.map((item, index) => (
            <PlateCard
              key={item.id}
              item={item}
              sizes={gridSizes}
              onSelect={() => setActiveIndex(index)}
            />
          ))}
        </div>
      )}

      <dialog
        ref={dialogRef}
        className="clinic-gallery-dialog"
        aria-label={activeItem ? activeItem.title : content.title}
        onClose={() => setActiveIndex(null)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setActiveIndex(null);
        }}
      >
        {activeItem && (
          <div className="clinic-gallery-dialog-inner">
            <div className="clinic-gallery-dialog-media">
              <PlateImage
                item={activeItem}
                sizes="(max-width: 768px) 92vw, 896px"
                className="object-contain"
              />
            </div>
            <div className="clinic-gallery-dialog-bar">
              <div>
                <h3 className="clinic-gallery-dialog-title">{activeItem.title}</h3>
                {activeItem.label && (
                  <p className="clinic-gallery-dialog-tag">{activeItem.label}</p>
                )}
              </div>
              <div className="clinic-gallery-dialog-actions">
                {items.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="clinic-gallery-dialog-btn"
                      aria-label="Previous photo"
                      onClick={() =>
                        setActiveIndex((prev) =>
                          prev === null ? 0 : (prev - 1 + items.length) % items.length,
                        )
                      }
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="clinic-gallery-dialog-btn"
                      aria-label="Next photo"
                      onClick={() =>
                        setActiveIndex((prev) =>
                          prev === null ? 0 : (prev + 1) % items.length,
                        )
                      }
                    >
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="clinic-gallery-dialog-btn"
                  aria-label="Close lightbox"
                  onClick={() => setActiveIndex(null)}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}

export default GalleryStrip;
