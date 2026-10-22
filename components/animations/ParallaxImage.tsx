"use client";

import React, { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import SmartImage, { SmartImageProps } from "@/components/ui/SmartImage";

export interface ParallaxImageProps extends Omit<SmartImageProps, "className"> {
  speed?: number; // Higher value = more displacement
  scale?: number; // Overscale factor so edges don't reveal during Y travel
  className?: string;
  imageClassName?: string;
}

export const ParallaxImage: React.FC<ParallaxImageProps> = ({
  speed = 0.15,
  scale = 1.15,
  ratio = "16/9",
  src,
  alt,
  label,
  priority = false,
  className = "",
  imageClassName = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current || !imageWrapperRef.current) return;

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

      // Parallax active only on desktop and without reduced motion preference
      if (prefersReducedMotion || !isDesktop) {
        gsap.set(imageWrapperRef.current, { y: 0, scale: 1 });
        return;
      }

      const travelDistance = containerRef.current.offsetHeight * speed * 2;

      gsap.fromTo(
        imageWrapperRef.current,
        {
          y: -travelDistance / 2,
          scale,
        },
        {
          y: travelDistance / 2,
          scale,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    },
    { scope: containerRef, dependencies: [speed, scale] }
  );

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-lg ${className}`}
    >
      <div
        ref={imageWrapperRef}
        className="w-full h-full will-change-transform"
      >
        <SmartImage
          src={src}
          alt={alt}
          ratio={ratio}
          label={label}
          priority={priority}
          className={imageClassName}
        />
      </div>
    </div>
  );
};

export default ParallaxImage;
