"use client";

import React, { useState } from "react";
import { Share2, Copy, CheckCheck, MessageCircle, Mail } from "lucide-react";

export interface BlogShareBlockProps {
  title: string;
  url?: string;
  className?: string;
}

export const BlogShareBlock: React.FC<BlogShareBlockProps> = ({
  title,
  url,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  // Compute full URL on client if not explicitly passed
  const currentUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");

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
    `${title} - Read more at: ${currentUrl}`
  )}`;

  const emailHref = `mailto:?subject=${encodeURIComponent(
    `Interesting Dental Article: ${title}`
  )}&body=${encodeURIComponent(
    `I thought you might find this article from GuruOm Dental helpful:\n\n${title}\n\nRead here: ${currentUrl}`
  )}`;

  return (
    <div
      aria-label="Share article options"
      className={`p-5 rounded-3xl bg-white border border-line shadow-soft space-y-3 ${className}`}
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink pb-2.5 border-b border-line">
        <Share2 className="w-4 h-4 text-brand" />
        <span>Share This Guide</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* Copy Link Button */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Link copied to clipboard" : "Copy article link"}
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-line bg-surface hover:bg-surface-alt hover:border-brand/40 text-ink transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {copied ? (
            <CheckCheck className="w-4 h-4 text-emerald-600 mb-1" />
          ) : (
            <Copy className="w-4 h-4 text-brand mb-1" />
          )}
          <span className="text-[11px] font-medium">
            {copied ? "Copied" : "Copy"}
          </span>
        </button>

        {/* WhatsApp Share */}
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share this guide via WhatsApp"
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-line bg-surface hover:bg-emerald-50 hover:border-emerald-300 text-ink hover:text-emerald-700 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600 mb-1" />
          <span className="text-[11px] font-medium">WhatsApp</span>
        </a>

        {/* Email Share */}
        <a
          href={emailHref}
          aria-label="Share this guide via Email"
          className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-line bg-surface hover:bg-surface-alt hover:border-brand/40 text-ink hover:text-brand transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Mail className="w-4 h-4 text-brand mb-1" />
          <span className="text-[11px] font-medium">Email</span>
        </a>
      </div>

      {/* Screen Reader Notification */}
      <div aria-live="polite" className="sr-only">
        {copied ? "Article link copied to clipboard" : ""}
      </div>
    </div>
  );
};
