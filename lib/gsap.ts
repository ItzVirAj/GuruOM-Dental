"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { Draggable } from "gsap/Draggable";
import { useGSAP } from "@gsap/react";

/* ==========================================================================
   GLOBAL GSAP CONFIGURATION (Single Source of Truth)
   ========================================================================== */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip, Draggable, useGSAP);

  // Set production sensible defaults
  gsap.defaults({
    ease: "power3.out",
    duration: 0.9,
  });

  // Prevent jumpy mobile address bar resizes from triggering recalculations
  ScrollTrigger.config({
    ignoreMobileResize: true,
  });
}

/* ==========================================================================
   SHARED MOTION CONSTANTS
   ========================================================================== */
export const EASE = {
  smooth: "power3.out",
  expo: "expo.out",
  inOut: "power2.inOut",
  elastic: "elastic.out(1, 0.75)",
} as const;

export const DUR = {
  fast: 0.4,
  base: 0.9,
  slow: 1.4,
} as const;

/**
 * Convenience helper to create a gsap.matchMedia instance
 * for responsive, desktop-only, and reduced-motion-safe animations.
 */
export const createMM = () => gsap.matchMedia();

/* ==========================================================================
   RE-EXPORTS
   ========================================================================== */
export { gsap, ScrollTrigger, SplitText, Flip, Draggable, useGSAP };
export default gsap;
