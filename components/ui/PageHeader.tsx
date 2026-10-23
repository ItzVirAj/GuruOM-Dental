"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "./Container";
import { Badge } from "./Badge";
import { SplitHeading } from "@/components/animations/SplitHeading";
import { gsap, useGSAP } from "@/lib/gsap";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  align?: "left" | "center";
  children?: React.ReactNode;
  badge?: string; // Optional badge for backward compatibility
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  title,
  description,
  breadcrumbs,
  align = "left",
  children,
  badge,
  className = "",
}) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const eyebrowRef = useRef<HTMLDivElement | null>(null);
  const descRef = useRef<HTMLParagraphElement | null>(null);
  const childrenRef = useRef<HTMLDivElement | null>(null);

  // Compute fallback breadcrumbs if not explicitly provided
  const activeBreadcrumbs: BreadcrumbItem[] = breadcrumbs && breadcrumbs.length > 0
    ? breadcrumbs
    : [
        { label: "Home", href: "/" },
        { label: title },
      ];

  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el) return;

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion) {
        if (eyebrowRef.current) gsap.set(eyebrowRef.current, { opacity: 1 });
        if (descRef.current) gsap.set(descRef.current, { opacity: 1 });
        if (childrenRef.current) gsap.set(childrenRef.current, { opacity: 1 });
        return;
      }

      // Initial state
      if (eyebrowRef.current) gsap.set(eyebrowRef.current, { opacity: 0, y: 12 });
      if (descRef.current) gsap.set(descRef.current, { opacity: 0, y: 16 });
      if (childrenRef.current) gsap.set(childrenRef.current, { opacity: 0, y: 16 });

      const animateElements = () => {
        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

        if (eyebrowRef.current) {
          tl.to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0.05);
        }
        if (descRef.current) {
          tl.to(descRef.current, { opacity: 1, y: 0, duration: 0.6 }, 0.3);
        }
        if (childrenRef.current) {
          tl.to(childrenRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0.45);
        }
      };

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(animateElements);
      } else {
        animateElements();
      }
    },
    { dependencies: [title, eyebrow, description], scope: containerRef }
  );

  const isCenter = align === "center";

  return (
    <section
      ref={containerRef}
      className={`relative overflow-hidden bg-brand-dark text-white border-b border-brand/30 pt-[calc(var(--nav-h,5rem)+2rem)] pb-14 md:pt-[calc(var(--nav-h,5rem)+3.5rem)] md:pb-20 ${className}`}
    >
      {/* Decorative ambient backdrop: Soft radial accent glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 -z-10 w-[700px] h-[350px] bg-accent/15 rounded-full blur-[130px] opacity-70"
      />

      {/* Faint large decorative circle outline (design tokens only) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -bottom-36 -z-10 w-96 h-96 rounded-full border border-white/5 opacity-40 lg:w-[480px] lg:h-[480px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 top-1/2 -translate-y-1/2 -z-10 w-64 h-64 rounded-full border border-accent/10 opacity-30"
      />

      <Container>
        <div
          className={`max-w-4xl space-y-4 ${
            isCenter ? "mx-auto text-center items-center flex flex-col" : ""
          }`}
        >
          {/* Breadcrumbs Navigation */}
          <nav
            aria-label="Breadcrumb"
            className={`flex items-center ${isCenter ? "justify-center" : ""}`}
          >
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-white/60">
              {activeBreadcrumbs.map((crumb, idx) => {
                const isLast = idx === activeBreadcrumbs.length - 1;
                return (
                  <li key={`${crumb.label}-${idx}`} className="flex items-center gap-1.5">
                    {idx > 0 && (
                      <ChevronRight
                        className="w-3.5 h-3.5 text-white/30 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    {isLast ? (
                      <span
                        aria-current="page"
                        className="font-medium text-white/95 truncate max-w-[200px] sm:max-w-xs"
                      >
                        {crumb.label}
                      </span>
                    ) : crumb.href ? (
                      <Link
                        href={crumb.href}
                        className="hover:text-accent transition-colors underline-offset-4 hover:underline"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span>{crumb.label}</span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          {/* Eyebrow or Badge */}
          <div ref={eyebrowRef} className="flex flex-wrap items-center gap-2 pt-1">
            {eyebrow && (
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" aria-hidden="true" />
                {eyebrow}
              </span>
            )}
            {badge && (
              <Badge variant="accent" size="sm">
                {badge}
              </Badge>
            )}
          </div>

          {/* Split Heading (Total intro under 1.2s, waits for fonts) */}
          <div className="pt-1">
            <SplitHeading
              as="h1"
              type="lines"
              mask={true}
              trigger="load"
              delay={0.1}
              className={`text-display-lg sm:text-display-xl lg:text-display-2xl font-display text-white tracking-tight leading-[1.1] ${
                isCenter ? "mx-auto text-center" : ""
              }`}
            >
              {title}
            </SplitHeading>
          </div>

          {/* Description */}
          {description && (
            <p
              ref={descRef}
              className={`text-body sm:text-body-lg text-white/75 leading-relaxed max-w-2xl pt-1 ${
                isCenter ? "mx-auto text-center" : ""
              }`}
            >
              {description}
            </p>
          )}

          {/* Children Slot (e.g. CTA buttons, search, custom stats) */}
          {children && (
            <div
              ref={childrenRef}
              className={`pt-3 ${isCenter ? "flex justify-center" : ""}`}
            >
              {children}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default PageHeader;
