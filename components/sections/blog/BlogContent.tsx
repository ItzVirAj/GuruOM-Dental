"use client";

import React from "react";
import { Link as LinkIcon, Lightbulb, Info, AlertTriangle } from "lucide-react";
import { ContentBlock } from "@/data/blog";
import { SmartImage } from "@/components/ui/SmartImage";

export interface BlogContentProps {
  content: ContentBlock[];
}

export const BlogContent: React.FC<BlogContentProps> = ({ content }) => {
  return (
    <div className="space-y-6 text-ink font-body leading-relaxed text-base sm:text-lg">
      {content.map((block, index) => {
        switch (block.type) {
          case "heading": {
            const HeadingTag = block.level === 2 ? "h2" : "h3";
            const headingId =
              block.id ||
              block.text
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)+/g, "");

            return (
              <HeadingTag
                key={`block-${index}`}
                id={headingId}
                className={`group flex items-center gap-2 font-display text-ink tracking-tight scroll-mt-28 ${
                  block.level === 2
                    ? "text-display-xs sm:text-display-sm pt-6 pb-1 border-b border-line/60"
                    : "text-lg sm:text-xl pt-4 font-semibold"
                }`}
              >
                <span>{block.text}</span>
                <a
                  href={`#${headingId}`}
                  aria-label={`Direct link to ${block.text}`}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-ink-muted hover:text-brand focus-visible:opacity-100 focus-visible:outline-none"
                >
                  <LinkIcon className="w-4 h-4" />
                </a>
              </HeadingTag>
            );
          }

          case "paragraph":
            return (
              <p
                key={`block-${index}`}
                className="text-ink/85 leading-relaxed font-body text-sm sm:text-base"
              >
                {block.text}
              </p>
            );

          case "list": {
            const ListTag = block.ordered ? "ol" : "ul";
            return (
              <ListTag
                key={`block-${index}`}
                className={`space-y-2.5 my-4 pl-6 text-sm sm:text-base text-ink/85 ${
                  block.ordered
                    ? "list-decimal marker:font-semibold marker:text-brand"
                    : "list-disc marker:text-brand"
                }`}
              >
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="leading-relaxed pl-1">
                    {item}
                  </li>
                ))}
              </ListTag>
            );
          }

          case "quote":
            return (
              <blockquote
                key={`block-${index}`}
                className="my-6 pl-5 border-l-4 border-brand bg-brand/5 p-4 sm:p-5 rounded-r-2xl italic text-ink text-sm sm:text-base leading-relaxed"
              >
                <p>&ldquo;{block.text}&rdquo;</p>
                {block.cite && (
                  <cite className="not-italic block mt-2 text-xs font-semibold text-brand-dark tracking-wide">
                    — {block.cite}
                  </cite>
                )}
              </blockquote>
            );

          case "callout": {
            const isTip = block.tone === "tip";
            const isWarning = block.tone === "warning";

            const toneStyles = isTip
              ? "bg-success/10 border-success/30 text-ink"
              : isWarning
              ? "bg-warning/10 border-warning/30 text-ink"
              : "bg-surface border-brand/30 text-brand-dark";

            const IconComponent = isTip
              ? Lightbulb
              : isWarning
              ? AlertTriangle
              : Info;

            const iconColor = isTip
              ? "text-success"
              : isWarning
              ? "text-warning"
              : "text-brand";

            return (
              <aside
                key={`block-${index}`}
                role="note"
                className={`my-6 p-4 sm:p-5 rounded-2xl border ${toneStyles} flex items-start gap-3.5`}
              >
                <IconComponent
                  className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`}
                  aria-hidden="true"
                />
                <div className="space-y-1 flex-1 min-w-0">
                  <h4 className="font-display font-semibold text-xs sm:text-sm tracking-tight">
                    {block.title}
                  </h4>
                  <p className="text-xs sm:text-sm leading-relaxed opacity-90 font-body">
                    {block.text}
                  </p>
                </div>
              </aside>
            );
          }

          case "image":
            return (
              <figure key={`block-${index}`} className="my-8 space-y-2">
                <div className="rounded-2xl overflow-hidden border border-line bg-surface-alt">
                  <SmartImage
                    slot={block.slot}
                    alt={block.caption || "Blog illustration"}
                    ratio="16/9"
                    className="w-full h-full object-cover"
                  />
                </div>
                {block.caption && (
                  <figcaption className="text-center text-xs text-ink-muted italic">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};
