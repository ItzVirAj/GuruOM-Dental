"use client";

import React, { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

export interface MarqueeProps {
  speed?: number; // pixels per second
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  slowOnHover?: boolean;
  hoverSlowFactor?: number;
  scrollVelocityBoost?: boolean;
  pauseWhenHidden?: boolean;
  gap?: number;
  reverseOnScrollUp?: boolean;
  fadeEdges?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Marquee: React.FC<MarqueeProps> = ({
  speed = 50,
  direction = "left",
  pauseOnHover = true,
  slowOnHover = false,
  hoverSlowFactor = 0.2,
  scrollVelocityBoost = false,
  pauseWhenHidden = true,
  gap = 24,
  reverseOnScrollUp = false,
  fadeEdges = false,
  className = "",
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const isHoveredRef = useRef(false);

  // Check reduced motion state
  const isReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useGSAP(
    () => {
      if (!containerRef.current || !trackRef.current || isReducedMotion) return;

      const track = trackRef.current;
      const singleSetWidth = track.scrollWidth / 2;
      if (singleSetWidth <= 0) return;

      const duration = Math.max(singleSetWidth / speed, 2);

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

      // Handle hover interactions (smooth slowdown or pause)
      const handlePointerEnter = () => {
        isHoveredRef.current = true;
        if (!tweenRef.current) return;
        if (slowOnHover) {
          gsap.to(tweenRef.current, {
            timeScale: hoverSlowFactor,
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto",
          });
        } else if (pauseOnHover) {
          tweenRef.current.pause();
        }
      };

      const handlePointerLeave = () => {
        isHoveredRef.current = false;
        if (!tweenRef.current) return;
        if (slowOnHover) {
          gsap.to(tweenRef.current, {
            timeScale: 1,
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto",
          });
        } else if (pauseOnHover) {
          tweenRef.current.resume();
        }
      };

      const container = containerRef.current;
      container.addEventListener("pointerenter", handlePointerEnter);
      container.addEventListener("pointerleave", handlePointerLeave);

      // Scroll direction sync
      let directionTrigger: ScrollTrigger | undefined;
      if (reverseOnScrollUp) {
        directionTrigger = ScrollTrigger.create({
          onUpdate: (self) => {
            if (self.direction === 1) {
              gsap.to(tween, { timeScale: 1, duration: 0.3 });
            } else if (self.direction === -1) {
              gsap.to(tween, { timeScale: -1, duration: 0.3 });
            }
          },
        });
      }

      // Scroll-linked velocity boost
      let velocityTrigger: ScrollTrigger | undefined;
      if (scrollVelocityBoost) {
        velocityTrigger = ScrollTrigger.create({
          onUpdate: (self) => {
            if (isHoveredRef.current || !tweenRef.current) return;
            const vel = Math.abs(self.getVelocity());
            if (vel > 150) {
              const boost = Math.min(1 + vel / 1400, 2.2);
              gsap.to(tweenRef.current, {
                timeScale: boost,
                duration: 0.25,
                overwrite: "auto",
                onComplete: () => {
                  if (!isHoveredRef.current && tweenRef.current) {
                    gsap.to(tweenRef.current, {
                      timeScale: 1,
                      duration: 0.5,
                      ease: "power2.out",
                    });
                  }
                },
              });
            }
          },
        });
      }

      // Off-screen and tab visibility pause to conserve CPU
      let viewTrigger: ScrollTrigger | undefined;
      let handleVisibility: (() => void) | undefined;
      if (pauseWhenHidden) {
        viewTrigger = ScrollTrigger.create({
          trigger: container,
          start: "top bottom",
          end: "bottom top",
          onEnter: () => tween.play(),
          onLeave: () => tween.pause(),
          onEnterBack: () => tween.play(),
          onLeaveBack: () => tween.pause(),
        });

        handleVisibility = () => {
          if (document.hidden) {
            tween.pause();
          } else {
            if (!viewTrigger || viewTrigger.isActive) {
              tween.play();
            }
          }
        };
        document.addEventListener("visibilitychange", handleVisibility);
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
        if (handleVisibility) {
          document.removeEventListener("visibilitychange", handleVisibility);
        }
        observer.disconnect();
        if (directionTrigger) directionTrigger.kill();
        if (velocityTrigger) velocityTrigger.kill();
        if (viewTrigger) viewTrigger.kill();
        tween.kill();
      };
    },
    {
      scope: containerRef,
      dependencies: [
        speed,
        direction,
        pauseOnHover,
        slowOnHover,
        hoverSlowFactor,
        scrollVelocityBoost,
        pauseWhenHidden,
        gap,
        reverseOnScrollUp,
        isReducedMotion,
      ],
    }
  );

  // Accessible reduced-motion fallback: horizontal scrollable strip
  if (isReducedMotion) {
    return (
      <div
        className={`relative w-full overflow-x-auto snap-x snap-mandatory py-2 ${className}`}
        style={
          fadeEdges
            ? {
                maskImage:
                  "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
              }
            : undefined
        }
      >
        <div
          className="flex w-max shrink-0 items-center px-4"
          style={{ columnGap: `${gap}px` }}
        >
          {React.Children.map(children, (child, idx) => (
            <div key={idx} className="snap-start shrink-0">
              {child}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none py-2 ${className}`}
      style={
        fadeEdges
          ? {
              maskImage:
                "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            }
          : undefined
      }
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
          inert={true}
          tabIndex={-1}
          className="flex shrink-0 items-center pointer-events-none select-none"
          style={{ columnGap: `${gap}px` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Marquee;
