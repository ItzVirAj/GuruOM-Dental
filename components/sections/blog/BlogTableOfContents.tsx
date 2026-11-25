"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
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

    // @ts-expect-error Lenis instance attached to window or smooth scroll
    if (typeof window !== "undefined" && window.lenis && typeof window.lenis.scrollTo === "function") {
      // @ts-expect-error Lenis call
      window.lenis.scrollTo(targetEl, { offset: -100 });
    } else {
      const y = targetEl.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }

    window.history.replaceState(null, "", `#${id}`);
  };

  if (items.length === 0) return null;

  if (isMobileDisclosure) {
    return (
      <div className="lg:hidden w-full mb-8 rounded-xl border border-line bg-surface overflow-hidden">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full px-4 py-3 flex items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
          aria-expanded={isOpen}
          aria-controls="mobile-toc-list"
        >
          <span className="text-sm font-semibold text-ink">On this page</span>
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
            className="px-4 pb-4 pt-2 border-t border-line space-y-1.5 text-sm"
          >
            {items.map((item) => {
              const isCurrent = activeId === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleScrollTo(e, item.id)}
                  aria-current={isCurrent ? "true" : undefined}
                  className={`block py-1 transition-colors ${
                    item.level === 3 ? "pl-4 text-xs" : ""
                  } ${
                    isCurrent
                      ? "text-brand-dark font-semibold"
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

  return (
    <nav aria-label="Table of contents" className="space-y-3">
      <p className="text-sm font-semibold text-ink pb-2 border-b border-line">
        On this page
      </p>

      <ul className="space-y-1 text-sm border-l border-line">
        {items.map((item) => {
          const isCurrent = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleScrollTo(e, item.id)}
                aria-current={isCurrent ? "true" : undefined}
                className={`block -ml-px border-l-2 py-1.5 transition-colors ${
                  item.level === 3 ? "pl-5 text-xs" : "pl-3.5"
                } ${
                  isCurrent
                    ? "border-accent text-ink font-semibold"
                    : "border-transparent text-ink-muted hover:text-ink hover:border-line"
                }`}
              >
                <span className="line-clamp-2">{item.text}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
