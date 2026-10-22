"use client";

import React, { useRef, useState } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";

export interface PinSectionProps {
  duration?: string | number; // e.g. "+=150%" or 1000
  scrub?: boolean | number;
  anticipatePin?: number;
  pinSpacing?: boolean;
  onProgress?: (progress: number) => void;
  className?: string;
  children: React.ReactNode | ((progress: number) => React.ReactNode);
}

/**
 * PinSection wraps content and pins it inside the viewport during scroll.
 * Compatible with Lenis smooth scroll through GSAP ScrollTrigger ticker integration.
 */
export const PinSection: React.FC<PinSectionProps> = ({
  duration = "+=100%",
  scrub = true,
  anticipatePin = 1,
  pinSpacing = true,
  onProgress,
  className = "",
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinTargetRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState<number>(0);
  const rafIdRef = useRef<number | null>(null);

  useGSAP(
    () => {
      if (!containerRef.current || !pinTargetRef.current) return;

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) {
        setProgress(1);
        if (onProgress) onProgress(1);
        return;
      }

      const st = ScrollTrigger.create({
        trigger: containerRef.current,
        pin: pinTargetRef.current,
        start: "top top",
        end: duration.toString(),
        scrub,
        pinSpacing,
        anticipatePin,
        onUpdate: (self) => {
          if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = requestAnimationFrame(() => {
            setProgress(self.progress);
            if (onProgress) {
              onProgress(self.progress);
            }
          });
        },
      });

      return () => {
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        st.kill();
      };
    },
    { scope: containerRef, dependencies: [duration, scrub, anticipatePin, pinSpacing] }
  );

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div ref={pinTargetRef} className="w-full h-screen">
        {typeof children === "function" ? children(progress) : children}
      </div>
    </div>
  );
};

export default PinSection;
