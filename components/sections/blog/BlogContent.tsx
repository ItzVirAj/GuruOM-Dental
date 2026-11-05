"use client";

import React from "react";
import Image from "next/image";
import { Link as LinkIcon, Lightbulb, Info, AlertTriangle } from "lucide-react";
import { ContentBlock, InlineRun, isSafeLink } from "@/src/lib/blog-content";
import { SmartImage } from "@/components/ui/SmartImage";
import cloudinaryLoader from "@/src/lib/media/cloudinary-loader";
import type { ResolvedMedia } from "@/src/server/blog/types";
import type { PublicVideoDTO } from "@/src/server/videos/queries";
import { VideoFacade } from "@/components/video/VideoFacade";

export interface BlogContentProps {
  content: ContentBlock[];
  resolvedMediaMap?: Record<string, ResolvedMedia>;
  resolvedVideosMap?: Record<string, PublicVideoDTO>;
  isOwnerPreview?: boolean;
}

export const RenderRuns: React.FC<{
  runs?: InlineRun[];
  fallbackText?: string;
}> = ({ runs, fallbackText }) => {
  if (runs && runs.length > 0) {
    return (
      <>
        {runs.map((run, i) => {
          let node: React.ReactNode = run.text;
          if (run.marks?.includes("bold")) {
            node = <strong>{node}</strong>;
          }
          if (run.marks?.includes("italic")) {
            node = <em>{node}</em>;
          }
          if (run.href && isSafeLink(run.href)) {
            const isExternal =
              run.href.startsWith("https://") ||
              run.href.startsWith("mailto:") ||
              run.href.startsWith("tel:");
            node = (
              <a
                href={run.href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="text-brand font-medium underline underline-offset-2 hover:text-brand-dark transition-colors"
              >
                {node}
              </a>
            );
          }
          return <React.Fragment key={i}>{node}</React.Fragment>;
        })}
      </>
    );
  }
  return <>{fallbackText || ""}</>;
};

export const BlogContent: React.FC<BlogContentProps> = ({
  content,
  resolvedMediaMap,
  resolvedVideosMap,
  isOwnerPreview = false,
}) => {
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
                <RenderRuns runs={block.runs} fallbackText={block.text} />
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
                    {typeof item === "string" ? (
                      item
                    ) : (
                      <RenderRuns runs={item} />
                    )}
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
                <p>
                  &ldquo;
                  <RenderRuns runs={block.runs} fallbackText={block.text} />
                  &rdquo;
                </p>
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
                    <RenderRuns runs={block.runs} fallbackText={block.text} />
                  </p>
                </div>
              </aside>
            );
          }

          case "image": {
            const resolved = block.mediaId ? resolvedMediaMap?.[block.mediaId] : null;
            const isWide = block.layout === "wide";
            const figureClass = isWide
              ? "my-10 -mx-4 sm:-mx-8 md:-mx-12 lg:-mx-16 space-y-2.5 transition-all"
              : "my-8 space-y-2";

            const altText = block.alt || resolved?.alt || "";
            const isDecorative = Boolean(resolved?.decorative && !block.alt);

            return (
              <figure key={`block-${index}`} className={figureClass}>
                <div className="rounded-2xl overflow-hidden border border-line bg-surface-alt shadow-sm">
                  {resolved ? (
                    <Image
                      loader={cloudinaryLoader}
                      src={resolved.publicId}
                      alt={isDecorative ? "" : altText}
                      role={isDecorative ? "presentation" : undefined}
                      width={resolved.width}
                      height={resolved.height}
                      placeholder={resolved.blurDataUrl ? "blur" : "empty"}
                      blurDataURL={resolved.blurDataUrl || undefined}
                      sizes={
                        isWide
                          ? "(max-width: 1024px) 100vw, 1100px"
                          : "(max-width: 768px) 100vw, 800px"
                      }
                      className="w-full h-auto object-cover max-h-[700px]"
                    />
                  ) : (
                    <SmartImage
                      slot={block.slot}
                      alt={block.alt || (typeof block.caption === "string" ? block.caption : "Blog illustration")}
                      ratio="16/9"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                {(block.caption || (block as { captionRuns?: InlineRun[] }).captionRuns) && (
                  <figcaption className="text-center text-xs sm:text-sm text-ink-muted italic px-4">
                    <RenderRuns
                      runs={Array.isArray(block.caption) ? block.caption : (block as { captionRuns?: InlineRun[] }).captionRuns}
                      fallbackText={typeof block.caption === "string" ? block.caption : undefined}
                    />
                  </figcaption>
                )}
              </figure>
            );
          }

          case "youtube": {
            const resolvedVideo = resolvedVideosMap ? resolvedVideosMap[block.videoId] : undefined;
            // Silently skip if video is not live, missing, or draft
            if (!resolvedVideo) {
              return null;
            }

            return (
              <figure key={`block-${index}`} className="my-8 space-y-2">
                <VideoFacade
                  youtubeId={resolvedVideo.youtubeId}
                  title={resolvedVideo.title}
                  thumbnail={resolvedVideo.thumbnail}
                  startSeconds={resolvedVideo.startSeconds}
                  caption={block.caption}
                  isOwnerPreview={isOwnerPreview}
                />
                {(block.captionRuns || block.caption) && (
                  <figcaption className="text-center text-xs text-ink-muted italic">
                    <RenderRuns
                      runs={block.captionRuns}
                      fallbackText={block.caption}
                    />
                  </figcaption>
                )}
              </figure>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
};
