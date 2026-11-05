"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { siteConfig } from "@/data/site";

export interface ServiceStickyBarProps {
  slug: string;
  title: string;
  startingPrice: string;
}

export function ServiceStickyBar({
  slug,
  title,
  startingPrice,
}: ServiceStickyBarProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide sticky bar when footer is in viewport so it never covers footer content
    const footer = document.querySelector("footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting);
      },
      { rootMargin: "0px 0px 50px 0px", threshold: 0.05 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <aside
      aria-label="Quick appointment booking"
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-line px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-2xl transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full pointer-events-none"
      }`}
    >
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div className="min-w-0 flex-1">
          <p className="font-display text-xs font-bold text-ink truncate">
            {title}
          </p>
          <p className="text-[11px] font-semibold text-brand font-body">
            {startingPrice}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`tel:${siteConfig.phone.replace(/[\s\-\(\)]/g, "")}`}
            aria-label={`Call clinic at ${siteConfig.phone}`}
            className="w-10 h-10 rounded-full border border-line bg-surface flex items-center justify-center text-ink hover:text-brand transition-colors"
          >
            <Phone className="w-4 h-4" />
          </a>
          <Link
            href={`/appointment?service=${slug}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-brand text-white font-medium text-xs shadow-sm hover:bg-brand-dark transition-colors min-h-[44px]"
          >
            <span>Book Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

