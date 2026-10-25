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
      {/* Author & Reviewer Card */}
      <div className="p-6 rounded-3xl bg-surface/60 border border-line space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Author Details */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
              <User className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-ink-muted block">
                Written By
              </span>
              <h4 className="font-display font-semibold text-ink text-base">
                {authorName}
              </h4>
              <p className="text-xs text-ink-muted">{authorRole}</p>
            </div>
          </div>

          {/* Clinical Peer Review Badge */}
          {reviewingDoctor && (
            <Link
              href={`/doctors/${reviewingDoctor.slug}`}
              className="group flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-line hover:border-brand/40 transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-surface-alt">
                <SmartImage
                  slot={reviewingDoctor.imageSlot}
                  alt={reviewingDoctor.name}
                  ratio="1/1"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left pr-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-success">
                  <ShieldCheck className="w-3 h-3 text-success" />
                  Medically Reviewed
                </span>
                <span className="block text-xs font-semibold text-ink group-hover:text-brand transition-colors">
                  {reviewingDoctor.name}
                </span>
                <span className="text-[10px] text-ink-muted block truncate max-w-[160px]">
                  {reviewingDoctor.role}
                </span>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Mandatory Clinical Advice Disclaimer */}
      <div
        role="note"
        aria-label="Medical advice disclaimer"
        className="p-4 rounded-2xl bg-surface-alt/70 border border-line flex items-start gap-3 text-xs text-ink-muted leading-relaxed"
      >
        <AlertCircle className="w-4 h-4 text-brand shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          <strong>Medical Disclaimer:</strong> This article is for general informational and educational
          purposes only and does not constitute clinical dental or medical diagnosis. Please consult a qualified
          dentist regarding your personal oral health situation.
        </p>
      </div>
    </div>
  );
};
