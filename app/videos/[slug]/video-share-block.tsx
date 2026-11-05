"use client";

import { useState } from "react";
import { Share2, Copy, CheckCheck, MessageCircle, Mail } from "lucide-react";

export function VideoShareBlock({
  title,
  className = "",
}: {
  title: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const currentUrl =
    typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `Watch: ${title} - ${currentUrl}`
  )}`;

  const emailHref = `mailto:?subject=${encodeURIComponent(
    `Dental Video: ${title}`
  )}&body=${encodeURIComponent(
    `I thought you might find this clinical walkthrough helpful:\n\n${title}\n\nWatch here: ${currentUrl}`
  )}`;

  return (
    <div
      aria-label="Share video options"
      className={`p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-3 ${className}`}
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink pb-2.5 border-b border-line/60">
        <Share2 className="w-4 h-4 text-brand" />
        <span>Share Video</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Link copied to clipboard" : "Copy video link"}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-line bg-white hover:bg-black/5 text-ink transition-all min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {copied ? (
            <>
              <CheckCheck className="w-4 h-4 text-emerald-600 mb-1" />
              <span className="text-[11px] font-medium text-emerald-600">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-ink-muted mb-1" />
              <span className="text-[11px] font-medium text-ink">Copy Link</span>
            </>
          )}
        </button>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share via WhatsApp"
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-line bg-white hover:bg-black/5 text-ink transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <MessageCircle className="w-4 h-4 text-emerald-500 mb-1" />
          <span className="text-[11px] font-medium text-ink">WhatsApp</span>
        </a>

        <a
          href={emailHref}
          aria-label="Share via Email"
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-line bg-white hover:bg-black/5 text-ink transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Mail className="w-4 h-4 text-brand mb-1" />
          <span className="text-[11px] font-medium text-ink">Email</span>
        </a>
      </div>
    </div>
  );
}

