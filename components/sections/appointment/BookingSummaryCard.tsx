"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Phone,
  MessageCircle,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { servicesData } from "@/data/services";
import { doctorsData } from "@/data/doctors";
import { carePlans } from "@/data/pricing";
import { siteConfig } from "@/data/site";
import { SmartImage } from "@/components/ui/SmartImage";
import { Badge } from "@/components/ui/Badge";

export interface BookingSummaryCardProps {
  serviceSlug: string;
  doctorSlug: string;
  visitType: "first-visit" | "follow-up" | "emergency";
  date: string;
  timeSlot: string;
  flexible?: boolean;
  planId?: string;
  className?: string;
}

export const BookingSummaryCard: React.FC<BookingSummaryCardProps> = ({
  serviceSlug,
  doctorSlug,
  visitType,
  date,
  timeSlot,
  flexible,
  planId,
  className = "",
}) => {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const selectedService = servicesData.find((s) => s.slug === serviceSlug);
  const selectedDoctor =
    doctorSlug === "any"
      ? {
          name: "Any Available Doctor",
          role: "Next Available Clinical Specialist",
          imageSlot: "doctor1",
        }
      : doctorsData.find((d) => d.slug === doctorSlug);

  const selectedPlan = carePlans.find((p) => p.id === planId);

  const formattedDate = date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Not selected yet";

  const visitTypeLabels: Record<string, string> = {
    "first-visit": "First Consultation",
    "follow-up": "Follow-Up Visit",
    emergency: "Urgent Care",
  };

  const summaryContent = (
    <div className="space-y-5">
      {/* Items Breakdown */}
      <div className="space-y-3.5 text-xs">
        {/* Service Item */}
        <div className="flex items-start gap-3 p-3 rounded-2xl bg-surface border border-line">
          <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0 mt-0.5">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-ink-muted block">
              Treatment
            </span>
            <span className="font-semibold text-ink block truncate">
              {selectedService ? selectedService.title : "Select a service..."}
            </span>
            {selectedService && (
              <span className="text-[11px] text-ink-muted">
                Est. {selectedService.duration}
              </span>
            )}
          </div>
        </div>

        {/* Doctor Item */}
        <div className="flex items-start gap-3 p-3 rounded-2xl bg-surface border border-line">
          <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-line bg-surface-alt mt-0.5">
            {selectedDoctor?.imageSlot ? (
              <SmartImage
                slot={selectedDoctor.imageSlot}
                alt={selectedDoctor.name}
                ratio="1/1"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-brand/10 text-brand">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-ink-muted block">
              Specialist
            </span>
            <span className="font-semibold text-ink block truncate">
              {selectedDoctor ? selectedDoctor.name : "Select doctor..."}
            </span>
            <span className="text-[11px] text-ink-muted block truncate">
              {selectedDoctor ? selectedDoctor.role : "Specialist"}
            </span>
          </div>
        </div>

        {/* Date & Time Slot */}
        <div className="flex items-start gap-3 p-3 rounded-2xl bg-surface border border-line">
          <div className="w-8 h-8 rounded-xl bg-accent/20 text-brand flex items-center justify-center shrink-0 mt-0.5">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-ink-muted block">
              Schedule
            </span>
            <span className="font-semibold text-ink block">{formattedDate}</span>
            <span className="text-[11px] text-ink-muted flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3 h-3 text-brand" />
              <span>
                {timeSlot ? timeSlot : "Select time slot"}
                {flexible && " (Flexible)"}
              </span>
            </span>
          </div>
        </div>

        {/* Visit Type & Plan Tag */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge variant="outline" size="sm">
            {visitTypeLabels[visitType] || "First Consultation"}
          </Badge>
          {selectedPlan && (
            <Badge variant="accent" size="sm">
              <Sparkles className="w-3 h-3 mr-1 inline" />
              Plan: {selectedPlan.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Need Help Booking Assistance */}
      <div className="pt-4 border-t border-line space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-ink">
          <HelpCircle className="w-4 h-4 text-brand" />
          <span>Need help scheduling?</span>
        </div>

        <p className="text-xs text-ink-muted leading-relaxed">
          Our front desk team is on standby to assist with urgent toothaches or custom corporate
          slots.
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <a
            href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-line bg-surface hover:border-brand hover:text-brand font-medium transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Us</span>
          </a>

          <a
            href={siteConfig.socials.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-line bg-surface hover:border-emerald-500 hover:text-emerald-600 font-medium transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Operating Hours Note */}
        <div className="text-[11px] text-ink-muted/80 bg-surface-alt/60 p-2.5 rounded-xl border border-line/60">
          <span className="font-semibold block text-ink">Clinic Timings</span>
          <span>{siteConfig.workingHours.weekdays}</span>
          <br />
          <span>{siteConfig.workingHours.saturday}</span>
        </div>

        {/* Clinical Reassurance Badges */}
        <ul className="space-y-1.5 pt-1 text-[11px] text-ink-muted">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>No advance payment needed to book</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>We confirm every slot by direct phone call</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Reschedule or cancel anytime at no fee</span>
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Collapsible Bar (visible on < lg) */}
      <div className="lg:hidden w-full mb-6">
        <div className="bg-white border border-line rounded-2xl shadow-soft overflow-hidden">
          <button
            type="button"
            onClick={() => setMobileExpanded((prev) => !prev)}
            className="w-full p-4 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-brand"
            aria-expanded={mobileExpanded}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-accent" />
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted block">
                  Your Booking Summary
                </span>
                <span className="text-sm font-semibold text-ink">
                  {selectedService ? selectedService.title : "Step 1 of 3"} •{" "}
                  {timeSlot ? `${formattedDate} (${timeSlot})` : "Scheduling"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-brand">
              <span>{mobileExpanded ? "Hide" : "Details"}</span>
              {mobileExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </button>

          {mobileExpanded && (
            <div className="p-4 pt-1 border-t border-line bg-surface/50">
              {summaryContent}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Sticky Summary Card (visible on lg+) */}
      <aside
        className={`hidden lg:block sticky top-28 w-full ${className}`}
        aria-label="Appointment summary"
      >
        <div className="bg-white border border-line rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between pb-4 border-b border-line mb-5">
            <h3 className="font-display font-semibold text-ink text-base">
              Your Booking Summary
            </h3>
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" aria-hidden="true" />
          </div>

          {summaryContent}
        </div>
      </aside>
    </>
  );
};
