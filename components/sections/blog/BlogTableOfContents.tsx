"use client";

import React, { useState, useEffect } from "react";
import { List, ChevronDown, ChevronUp } from "lucide-react";
import { ScrollTrigger } from "@/lib/gsap";

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface BlogTableOfContentsProps {
  items: TocItem[];
  isMobileDisclosure?: boolean;
}

export const BlogTableOfContents: React.FC<BlogTableOfContentsProps> = ({
  items,
  isMobileDisclosure = false,
}) => {
  const [activeId, setActiveId] = useState<string>(items[0]?.id || "");
  const [isOpen, setIsOpen] = useState(false);

  // Setup ScrollTrigger heading tracking
  useEffect(() => {
    if (items.length === 0) return;

    const triggers: ScrollTrigger[] = [];

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (!el) return;

      const trigger = ScrollTrigger.create({
        trigger: el,
        start: "top 30%",
        end: "bottom 30%",
        onEnter: () => setActiveId(item.id),
        onEnterBack: () => setActiveId(item.id),
      });

      triggers.push(trigger);
    });

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, [items]);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveId(id);
    if (isMobileDisclosure) setIsOpen(false);

    const targetEl = document.getElementById(id);
    if (!targetEl) return;

    // Use Lenis smooth scroll if active on window, else native scrollIntoView
    // @ts-expect-error Lenis instance attached to window or smooth scroll
    if (typeof window !== "undefined" && window.lenis && typeof window.lenis.scrollTo === "function") {
      // @ts-expect-error Lenis call
      window.lenis.scrollTo(targetEl, { offset: -100 });
    } else {
      const y = targetEl.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }

    // Set browser hash cleanly without jarring jump
    window.history.replaceState(null, "", `#${id}`);
  };

  if (items.length === 0) return null;

  // Mobile Disclosure Variant (Top of article on < lg)
  if (isMobileDisclosure) {
    return (
      <div className="lg:hidden w-full mb-8 rounded-2xl border border-line bg-surface/50 overflow-hidden">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-brand"
          aria-expanded={isOpen}
          aria-controls="mobile-toc-list"
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink">
            <List className="w-4 h-4 text-brand" />
            <span>On This Page</span>
          </div>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-ink-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-ink-muted" />
          )}
        </button>

        {isOpen && (
          <nav
            id="mobile-toc-list"
            aria-label="Table of contents"
            className="px-4 pb-4 pt-1 border-t border-line/60 space-y-1.5 text-xs"
          >
            {items.map((item) => {
              const isCurrent = activeId === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleScrollTo(e, item.id)}
                  aria-current={isCurrent ? "true" : undefined}
                  className={`block py-1.5 transition-colors ${
                    item.level === 3 ? "pl-4 text-[11px]" : "font-medium"
                  } ${
                    isCurrent
                      ? "text-brand font-semibold"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {item.text}
                </a>
              );
            })}
          </nav>
        )}
      </div>
    );
  }

  // Desktop Sticky Sidebar Variant
  return (
    <nav
      aria-label="Table of contents"
      className="p-5 rounded-3xl bg-white border border-line shadow-soft space-y-3"
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink pb-2.5 border-b border-line">
        <List className="w-4 h-4 text-brand" />
        <span>On This Page</span>
      </div>

      <ul className="space-y-1 text-xs">
        {items.map((item) => {
          const isCurrent = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleScrollTo(e, item.id)}
                aria-current={isCurrent ? "true" : undefined}
                className={`group flex items-start py-1.5 transition-all duration-200 ${
                  item.level === 3 ? "pl-3.5 text-[11px]" : "font-medium"
                } ${
                  isCurrent
                    ? "text-brand font-semibold translate-x-1"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`mr-2 w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 transition-colors ${
                    isCurrent ? "bg-brand" : "bg-transparent group-hover:bg-line"
                  }`}
                />
                <span className="line-clamp-2">{item.text}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
