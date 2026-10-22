"use client";

import React, { useRef } from "react";
import { gsap, DUR, EASE, useGSAP } from "@/lib/gsap";

export type RevealVariant =
  | "up"
  | "down"
  | "left"
  | "right"
  | "fade"
  | "scale"
  | "blur";

export interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  distance?: number;
  stagger?: number;
  start?: string;
  once?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Reveal: React.FC<RevealProps> = ({
  as: Component = "div",
  variant = "up",
  delay = 0,
  duration = DUR.base,
  distance = 40,
  stagger,
  start = "top 85%",
  once = true,
  className = "",
  children,
  ...props
}) => {
  const containerRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isStagger = typeof stagger === "number" && containerRef.current.children.length > 0;
      const targets = isStagger
        ? Array.from(containerRef.current.children)
        : containerRef.current;

      // When staggering children, make container visible immediately so children can display
      if (isStagger) {
        gsap.set(containerRef.current, { visibility: "visible", opacity: 1 });
      }

      // Accessibility: quick fade for reduced-motion users
      if (prefersReducedMotion) {
        gsap.to(targets, {
          autoAlpha: 1,
          duration: 0.2,
          scrollTrigger: {
            trigger: containerRef.current,
            start,
            toggleActions: once ? "play none none none" : "play reverse play reverse",
          },
        });
        return;
      }

      // Initial from-variables based on variant
      const fromVars: gsap.TweenVars = {
        autoAlpha: 0,
      };

      switch (variant) {
        case "up":
          fromVars.y = distance;
          break;
        case "down":
          fromVars.y = -distance;
          break;
        case "left":
          fromVars.x = distance;
          break;
        case "right":
          fromVars.x = -distance;
          break;
        case "scale":
          fromVars.scale = 0.94;
          fromVars.y = distance * 0.4;
          break;
        case "blur":
          fromVars.filter = "blur(10px)";
          fromVars.y = distance * 0.5;
          break;
        case "fade":
        default:
          break;
      }

      const toVars: gsap.TweenVars = {
        autoAlpha: 1,
        x: 0,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration,
        delay,
        ease: EASE.smooth,
        scrollTrigger: {
          trigger: containerRef.current,
          start,
          toggleActions: once ? "play none none none" : "play reverse play reverse",
        },
      };

      if (isStagger && Array.isArray(targets)) {
        toVars.stagger = stagger;
      }

      gsap.fromTo(targets, fromVars, toVars);
    },
    { scope: containerRef, dependencies: [variant, delay, duration, distance, stagger, start, once] }
  );

  return (
    <Component
      ref={containerRef}
      data-anim="reveal"
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Reveal;
