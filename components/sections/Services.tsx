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
} from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import {
  Container,
  Section,
  Badge,
  IconCircle,
  Eyebrow,
  SmartImage,
  Button,
} from "@/components/ui";
import { SplitHeading, Reveal } from "@/components/animations";
import { servicesData, ServiceItem } from "@/data/services";
import { servicesSectionContent, ServicesSectionContent } from "@/data/home";

export interface ServicesProps {
  content?: ServicesSectionContent;
  services?: ServiceItem[];
}

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

export const Services: React.FC<ServicesProps> = ({
  content = servicesSectionContent,
  services = servicesData,
}) => {
  const containerRef = useRef<HTMLElement | null>(null);

  // Filter 4 featured services and 4 additional services
  const featuredServices = services.filter((s) =>
    content.featuredSlugs.includes(s.slug)
  );
  const otherServices = services.filter(
    (s) => !content.featuredSlugs.includes(s.slug)
  );

  // GSAP contextSafe for hover tweens and desktop scrubbed parallax
  const { contextSafe } = useGSAP(
    () => {
      if (!containerRef.current) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

      // Subtle scrubbed parallax for desktop featured card images
      if (isDesktop && !prefersReducedMotion) {
        const cards = containerRef.current.querySelectorAll<HTMLElement>(
          "[data-service-card]"
        );

        cards.forEach((card) => {
          const parallaxImg = card.querySelector<HTMLElement>(
            "[data-parallax-img]"
          );
          if (parallaxImg) {
            gsap.fromTo(
              parallaxImg,
              { yPercent: -4 },
              {
                yPercent: 4,
                ease: "none",
                scrollTrigger: {
                  trigger: card,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              }
            );
          }
        });
      }
    },
    { scope: containerRef, dependencies: [services, content] }
  );

  // Quick hover tweens via contextSafe (desktop fine pointer only)
  const onCardMouseEnter = contextSafe((card: HTMLElement) => {
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!isFinePointer || prefersReducedMotion) return;

    const img = card.querySelector<HTMLElement>("[data-card-img]");
    const arrowCircle = card.querySelector<HTMLElement>(
      "[data-card-arrow-circle]"
    );
    const arrowIcon = card.querySelector<HTMLElement>("[data-card-arrow-icon]");

    gsap.to(card, {
      y: -8,
      boxShadow: "var(--shadow-float)",
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });

    if (img) {
      gsap.to(img, {
        scale: 1.06,
        duration: 0.45,
        ease: "power2.out",
        overwrite: "auto",
      });
    }

    if (arrowCircle) {
      gsap.to(arrowCircle, {
        backgroundColor: "var(--brand)",
        borderColor: "var(--brand)",
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    }

    if (arrowIcon) {
      gsap.to(arrowIcon, {
        color: "var(--white)",
        x: 2,
        y: -2,
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  });

  const onCardMouseLeave = contextSafe((card: HTMLElement) => {
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!isFinePointer || prefersReducedMotion) return;

    const img = card.querySelector<HTMLElement>("[data-card-img]");
    const arrowCircle = card.querySelector<HTMLElement>(
      "[data-card-arrow-circle]"
    );
    const arrowIcon = card.querySelector<HTMLElement>("[data-card-arrow-icon]");

    gsap.to(card, {
      y: 0,
      boxShadow: "var(--shadow-soft)",
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });

    if (img) {
      gsap.to(img, {
        scale: 1,
        duration: 0.45,
        ease: "power2.out",
        overwrite: "auto",
      });
    }

    if (arrowCircle) {
      gsap.to(arrowCircle, {
        backgroundColor: "var(--surface-alt)",
        borderColor: "var(--line)",
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    }

    if (arrowIcon) {
      gsap.to(arrowIcon, {
        color: "var(--brand)",
        x: 0,
        y: 0,
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  });

  return (
    <Section
      id="services"
      variant="surface"
      ref={containerRef as React.Ref<HTMLElement>}
      className="relative overflow-hidden"
    >
      <Container>
        {/* Header Row: Eyebrow + SplitHeading (left), intro + CTA (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end pb-12 md:pb-16 border-b border-line/60">
          <div className="lg:col-span-7 space-y-4">
            <Eyebrow variant="dot" color="brand">
              {content.eyebrow}
            </Eyebrow>
            <SplitHeading
              as="h2"
              className="text-display-lg font-display text-ink leading-tight"
            >
              {content.title}
            </SplitHeading>
          </div>

          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-5">
            <p className="text-body text-ink-muted leading-relaxed max-w-md lg:text-right">
              {content.intro}
            </p>
            <Button href={content.cta.href} variant="ghost" size="md">
              {content.cta.label}
            </Button>
          </div>
        </div>

        {/* Featured 2x2 Grid (4 Large Cards) */}
        <Reveal
          stagger={0.12}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 pt-12 md:pt-16"
        >
          {featuredServices.map((service, index) => {
            const Icon = iconMap[service.icon] || Sparkles;

            return (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                data-service-card
                onMouseEnter={(e) => onCardMouseEnter(e.currentTarget)}
                onMouseLeave={(e) => onCardMouseLeave(e.currentTarget)}
                className="group flex flex-col justify-between rounded-3xl bg-white border border-line p-6 sm:p-8 shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 select-none will-change-transform"
              >
                <div>
                  {/* Top: 4/3 Aspect Image with Overlapping Elements */}
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-surface-alt">
                    {/* Parallax Container for Desktop */}
                    <div
                      data-parallax-img
                      className="w-full h-full scale-105 will-change-transform"
                    >
                      <div
                        data-card-img
                        className="w-full h-full will-change-transform"
                      >
                        <SmartImage
                          slot={service.imageSlot}
                          ratio="4/3"
                          alt={service.title}
                          className="w-full h-full"
                        />
                      </div>
                    </div>

                    {/* Top-Right Badge Number */}
                    <div className="absolute top-4 right-4 z-10">
                      <Badge variant="accent" size="sm">
                        {String(index + 1).padStart(2, "0")}
                      </Badge>
                    </div>

                    {/* Bottom-Left Overlapping IconCircle */}
                    <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
                      <IconCircle
                        variant="white"
                        size="md"
                        className="shadow-soft border border-line"
                      >
                        <Icon
                          className="w-5 h-5 text-brand"
                          aria-hidden="true"
                        />
                      </IconCircle>
                    </div>
                  </div>

                  {/* Service Title */}
                  <h3 className="font-display text-heading text-ink group-hover:text-brand transition-colors duration-300">
                    {service.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-body text-ink-muted line-clamp-2 mt-2.5 leading-relaxed font-body">
                    {service.shortDescription}
                  </p>
                </div>

                {/* Footer Row: View Details Link + Animated Arrow Circle */}
                <div className="flex items-center justify-between pt-6 mt-6 border-t border-line/60">
                  <span className="text-xs font-semibold tracking-wider uppercase text-brand font-body">
                    View details
                  </span>
                  <span
                    data-card-arrow-circle
                    className="w-8 h-8 rounded-full border border-line bg-surface-alt flex items-center justify-center text-brand"
                    aria-hidden="true"
                  >
                    <ArrowUpRight
                      data-card-arrow-icon
                      className="w-4 h-4 will-change-transform"
                    />
                  </span>
                </div>
              </Link>
            );
          })}
        </Reveal>

        {/* Compact "More Services" Pill Links List */}
        {otherServices.length > 0 && (
          <Reveal
            delay={0.2}
            stagger={0.08}
            className="mt-12 sm:mt-16 pt-8 border-t border-line/70"
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted font-body">
                  Additional Clinical Specialties
                </p>
                <p className="text-sm font-medium text-ink font-body mt-0.5">
                  Looking for another procedure? Explore our complete care
                  spectrum:
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {otherServices.map((service) => {
                  const Icon = iconMap[service.icon] || Sparkles;
                  return (
                    <Link
                      key={service.slug}
                      href={`/services/${service.slug}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-white border border-line text-xs font-medium text-ink hover:text-brand hover:border-brand hover:shadow-soft transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand font-body"
                    >
                      <Icon
                        className="w-3.5 h-3.5 text-brand group-hover:scale-110 transition-transform duration-200"
                        aria-hidden="true"
                      />
                      <span>{service.title}</span>
                      <ArrowUpRight
                        className="w-3 h-3 text-ink-muted group-hover:text-brand group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
                        aria-hidden="true"
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          </Reveal>
        )}
      </Container>
    </Section>
  );
};

export default Services;
