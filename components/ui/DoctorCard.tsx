"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SmartImage } from "./SmartImage";
import { Badge } from "./Badge";
import { Doctor } from "@/data/doctors";

export interface DoctorCardProps {
  doctor: Doctor;
  className?: string;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor: doc, className = "" }) => {
  return (
    <div
      className={`group relative flex flex-col h-full rounded-2xl bg-surface border border-surface-alt/90 p-4 transition-all duration-300 hover:border-brand/40 hover:shadow-lg ${className}`}
      aria-label={`Clinical profile of ${doc.name}, ${doc.role}`}
    >
      {/* Portrait Image (Ratio 3/4) with Zoom & Overlay */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-surface-alt">
        <SmartImage
          slot={doc.imageSlot}
          alt={`${doc.name} - ${doc.role}`}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Glass Chip: Experience Years */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-dark/80 backdrop-blur-md text-[11px] font-medium text-white border border-white/10 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            {doc.experienceYears}+ Yrs Exp
          </span>
        </div>
      </div>

      {/* Card Content Details */}
      <div className="flex flex-col flex-1 pt-4 pb-2 px-1">
        {/* Specialties Badges */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {doc.specialties.map((spec) => (
            <Badge
              key={spec}
              variant="accent"
              size="sm"
              className="text-[10px] uppercase tracking-wider py-0.5 px-2 font-medium"
            >
              {spec}
            </Badge>
          ))}
        </div>

        {/* Doctor Name (h3 for semantic hierarchy) */}
        <h3 className="font-display text-lg sm:text-xl font-bold text-ink group-hover:text-brand transition-colors line-clamp-1">
          {doc.name}
        </h3>

        {/* Role */}
        <p className="text-xs font-medium text-brand mt-1 line-clamp-1">
          {doc.role}
        </p>

        {/* Short Bio Snippet */}
        <p className="text-xs text-ink-muted leading-relaxed mt-2 line-clamp-2">
          {doc.shortBio}
        </p>

        {/* Bottom Card Footer: Qualification */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-surface-alt/70 text-xs">
          <span className="text-ink-muted font-medium">
            {doc.qualifications[0]}
          </span>
          <span className="text-accent font-semibold text-xs">
            {doc.qualifications.slice(1).join(" • ") || "Specialist"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
