"use client";

import React, { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export interface MagneticWrapProps {
  radius?: number; // max pixel displacement
  strength?: number; // magnetic pull ratio (0.1 to 0.5)
  className?: string;
  children: React.ReactNode;
}

export const MagneticWrap: React.FC<MagneticWrapProps> = ({
  radius = 16,
  strength = 0.35,
  className = "",
  children,
}) => {
  const magneticRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!magneticRef.current) return;

      const isFinePointer = window.matchMedia("(pointer: fine)").matches;
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Magnetic interaction disabled on touch or reduced motion
      if (!isFinePointer || prefersReducedMotion) return;

      const element = magneticRef.current;
      const xTo = gsap.quickTo(element, "x", { duration: 0.6, ease: "power3.out" });
      const yTo = gsap.quickTo(element, "y", { duration: 0.6, ease: "power3.out" });

      const handleMouseMove = (e: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * strength;
        const deltaY = (e.clientY - centerY) * strength;

        const distance = Math.hypot(deltaX, deltaY);
        if (distance > radius) {
          const angle = Math.atan2(deltaY, deltaX);
          xTo(Math.cos(angle) * radius);
          yTo(Math.sin(angle) * radius);
        } else {
          xTo(deltaX);
          yTo(deltaY);
        }
      };

      const handleMouseLeave = () => {
        xTo(0);
        yTo(0);
      };

      element.addEventListener("mousemove", handleMouseMove);
      element.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        element.removeEventListener("mousemove", handleMouseMove);
        element.removeEventListener("mouseleave", handleMouseLeave);
      };
    },
    { scope: magneticRef, dependencies: [radius, strength] }
  );

  return (
    <div
      ref={magneticRef}
      className={`inline-block will-change-transform ${className}`}
    >
      {children}
    </div>
  );
};

export default MagneticWrap;
