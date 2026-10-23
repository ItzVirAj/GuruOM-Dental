"use client";

import React, { useRef } from "react";
import { Check, X } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import {
  Container,
  Section,
  Badge,
  Eyebrow,
  Button,
} from "@/components/ui";
import { MagneticWrap } from "@/components/animations";
import { comparisonContent, ComparisonContent } from "@/data/home";

export interface ComparisonProps {
  content?: ComparisonContent;
}

export const Comparison: React.FC<ComparisonProps> = ({
  content = comparisonContent,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const tableWrapperRef = useRef<HTMLDivElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion) return;

      const isDesktop = window.matchMedia("(min-width: 768px)").matches;

      if (isDesktop) {
        const strip = stripRef.current;
        const rows = sectionRef.current.querySelectorAll<HTMLElement>(
          "[data-table-row]"
        );
        const lines = sectionRef.current.querySelectorAll<HTMLElement>(
          "[data-row-line]"
        );
        const checkIcons = sectionRef.current.querySelectorAll<HTMLElement>(
          "[data-icon-check]"
        );

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: tableWrapperRef.current || sectionRef.current,
            start: "top 75%",
            once: true,
          },
        });

        // 1. Column strip scales in vertically from top
        if (strip) {
          tl.fromTo(
            strip,
            { scaleY: 0, transformOrigin: "top center" },
            { scaleY: 1, duration: 0.6, ease: "power2.out" }
          );
        }

        // 2. Rows reveal stagger 0.1 from slight x offset and opacity
        if (rows.length > 0) {
          tl.fromTo(
            rows,
            { opacity: 0, x: -16 },
            {
              opacity: 1,
              x: 0,
              duration: 0.5,
              stagger: 0.1,
              ease: "power2.out",
            },
            strip ? "-=0.25" : 0
          );
        }

        // 3. Thin line under each row draws left to right
        if (lines.length > 0) {
          tl.fromTo(
            lines,
            { scaleX: 0, transformOrigin: "left center" },
            {
              scaleX: 1,
              duration: 0.5,
              stagger: 0.1,
              ease: "power2.out",
            },
            "<"
          );
        }

        // 4. Check icons pop in with tiny scale overshoot (back.out) shortly after their row
        if (checkIcons.length > 0) {
          tl.fromTo(
            checkIcons,
            { scale: 0, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.45,
              stagger: 0.08,
              ease: "back.out(2)",
            },
            "-=0.4"
          );
        }
      } else {
        // Mobile stacked cards animation
        const cards = sectionRef.current.querySelectorAll<HTMLElement>(
          "[data-mobile-card]"
        );
        if (cards.length > 0) {
          gsap.fromTo(
            cards,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger:
                  sectionRef.current.querySelector("[data-mobile-list]") ||
                  sectionRef.current,
                start: "top 80%",
                once: true,
              },
            }
          );
        }
      }
    },
    { scope: sectionRef, dependencies: [content] }
  );

  return (
    <Section
      id="comparison"
      variant="alt"
      ref={sectionRef as React.Ref<HTMLElement>}
      className="relative overflow-hidden py-20 md:py-28"
    >
      <Container>
        {/* Centered Heading Block */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="mb-4">
            <Eyebrow variant="dot" color="brand">
              {content.eyebrow}
            </Eyebrow>
          </div>
          <h2 className="text-display-md sm:text-display-lg font-display text-ink leading-tight tracking-tight mb-4 max-w-2xl">
            {content.title}
          </h2>
          <p className="text-body text-ink-muted leading-relaxed max-w-xl font-body">
            {content.intro}
          </p>
        </div>

        {/* ================================================================ */}
        {/* DESKTOP COMPARISON TABLE (>= 768px)                               */}
        {/* ================================================================ */}
        <div
          ref={tableWrapperRef}
          className="hidden md:block relative max-w-5xl mx-auto"
        >
          {/* Visual Highlight Strip for GuruOm Dental column */}
          <div
            ref={stripRef}
            aria-hidden="true"
            className="absolute left-[38%] w-[33%] -top-5 -bottom-5 bg-brand rounded-3xl shadow-card pointer-events-none -z-0 will-change-transform"
          />

          <table className="w-full border-collapse relative z-10">
            <thead>
              <tr className="border-b border-line/60">
                <th
                  scope="col"
                  className="w-[38%] py-6 px-6 text-left font-display text-heading text-ink align-bottom"
                >
                  Clinical Standard
                </th>
                <th
                  scope="col"
                  className="w-[33%] py-6 px-6 text-center text-white align-bottom"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Badge
                      variant="accent"
                      size="sm"
                      className="font-semibold uppercase tracking-wider font-body shadow-soft"
                    >
                      Recommended
                    </Badge>
                    <span className="font-display text-heading text-white">
                      {content.columns.us}
                    </span>
                  </div>
                </th>
                <th
                  scope="col"
                  className="w-[29%] py-6 px-6 text-center font-display text-heading text-ink-muted align-bottom"
                >
                  {content.columns.them}
                </th>
              </tr>
            </thead>

            <tbody>
              {content.rows.map((row) => (
                <React.Fragment key={row.id}>
                  <tr data-table-row className="transition-colors">
                    {/* Feature Title (Column 1) */}
                    <th
                      scope="row"
                      className="py-5 px-6 text-left font-semibold text-sm text-ink font-body align-middle"
                    >
                      {row.feature}
                    </th>

                    {/* GuruOm Dental (Column 2 - Highlighted) */}
                    <td className="py-5 px-6 text-center text-white align-middle font-body">
                      {typeof row.usValue === "boolean" ? (
                        <div className="inline-flex items-center justify-center">
                          {row.usValue ? (
                            <span
                              data-icon-check
                              className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent/25 text-accent border border-accent/40 shadow-soft"
                            >
                              <Check
                                className="w-4 h-4"
                                strokeWidth={2.5}
                                aria-hidden="true"
                              />
                              <span className="sr-only">Included / Yes</span>
                            </span>
                          ) : (
                            <span
                              data-icon-x
                              className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/10 text-white/60 border border-white/20"
                            >
                              <X
                                className="w-4 h-4"
                                strokeWidth={2}
                                aria-hidden="true"
                              />
                              <span className="sr-only">Not standard / No</span>
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-white/95 leading-relaxed block max-w-xs mx-auto">
                          {row.usValue}
                        </span>
                      )}
                    </td>

                    {/* Common Practice (Column 3 - Muted) */}
                    <td className="py-5 px-6 text-center text-ink-muted align-middle font-body">
                      {typeof row.themValue === "boolean" ? (
                        <div className="inline-flex items-center justify-center">
                          {row.themValue ? (
                            <span
                              data-icon-check
                              className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300"
                            >
                              <Check
                                className="w-4 h-4"
                                strokeWidth={2.5}
                                aria-hidden="true"
                              />
                              <span className="sr-only">Included / Yes</span>
                            </span>
                          ) : (
                            <span
                              data-icon-x
                              className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ink/5 text-ink-muted border border-line"
                            >
                              <X
                                className="w-4 h-4"
                                strokeWidth={2}
                                aria-hidden="true"
                              />
                              <span className="sr-only">Not standard / No</span>
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-ink-muted leading-relaxed block max-w-xs mx-auto">
                          {row.themValue}
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* Animated thin dividing line */}
                  <tr aria-hidden="true">
                    <td colSpan={3} className="p-0">
                      <div
                        data-row-line
                        className="h-[1px] w-full bg-line/60 origin-left will-change-transform"
                      />
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================================================================ */}
        {/* MOBILE STACKED CARDS (< 768px)                                   */}
        {/* Proper semantic list with dl/dt/dd to prevent horizontal overflow */}
        {/* ================================================================ */}
        <div data-mobile-list className="md:hidden space-y-4">
          <ul role="list" className="space-y-4">
            {content.rows.map((row) => (
              <li
                key={row.id}
                data-mobile-card
                className="rounded-2xl bg-white border border-line p-5 shadow-soft space-y-3.5"
              >
                <h3 className="font-display text-base font-semibold text-ink leading-snug">
                  {row.feature}
                </h3>

                <dl className="space-y-2.5 font-body">
                  {/* GuruOm Dental Line */}
                  <div className="p-3.5 rounded-xl bg-accent-soft/80 border border-accent/40 flex items-start gap-3">
                    <span className="shrink-0 mt-0.5">
                      {typeof row.usValue === "boolean" && row.usValue ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand text-white">
                          <Check className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
                          <span className="sr-only">Included / Yes</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand text-white text-[11px] font-bold">
                          ✓
                        </span>
                      )}
                    </span>
                    <div className="text-xs">
                      <dt className="font-semibold text-brand">
                        {content.columns.us}
                      </dt>
                      <dd className="text-ink font-medium mt-0.5 leading-relaxed">
                        {typeof row.usValue === "string"
                          ? row.usValue
                          : "Standard protocol in all care"}
                      </dd>
                    </div>
                  </div>

                  {/* Common Practice Line */}
                  <div className="p-3.5 rounded-xl bg-surface-alt/70 border border-line flex items-start gap-3 text-ink-muted">
                    <span className="shrink-0 mt-0.5">
                      {typeof row.themValue === "boolean" && !row.themValue ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-ink/10 text-ink-muted">
                          <X className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                          <span className="sr-only">Not standard / No</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-ink/10 text-ink-muted text-[11px]">
                          -
                        </span>
                      )}
                    </span>
                    <div className="text-xs">
                      <dt className="font-semibold text-ink-muted">
                        {content.columns.them}
                      </dt>
                      <dd className="text-ink-muted mt-0.5 leading-relaxed">
                        {typeof row.themValue === "string"
                          ? row.themValue
                          : "Variable or not routinely provided"}
                      </dd>
                    </div>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </div>

        {/* Small CTA row under table */}
        <div className="mt-12 sm:mt-16 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
          <p className="text-body font-medium text-ink font-body">
            Ready to feel the difference?
          </p>
          <MagneticWrap radius={14} strength={0.25}>
            <Button href="/appointment" variant="primary" size="md">
              Book an Appointment
            </Button>
          </MagneticWrap>
        </div>
      </Container>
    </Section>
  );
};

export default Comparison;
