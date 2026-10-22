"use client";

import React, { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

export interface MarqueeProps {
  speed?: number; // pixels per second
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  gap?: number;
  reverseOnScrollUp?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Marquee: React.FC<MarqueeProps> = ({
  speed = 50,
  direction = "left",
  pauseOnHover = true,
  gap = 24,
  reverseOnScrollUp = false,
  className = "",
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      if (!containerRef.current || !trackRef.current) return;

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) return;

      const track = trackRef.current;
      // Single loop distance is 50% of the total track width (since we render 2 sets of items)
      const singleSetWidth = track.scrollWidth / 2;
      if (singleSetWidth <= 0) return;

      const duration = Math.max(singleSetWidth / speed, 2);

      // Kill previous instance if resizing
      if (tweenRef.current) {
        tweenRef.current.kill();
      }

      const isLeft = direction === "left";
      gsap.set(track, { x: isLeft ? 0 : -singleSetWidth });

      const tween = gsap.to(track, {
        x: isLeft ? -singleSetWidth : 0,
        ease: "none",
        duration,
        repeat: -1,
      });

      tweenRef.current = tween;

      // Handle pause on hover
      const handlePointerEnter = () => {
        if (pauseOnHover && tween) tween.pause();
      };

      const handlePointerLeave = () => {
        if (pauseOnHover && tween) tween.resume();
      };

      const container = containerRef.current;
      container.addEventListener("pointerenter", handlePointerEnter);
      container.addEventListener("pointerleave", handlePointerLeave);

      // Scroll direction sync
      let st: ScrollTrigger | undefined;
      if (reverseOnScrollUp) {
        st = ScrollTrigger.create({
          onUpdate: (self) => {
            // self.direction is 1 for scrolling down, -1 for scrolling up
            if (self.direction === 1) {
              gsap.to(tween, { timeScale: 1, duration: 0.3 });
            } else if (self.direction === -1) {
              gsap.to(tween, { timeScale: -1, duration: 0.3 });
            }
          },
        });
      }

      // Handle resize recalculation with ResizeObserver
      const observer = new ResizeObserver(() => {
        if (!trackRef.current) return;
        const newWidth = trackRef.current.scrollWidth / 2;
        const newDuration = Math.max(newWidth / speed, 2);
        tween.duration(newDuration);
      });

      observer.observe(container);

      return () => {
        container.removeEventListener("pointerenter", handlePointerEnter);
        container.removeEventListener("pointerleave", handlePointerLeave);
        observer.disconnect();
        if (st) st.kill();
        tween.kill();
      };
    },
    { scope: containerRef, dependencies: [speed, direction, pauseOnHover, gap, reverseOnScrollUp] }
  );

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none py-2 ${className}`}
    >
      <div
        ref={trackRef}
        className="flex w-max shrink-0 items-center will-change-transform"
        style={{ columnGap: `${gap}px` }}
      >
        <div className="flex shrink-0 items-center" style={{ columnGap: `${gap}px` }}>
          {children}
        </div>
        <div
          aria-hidden="true"
          className="flex shrink-0 items-center"
          style={{ columnGap: `${gap}px` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Marquee;
