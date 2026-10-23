"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ArrowRight, FileText } from "lucide-react";
import { treatmentPriceGroups, PriceGroup } from "@/data/pricing";
import { Container, Button } from "@/components/ui";
import { Reveal, useReducedMotion } from "@/components/animations";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export interface PriceListProps {
  groups?: PriceGroup[];
}

export function PriceList({ groups = treatmentPriceGroups }: PriceListProps) {
  const [activeGroupId, setActiveGroupId] = useState<string>(groups[0]?.id || "preventive");
  const prefersReducedMotion = useReducedMotion();

  const activeGroup = groups.find((g) => g.id === activeGroupId) || groups[0];
  const tableBodyRef = useRef<HTMLTableSectionElement | null>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Animate row entrance when active group changes
  const animateRows = useCallback(() => {
    if (!tableBodyRef.current) return;

    if (prefersReducedMotion) {
      ScrollTrigger.refresh();
      return;
    }

    const rows = tableBodyRef.current.querySelectorAll("tr");
    if (!rows.length) return;

    gsap.killTweensOf(rows);
    gsap.fromTo(
      rows,
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.35,
        stagger: 0.04,
        ease: "power2.out",
        onComplete: () => {
          ScrollTrigger.refresh();
        },
      }
    );
  }, [prefersReducedMotion]);

  useEffect(() => {
    animateRows();
  }, [activeGroupId, animateRows]);

  // Keyboard navigation for tablist
  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    const tabs = groups.map((g) => tabRefs.current.get(g.id)).filter(Boolean);
    const count = tabs.length;
    if (count === 0) return;

    let targetIndex: number | null = null;

    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      targetIndex = (index + 1) % count;
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      targetIndex = (index - 1 + count) % count;
    } else if (e.key === "Home") {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      targetIndex = count - 1;
    }

    if (targetIndex !== null) {
      const nextGroup = groups[targetIndex];
      if (nextGroup) {
        setActiveGroupId(nextGroup.id);
        tabs[targetIndex]?.focus();
      }
    }
  };

  return (
    <section
      id="treatment-prices"
      className="py-16 sm:py-20 lg:py-24 bg-surface-alt/60 border-y border-surface-alt"
      aria-labelledby="price-list-heading"
    >
      <Container>
        {/* Section Heading */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand mb-2">
            Standard Fee Schedule
          </span>

          <h2
            id="price-list-heading"
            className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink leading-tight mb-3.5"
          >
            Itemized treatment estimates
          </h2>

          <p className="text-body text-ink-muted leading-relaxed max-w-xl font-body">
            Clear, transparent clinical fee brackets for diagnostic, restorative, aesthetic, and surgical procedures.
          </p>
        </div>

        {/* 2-Column Desktop Grid / Stacked Mobile Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
          {/* Left Column: Category Tabs (Desktop) / Horizontal Scroll Pills (Mobile) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Scrollable container on mobile, vertical stack on desktop */}
            <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
              <div
                role="tablist"
                aria-label="Treatment price categories"
                className="flex lg:flex-col gap-2 min-w-max lg:min-w-0"
              >
                {groups.map((group, index) => {
                  const isActive = group.id === activeGroupId;
                  const tabId = `price-tab-${group.id}`;
                  const panelId = `price-panel-${group.id}`;

                  return (
                    <button
                      key={group.id}
                      id={tabId}
                      ref={(el) => {
                        if (el) tabRefs.current.set(group.id, el);
                        else tabRefs.current.delete(group.id);
                      }}
                      role="tab"
                      type="button"
                      aria-selected={isActive}
                      aria-controls={panelId}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => setActiveGroupId(group.id)}
                      onKeyDown={(e) => handleTabKeyDown(e, index)}
                      className={`text-left px-5 py-3.5 rounded-2xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-brand shrink-0 ${
                        isActive
                          ? "bg-brand text-white shadow-md font-semibold"
                          : "bg-surface hover:bg-surface-alt text-ink/80 border border-surface-alt/80 font-medium"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-display text-sm sm:text-base">
                          {group.title}
                        </span>
                        {isActive && (
                          <ArrowRight className="h-4 w-4 shrink-0 hidden lg:block" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Personalized Quote Box (Desktop) */}
            <div className="hidden lg:block rounded-2xl bg-surface border border-surface-alt/90 p-6 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-brand">
                <FileText className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Bespoke Planning
                </span>
              </div>
              <h4 className="font-display text-base font-bold text-ink">
                Need a written treatment estimate?
              </h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                Receive an itemized digital treatment quote tailored to your intraoral scans and clinical priorities.
              </p>
              <div className="pt-2">
                <Button
                  href="/appointment"
                  variant="primary"
                  size="sm"
                  className="w-full justify-center text-xs"
                >
                  Get a personalised quote
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Semantic Table in Tabpanel */}
          <div className="lg:col-span-8">
            <Reveal variant="up" duration={0.5}>
              <div
                id={`price-panel-${activeGroup.id}`}
                role="tabpanel"
                aria-labelledby={`price-tab-${activeGroup.id}`}
                tabIndex={0}
                className="rounded-3xl bg-surface border border-surface-alt/90 p-6 sm:p-8 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {/* Category Header */}
                <div className="mb-6 pb-4 border-b border-surface-alt">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-ink">
                    {activeGroup.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-muted mt-1 leading-relaxed">
                    {activeGroup.description}
                  </p>
                </div>

                {/* Semantic Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <caption className="sr-only">
                      {`Detailed fee estimates for ${activeGroup.title}`}
                    </caption>
                    <thead>
                      <tr className="border-b border-surface-alt text-xs uppercase tracking-wider text-ink-muted font-bold">
                        <th scope="col" className="pb-3.5 pr-4">
                          Procedure & Clinical Protocol
                        </th>
                        <th scope="col" className="pb-3.5 pl-4 text-right whitespace-nowrap">
                          Estimated Fee
                        </th>
                      </tr>
                    </thead>
                    <tbody ref={tableBodyRef} className="divide-y divide-surface-alt/70">
                      {activeGroup.items.map((item, i) => (
                        <tr key={i} className="group hover:bg-surface-alt/30 transition-colors">
                          <th
                            scope="row"
                            className="py-4 pr-4 font-normal text-ink align-top"
                          >
                            <span className="font-semibold text-sm sm:text-base text-ink block group-hover:text-brand transition-colors">
                              {item.name}
                            </span>
                            {item.note && (
                              <span className="text-xs text-ink-muted mt-0.5 block leading-relaxed">
                                {item.note}
                              </span>
                            )}
                          </th>
                          <td className="py-4 pl-4 text-right align-top whitespace-nowrap">
                            <span className="font-display text-sm sm:text-base font-bold text-brand block">
                              {item.price}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Quote CTA Button */}
                <div className="mt-8 pt-6 border-t border-surface-alt lg:hidden flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <span className="font-display text-sm font-bold text-ink block">
                      Need custom treatment planning?
                    </span>
                    <span className="text-xs text-ink-muted">
                      Full digital diagnosis with zero surprise fees.
                    </span>
                  </div>
                  <Button
                    href="/appointment"
                    variant="primary"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Get a personalised quote
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default PriceList;
