"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Play, ExternalLink } from "lucide-react";
import cloudinaryLoader from "@/src/lib/media/cloudinary-loader";

export interface VideoFacadeProps {
  youtubeId: string;
  title: string;
  thumbnail?: {
    url: string;
    width?: number;
    height?: number;
    blur?: string;
  };
  startSeconds?: number | null;
  caption?: string;
  isOwnerPreview?: boolean;
  className?: string;
}

export function VideoFacade({
  youtubeId,
  title,
  thumbnail,
  startSeconds,
  caption,
  isOwnerPreview = false,
  className = "",
}: VideoFacadeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const thumbnailImgRef = useRef<HTMLImageElement>(null);

  // Build embed URL strictly from validated ID & parameters
  const embedParams = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    playsinline: "1",
    modestbranding: "1",
  });
  if (typeof startSeconds === "number" && startSeconds > 0) {
    embedParams.set("start", String(startSeconds));
  }
  const embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeId}?${embedParams.toString()}`;
  const directWatchUrl = `https://www.youtube.com/watch?v=${youtubeId}${
    startSeconds ? `&t=${startSeconds}s` : ""
  }`;

  // Focus iframe on load
  const handleIframeLoad = () => {
    if (iframeRef.current) {
      iframeRef.current.focus();
    }
  };

  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* 16:9 Aspect Ratio Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video rounded-2xl overflow-hidden bg-ink/95 border border-line/60 shadow-md group transition-transform duration-300"
      >
        {!isPlaying ? (
          <>
            {/* Optimized Cloudinary Thumbnail with Blur Placeholder */}
            {thumbnail?.url ? (
              <Image
                ref={thumbnailImgRef}
                loader={cloudinaryLoader}
                src={thumbnail.url}
                alt={title ? `Thumbnail of ${title}` : "Video thumbnail"}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
                className="object-cover w-full h-full transform transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transform-none"
                placeholder={thumbnail.blur ? "blur" : "empty"}
                blurDataURL={thumbnail.blur}
                priority={false}
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-ink/90 to-ink/70 flex items-center justify-center">
                <Play className="w-16 h-16 text-white/40" />
              </div>
            )}

            {/* Gradient Overlays for Readability & Cinematic Depth */}
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-black/40 pointer-events-none" />

            {/* Accessible Play Button and Title */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6 z-10 pointer-events-none">
              <div className="flex items-start justify-between">
                <h3 className="font-display font-medium text-white text-base sm:text-lg line-clamp-2 max-w-xl drop-shadow-md">
                  {title}
                </h3>
                <span className="shrink-0 px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase rounded-full bg-white/20 text-white backdrop-blur-md border border-white/20">
                  YouTube
                </span>
              </div>

              <div className="flex items-center justify-center">
                <button
                  ref={playButtonRef}
                  type="button"
                  onClick={handlePlayClick}
                  aria-label={`Play video: ${title}`}
                  className="pointer-events-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand text-white flex items-center justify-center shadow-2xl shadow-brand/40 hover:bg-brand-accent hover:scale-110 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/50 motion-reduce:transform-none cursor-pointer"
                >
                  <Play className="w-7 h-7 sm:w-9 sm:h-9 translate-x-0.5 fill-current" />
                </button>
              </div>

              <div className="text-center">
                <p className="text-[12px] sm:text-xs text-white/80 font-body drop-shadow">
                  Click to play • Plays in privacy-enhanced mode
                </p>
              </div>
            </div>
          </>
        ) : isOwnerPreview ? (
          /* Owner Preview / Editor: CSP frame-src is 'none', do NOT load iframes */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-ink text-white text-center space-y-4">
            <Play className="w-12 h-12 text-brand mx-auto opacity-70" />
            <div className="space-y-1">
              <p className="font-medium text-sm sm:text-base">
                Playback is disabled in preview
              </p>
              <p className="text-xs text-white/70 max-w-md">
                Owner administrative security policy disables external embeds in this view.
              </p>
            </div>
            <a
              href={directWatchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs font-medium text-white transition-colors"
            >
              Open on YouTube
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          /* Public Player: Privacy-Enhanced Embed iframe */
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title={title}
            onLoad={handleIframeLoad}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            loading="lazy"
            className="w-full h-full border-0 absolute inset-0"
          />
        )}
      </div>

      {/* Caption & Privacy Information */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
        {caption ? (
          <p className="italic text-ink/80 text-xs sm:text-sm">{caption}</p>
        ) : (
          <span className="text-[12px] text-ink-muted/80">
            This video plays from YouTube in privacy-enhanced mode after you click.
          </span>
        )}

        <a
          href={directWatchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-brand underline underline-offset-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand rounded transition-colors text-[12px]"
        >
          Watch on YouTube
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Fallback for JavaScript-disabled clients */}
      <noscript>
        <div className="mt-2 p-3 bg-paper-sunken border border-line rounded-lg text-xs text-ink text-center">
          <p>JavaScript is required to play embedded video.</p>
          <a
            href={directWatchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand font-medium underline mt-1 inline-block"
          >
            Watch &quot;{title}&quot; directly on YouTube
          </a>
        </div>
      </noscript>
    </div>
  );
}
