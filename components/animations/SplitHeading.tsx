"use client";

import React, { useRef } from "react";
import { gsap, SplitText, EASE, useGSAP } from "@/lib/gsap";

export type SplitType = "lines" | "words" | "chars";

export interface SplitHeadingProps {
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  type?: SplitType;
  mask?: boolean;
  stagger?: number;
  delay?: number;
  trigger?: "load" | "scroll";
  start?: string;
  once?: boolean;
  className?: string;
  children: string;
}

export const SplitHeading: React.FC<SplitHeadingProps> = ({
  as: Component = "h2",
  type = "lines",
  mask = true,
  stagger,
  delay = 0,
  trigger = "scroll",
  start = "top 85%",
  once = true,
  className = "",
  children,
}) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);

  useGSAP(
    () => {
      if (!textRef.current || !containerRef.current) return;

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Ensure container is unhidden from anti-FOUC
      gsap.set(containerRef.current, { visibility: "visible", opacity: 1 });

      if (prefersReducedMotion) {
        gsap.to(containerRef.current, {
          opacity: 1,
          duration: 0.3,
          delay,
        });
        return;
      }

      // Configure split types. When lines + mask are used, splitting into lines and words
      // allows words to slide up from behind the line's overflow-hidden bounding box.
      const splitTypes =
        type === "chars"
          ? "lines,words,chars"
          : mask && type === "lines"
          ? "lines,words"
          : type;

      const linesClass = mask ? "overflow-hidden leading-tight" : "";

      const split = new SplitText(textRef.current, {
        type: splitTypes,
        linesClass,
      });

      const targets =
        type === "chars"
          ? split.chars
          : type === "words" || (mask && type === "lines")
          ? split.words
          : split.lines;

      const defaultStagger =
        stagger !== undefined
          ? stagger
          : type === "chars"
          ? 0.015
          : type === "words"
          ? 0.04
          : 0.06;

      const tl = gsap.timeline({
        delay,
        scrollTrigger:
          trigger === "scroll"
            ? {
                trigger: containerRef.current,
                start,
                toggleActions: once ? "play none none none" : "play reverse play reverse",
              }
            : undefined,
      });

      tl.from(targets, {
        yPercent: mask ? 115 : 40,
        opacity: mask ? 1 : 0,
        rotateX: mask ? -10 : 0,
        stagger: defaultStagger,
        duration: 0.85,
        ease: EASE.smooth,
      });

      // Recalculate on webfont loading
      const handleFontsReady = () => {
        if (split) {
          split.revert();
          split.split({
            type: splitTypes,
            linesClass,
          });
        }
      };

      if (document.fonts?.ready) {
        document.fonts.ready.then(handleFontsReady);
      }

      return () => {
        split.revert();
      };
    },
    { scope: containerRef, dependencies: [type, mask, stagger, delay, trigger, start, once, children] }
  );

  return (
    <Component
      ref={containerRef as React.Ref<never>}
      data-anim="split-heading"
      aria-label={children}
      className={`relative inline-block ${className}`}
    >
      <span ref={textRef} aria-hidden="true" className="inline-block">
        {children}
      </span>
    </Component>
  );
};

export default SplitHeading;
