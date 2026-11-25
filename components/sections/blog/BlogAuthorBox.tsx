"use client";

import React from "react";
import Link from "next/link";
import { User, ShieldCheck, AlertCircle } from "lucide-react";
import { doctorsData } from "@/data/doctors";
import { SmartImage } from "@/components/ui/SmartImage";

export interface BlogAuthorBoxProps {
  authorName: string;
  authorRole: string;
  reviewedBySlug?: string;
}

export const BlogAuthorBox: React.FC<BlogAuthorBoxProps> = ({
  authorName,
  authorRole,
  reviewedBySlug,
}) => {
  const reviewingDoctor = reviewedBySlug
    ? doctorsData.find((d) => d.slug === reviewedBySlug)
    : undefined;

  return (
    <div className="space-y-6 pt-8 border-t border-line">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        {/* Author Attribution */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-surface border border-line text-brand-dark flex items-center justify-center shrink-0">
            <User className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs text-ink-muted">Written by</p>
            <h4 className="font-just-serif font-normal text-ink text-lg leading-snug">
              {authorName}
            </h4>
            <p className="text-xs text-ink-muted">{authorRole}</p>
          </div>
        </div>

        {/* Clinical Peer Review Link */}
        {reviewingDoctor && (
          <Link
            href="/about"
            className="group flex items-center gap-3 p-3 rounded-xl bg-surface border border-line hover:border-brand-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-surface-alt">
              <SmartImage
                slot={reviewingDoctor.imageSlot}
                alt={reviewingDoctor.name}
                ratio="1/1"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left pr-1">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                <ShieldCheck className="w-3.5 h-3.5 text-success" aria-hidden="true" />
                <span>Medically reviewed</span>
              </span>
              <span className="block text-sm font-semibold text-ink group-hover:text-brand-dark transition-colors">
                {reviewingDoctor.name}
              </span>
              <span className="text-xs text-ink-muted block truncate max-w-[180px]">
                {reviewingDoctor.role}
              </span>
            </div>
          </Link>
        )}
      </div>

      {/* Clinical Advice Note */}
      <div
        role="note"
        aria-label="Medical advice disclaimer"
        className="p-4 rounded-xl bg-surface border border-line flex items-start gap-3 text-xs text-ink-muted leading-relaxed"
      >
        <AlertCircle className="w-4 h-4 text-ink-muted shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          <strong className="text-ink font-medium">Medical disclaimer:</strong> This article is for educational purposes and does not replace a clinical examination. Consult a qualified dentist regarding your individual care.
        </p>
      </div>
    </div>
  );
};
