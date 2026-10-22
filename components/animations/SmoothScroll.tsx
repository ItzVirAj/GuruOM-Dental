"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// Context to expose the active Lenis instance to components, modals, and nav links
export const LenisContext = createContext<Lenis | null>(null);

/**
 * Access the active Lenis instance.
 * Allows calling lenis.stop() / start() for modals & menus, or lenis.scrollTo() for smooth links.
 */
export function useLenis() {
  return useContext(LenisContext);
}

interface SmoothScrollProps {
  children: React.ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Accessibility check: Do not engage smooth inertia scroll if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      document.fonts?.ready?.then(() => ScrollTrigger.refresh());
      return;
    }

    // Initialize Lenis
    const lenis = new Lenis({
      autoRaf: false,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      syncTouch: false, // Keep native touch physics on mobile/touch devices
    });

    lenisRef.current = lenis;
    queueMicrotask(() => {
      setLenisInstance(lenis);
    });

    // Make accessible on window in browser console for testing & debugging
    if (process.env.NODE_ENV !== "production") {
      // @ts-expect-error development convenience
      window.lenis = lenis;
      // @ts-expect-error development convenience
      window.ScrollTrigger = ScrollTrigger;
    }

    // Sync Lenis scroll positions directly with GSAP ScrollTrigger
    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    // Drive Lenis RAF inside GSAP Ticker for frame-perfect animation synchronicity
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // Force ScrollTrigger to calculate correct trigger positions
    const refreshAll = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };

    // Immediate and staged refresh to ensure layout and fonts are fully measured
    refreshAll();
    const frameId = requestAnimationFrame(refreshAll);
    const timeoutId = setTimeout(refreshAll, 150);

    window.addEventListener("load", refreshAll);
    window.addEventListener("resize", refreshAll);

    if (document.fonts?.ready) {
      document.fonts.ready.then(refreshAll);
    }

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
      window.removeEventListener("load", refreshAll);
      window.removeEventListener("resize", refreshAll);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
    };
  }, []);

  // Whenever Next.js route / pathname changes, refresh ScrollTrigger and Lenis dimensions
  useEffect(() => {
    if (!lenisRef.current) return;

    const timer = setTimeout(() => {
      lenisRef.current?.resize();
      ScrollTrigger.refresh();
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <LenisContext.Provider value={lenisInstance}>
      {children}
    </LenisContext.Provider>
  );
}
