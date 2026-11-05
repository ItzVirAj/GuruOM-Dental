"use client";

import React, { useRef } from "react";
import Link from "next/link";
import {
  Stethoscope,
  Sparkles,
  Smile,
  ShieldCheck,
  Activity,
  Palette,
  Heart,
  Clock,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { SmartImage } from "@/components/ui/SmartImage";
import { Badge } from "@/components/ui/Badge";
import { IconCircle } from "@/components/ui/IconCircle";
import { ServiceItem } from "@/data/services";
import { gsap, useGSAP } from "@/lib/gsap";

const iconMap: Record<string, React.ElementType> = {
  Stethoscope,
  Sparkles,
  Smile,
  ShieldCheck,
  Activity,
  Palette,
  Heart,
  Clock,
};

export interface ServicesCatalogGridProps {
  services: ServiceItem[];
}

export function ServicesCatalogGrid({ services }: ServicesCatalogGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion) return;

      const cards = containerRef.current.querySelectorAll(".service-catalog-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
          },
        }
      );
    },
    { scope: containerRef, dependencies: [services] }
  );

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
    >
      {services.map((service, index) => {
        const Icon = iconMap[service.icon] || Sparkles;

        return (
          <Link
            key={service.slug}
            href={`/services/${service.slug}`}
            className="service-catalog-card group flex flex-col justify-between rounded-3xl bg-white border border-line p-6 sm:p-7 shadow-soft transition-all duration-300 hover:border-brand/40 hover:-translate-y-1 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            <div>
              {/* Top Image Container */}
              <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden mb-6 bg-surface-alt">
                <SmartImage
                  slot={service.imageSlot}
                  ratio="16/10"
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />

                {/* Number Badge */}
                <div className="absolute top-3.5 right-3.5 z-10">
                  <Badge variant="accent" size="sm">
                    {String(index + 1).padStart(2, "0")}
                  </Badge>
                </div>

                {/* Overlapping IconCircle */}
                <div className="absolute bottom-3.5 left-3.5 z-10 pointer-events-none">
                  <IconCircle
                    variant="white"
                    size="md"
                    className="shadow-soft border border-line"
                  >
                    <Icon className="w-5 h-5 text-brand" aria-hidden="true" />
                  </IconCircle>
                </div>
              </div>

              {/* Service Title */}
              <h3 className="font-display text-xl sm:text-2xl font-bold text-ink group-hover:text-brand transition-colors duration-200">
                {service.title}
              </h3>

              {/* Short Description */}
              <p className="text-xs sm:text-sm text-ink-muted mt-2.5 leading-relaxed font-body line-clamp-2">
                {service.shortDescription}
              </p>

              {/* Key Highlights */}
              <ul className="mt-4 space-y-1.5 pt-4 border-t border-line/60">
                {service.features.slice(0, 3).map((feat, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-xs text-ink/80 font-body"
                  >
                    <CheckCircle2
                      className="w-3.5 h-3.5 text-brand shrink-0"
                      aria-hidden="true"
                    />
                    <span className="truncate">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Meta & Arrow */}
            <div className="pt-6 mt-6 border-t border-line/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block font-body">
                  Duration: {service.duration}
                </span>
                <span className="text-xs font-bold text-brand font-display">
                  {service.startingPrice}
                </span>
              </div>

              <div className="w-9 h-9 rounded-full bg-surface-alt border border-line flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-white group-hover:border-brand transition-all duration-300">
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

