"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/components/animations";

export interface AccordionItemData {
  id: string;
  title: string;
  content: React.ReactNode;
  badge?: string;
}

export interface AccordionProps {
  items: AccordionItemData[];
  headingLevel?: "h2" | "h3" | "h4";
  defaultOpenId?: string | null;
  className?: string;
  onItemToggle?: (id: string | null) => void;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  headingLevel = "h3",
  defaultOpenId = null,
  className = "",
  onItemToggle,
}) => {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const panelRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prefersReducedMotion = useReducedMotion();

  const HeadingTag = headingLevel;

  const toggleItem = useCallback(
    (id: string) => {
      const nextId = openId === id ? null : id;
      setOpenId(nextId);
      onItemToggle?.(nextId);
    },
    [openId, onItemToggle]
  );

  // Animate panel expand/collapse with GSAP
  useEffect(() => {
    items.forEach((item) => {
      const panel = panelRefs.current.get(item.id);
      if (!panel) return;

      const isOpen = openId === item.id;

      if (prefersReducedMotion) {
        if (isOpen) {
          panel.style.display = "block";
          panel.style.height = "auto";
          panel.style.opacity = "1";
        } else {
          panel.style.display = "none";
          panel.style.height = "0px";
          panel.style.opacity = "0";
        }
        ScrollTrigger.refresh();
        return;
      }

      if (isOpen) {
        panel.style.display = "block";
        gsap.killTweensOf(panel);
        gsap.fromTo(
          panel,
          { height: 0, opacity: 0 },
          {
            height: "auto",
            opacity: 1,
            duration: 0.35,
            ease: "power2.out",
            onComplete: () => {
              gsap.set(panel, { clearProps: "height" });
              ScrollTrigger.refresh();
            },
          }
        );
      } else if (panel.style.display !== "none") {
        gsap.killTweensOf(panel);
        gsap.to(panel, {
          height: 0,
          opacity: 0,
          duration: 0.25,
          ease: "power2.inOut",
          onComplete: () => {
            panel.style.display = "none";
            ScrollTrigger.refresh();
          },
        });
      }
    });
  }, [openId, items, prefersReducedMotion]);

  // Keyboard navigation across accordion headers
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const triggerButtons = Array.from(triggerRefs.current.values()).filter(Boolean);
    const count = triggerButtons.length;
    if (count === 0) return;

    let targetIndex: number | null = null;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        targetIndex = (index + 1) % count;
        break;
      case "ArrowUp":
        e.preventDefault();
        targetIndex = (index - 1 + count) % count;
        break;
      case "Home":
        e.preventDefault();
        targetIndex = 0;
        break;
      case "End":
        e.preventDefault();
        targetIndex = count - 1;
        break;
      default:
        break;
    }

    if (targetIndex !== null) {
      triggerButtons[targetIndex]?.focus();
    }
  };

  return (
    <div ref={containerRef} className={`divide-y divide-surface-alt/80 ${className}`}>
      {items.map((item, index) => {
        const isOpen = openId === item.id;
        const triggerId = `accordion-trigger-${item.id}`;
        const panelId = `accordion-panel-${item.id}`;

        return (
          <div key={item.id} className="py-2 first:pt-0 last:pb-0">
            <HeadingTag className="m-0 text-base font-semibold">
              <button
                id={triggerId}
                ref={(el) => {
                  if (el) triggerRefs.current.set(item.id, el);
                  else triggerRefs.current.delete(item.id);
                }}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleItem(item.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="group flex w-full items-center justify-between gap-4 py-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-xl px-3 hover:bg-surface-alt/40"
              >
                <span className="font-display text-base sm:text-lg font-bold text-ink group-hover:text-brand transition-colors">
                  {item.title}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  {item.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-accent/20 text-accent-dark">
                      {item.badge}
                    </span>
                  )}
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full bg-surface-alt text-ink transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-brand text-white" : "group-hover:bg-brand/10"
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
              </button>
            </HeadingTag>

            <div
              id={panelId}
              ref={(el) => {
                if (el) panelRefs.current.set(item.id, el);
                else panelRefs.current.delete(item.id);
              }}
              role="region"
              aria-labelledby={triggerId}
              style={{
                display: isOpen ? "block" : "none",
                height: isOpen ? "auto" : 0,
                opacity: isOpen ? 1 : 0,
                overflow: "hidden",
              }}
              className="px-3 pb-4 pt-1"
            >
              <div className="text-sm sm:text-base text-ink-muted leading-relaxed font-body">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
