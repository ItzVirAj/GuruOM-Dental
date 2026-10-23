"use client";

import React, { useRef } from "react";
import { gsap, EASE, useGSAP } from "@/lib/gsap";

export interface CounterProps {
  value: string;
  prefix?: string;
  suffix?: string;
  duration?: number;
  stagger?: number;
  delay?: number;
  className?: string;
  digitClassName?: string;
  prefixClassName?: string;
  suffixClassName?: string;
  trigger?: "scroll" | "load";
  triggerElement?: HTMLElement | null;
  triggerRef?: React.RefObject<HTMLElement | null>;
  start?: string;
  once?: boolean;
}

export const Counter: React.FC<CounterProps> = ({
  value,
  prefix = "",
  suffix = "",
  duration = 1.8,
  stagger = 0.08,
  delay = 0,
  className = "",
  digitClassName = "",
  prefixClassName = "",
  suffixClassName = "",
  trigger = "scroll",
  triggerElement,
  triggerRef,
  start = "top 85%",
  once = true,
}) => {
  const containerRef = useRef<HTMLSpanElement | null>(null);

  // Parse characters into digit wheels or static characters
  const characters = value.split("");

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const wheels = containerRef.current.querySelectorAll<HTMLSpanElement>("[data-digit-wheel]");

      if (prefersReducedMotion) {
        wheels.forEach((wheel) => {
          const target = parseInt(wheel.dataset.target || "0", 10);
          gsap.set(wheel, { yPercent: -target * 10 });
        });
        return;
      }

      // Initial state: 0
      gsap.set(wheels, { yPercent: 0 });

      const triggerTarget = triggerRef?.current || triggerElement || containerRef.current;

      // Animate wheels to target numbers
      const tl = gsap.timeline({
        delay,
        scrollTrigger:
          trigger === "scroll"
            ? {
                trigger: triggerTarget,
                start,
                toggleActions: once ? "play none none none" : "restart none none none",
              }
            : undefined,
      });

      wheels.forEach((wheel, index) => {
        const target = parseInt(wheel.dataset.target || "0", 10);
        tl.to(
          wheel,
          {
            yPercent: -target * 10,
            duration,
            ease: EASE.smooth,
          },
          index * stagger
        );
      });
    },
    {
      scope: containerRef,
      dependencies: [value, duration, stagger, delay, trigger, triggerElement, start, once],
    }
  );

  return (
    <span
      ref={containerRef}
      className={`inline-flex items-baseline font-heading select-none ${className}`}
    >
      {/* Screen reader accessible full text */}
      <span className="sr-only">
        {prefix}
        {value}
        {suffix}
      </span>

      {/* Visual rolling digit display */}
      <span aria-hidden="true" className="inline-flex items-baseline">
        {prefix && (
          <span className={prefixClassName || "mr-0.5"}>{prefix}</span>
        )}

        {characters.map((char, index) => {
          const isDigit = /^[0-9]$/.test(char);

          if (!isDigit) {
            return (
              <span key={index} className="inline-block px-[0.02em]">
                {char}
              </span>
            );
          }

          const targetNum = parseInt(char, 10);

          return (
            <span
              key={index}
              className={`relative inline-block overflow-hidden h-[1em] leading-none tabular-nums ${digitClassName}`}
              style={{ width: "0.65em" }}
            >
              <span
                data-digit-wheel
                data-target={targetNum}
                className="flex flex-col will-change-transform"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                  <span
                    key={digit}
                    className="flex h-[1em] items-center justify-center leading-none"
                  >
                    {digit}
                  </span>
                ))}
              </span>
            </span>
          );
        })}

        {suffix && (
          <span className={suffixClassName || "ml-0.5"}>{suffix}</span>
        )}
      </span>
    </span>
  );
};

export default Counter;
