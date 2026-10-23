"use client";

import React, { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

export const BlogProgressBar: React.FC = () => {
  const barRef = useRef<HTMLDivElement | null>(null);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion || !barRef.current) return;

    const articleElement = document.getElementById("article-content");
    if (!articleElement) return;

    gsap.set(barRef.current, { scaleX: 0, transformOrigin: "left center" });

    const trigger = ScrollTrigger.create({
      trigger: articleElement,
      start: "top 20%",
      end: "bottom 80%",
      scrub: true,
      animation: gsap.to(barRef.current, {
        scaleX: 1,
        ease: "none",
      }),
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-[var(--nav-h,5rem)] left-0 right-0 h-1 z-40 pointer-events-none bg-transparent"
    >
      <div
        ref={barRef}
        className="h-full bg-accent transition-none"
      />
    </div>
  );
};
