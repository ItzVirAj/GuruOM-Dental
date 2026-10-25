"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  PhoneCall,
  AlertTriangle,
  MessageCircle,
} from "lucide-react";
import { siteConfig, ClinicOpeningHour } from "@/data/site";

// Crisp SVG icons for social channels
const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const YoutubeIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);

interface ClinicStatus {
  isOpen: boolean;
  statusText: string;
  subText: string;
  currentDayName: string;
}

export const ContactInfoColumn: React.FC = () => {
  // Client-computed status to guarantee hydration match
  const [status, setStatus] = useState<ClinicStatus | null>(null);

  useEffect(() => {
    const computeClinicStatus = (): ClinicStatus => {
      try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: siteConfig.timezone,
          weekday: "long",
          hour: "numeric",
          minute: "numeric",
          hour12: false,
        });

        const parts = formatter.formatToParts(now);
        let weekday = "";
        let hour = 0;
        let minute = 0;

        for (const p of parts) {
          if (p.type === "weekday") weekday = p.value;
          if (p.type === "hour") hour = parseInt(p.value, 10);
          if (p.type === "minute") minute = parseInt(p.value, 10);
        }

        const currentTotalMinutes = hour * 60 + minute;
        const hoursList = siteConfig.openingHours;
        const todaySchedule = hoursList.find(
          (h) => h.day.toLowerCase() === weekday.toLowerCase()
        );

        if (!todaySchedule || todaySchedule.isClosed || !todaySchedule.open || !todaySchedule.close) {
          // Closed today (e.g. Sunday) -> Opens Monday at 9:00 AM
          const nextDaySchedule = hoursList.find((h) => !h.isClosed);
          return {
            isOpen: false,
            statusText: "Closed Now",
            subText: nextDaySchedule
              ? `Opens ${nextDaySchedule.day} at 9:00 AM`
              : "Closed today",
            currentDayName: weekday,
          };
        }

        const [openH, openM] = todaySchedule.open.split(":").map(Number);
        const [closeH, closeM] = todaySchedule.close.split(":").map(Number);
        const openTotalMinutes = openH * 60 + openM;
        const closeTotalMinutes = closeH * 60 + closeM;

        if (currentTotalMinutes < openTotalMinutes) {
          // Before opening hours today
          const openFormatted = openH > 12 ? `${openH - 12}:${String(openM).padStart(2, "0")} PM` : `${openH}:${String(openM).padStart(2, "0")} AM`;
          return {
            isOpen: false,
            statusText: "Closed Now",
            subText: `Opens today at ${openFormatted}`,
            currentDayName: weekday,
          };
        } else if (currentTotalMinutes >= openTotalMinutes && currentTotalMinutes < closeTotalMinutes) {
          // Currently open
          const closeFormatted =
            closeH > 12
              ? `${closeH - 12}:${String(closeM).padStart(2, "0")} PM`
              : `${closeH}:${String(closeM).padStart(2, "0")} AM`;
          return {
            isOpen: true,
            statusText: "Open Now",
            subText: `Closes at ${closeFormatted}`,
            currentDayName: weekday,
          };
        } else {
          // After closing hours today -> check tomorrow
          const isSaturday = weekday.toLowerCase() === "saturday";
          const nextOpenDay = isSaturday ? "Monday" : "tomorrow";
          return {
            isOpen: false,
            statusText: "Closed Now",
            subText: `Opens ${nextOpenDay} at 9:00 AM`,
            currentDayName: weekday,
          };
        }
      } catch {
        return {
          isOpen: false,
          statusText: "Clinic Hours",
          subText: "Mon – Sat: 9:00 AM – 8:30 PM",
          currentDayName: "",
        };
      }
    };

    const rafId = requestAnimationFrame(() => {
      setStatus(computeClinicStatus());
    });

    // Recompute every 60 seconds
    const interval = setInterval(() => {
      setStatus(computeClinicStatus());
    }, 60000);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(interval);
    };
  }, []);

  const socialLinks = [
    { label: "Instagram", href: siteConfig.socials.instagram, icon: InstagramIcon },
    { label: "WhatsApp", href: siteConfig.socials.whatsapp, icon: MessageCircle },
    { label: "Facebook", href: siteConfig.socials.facebook, icon: FacebookIcon },
    { label: "YouTube", href: siteConfig.socials.youtube, icon: YoutubeIcon },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Opening Hours Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-line shadow-card space-y-5">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-line">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand" aria-hidden="true" />
            <h3 className="font-display font-semibold text-ink text-base">
              Opening Hours
            </h3>
          </div>

          {/* Dynamic Open / Closed Status Pill */}
          <div className="flex items-center gap-2">
            {status ? (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  status.isOpen
                    ? "bg-success/10 text-success border border-success/30"
                    : "bg-surface-alt text-ink-muted border border-line"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    status.isOpen
                      ? "bg-success animate-pulse"
                      : "bg-ink-muted/50"
                  }`}
                  aria-hidden="true"
                />
                <span>{status.statusText}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-alt text-ink-muted border border-line">
                <span className="w-2 h-2 rounded-full bg-ink-muted/40" />
                <span>Clinic Hours</span>
              </span>
            )}
          </div>
        </div>

        {/* Subtext info (e.g. Closes at 8:30 PM) */}
        {status?.subText && (
          <p className="text-xs text-ink-muted font-medium -mt-2">
            {status.subText} •{" "}
            <span className="text-ink-muted/70">Indian Standard Time</span>
          </p>
        )}

        {/* Semantic Opening Hours Table */}
        <div className="overflow-hidden rounded-2xl border border-line/70">
          <table className="w-full text-left text-xs text-ink">
            <caption className="sr-only">GuruOm Dental Clinic Weekly Schedule</caption>
            <thead>
              <tr className="bg-surface-alt/60 text-ink-muted font-semibold border-b border-line/60">
                <th scope="col" className="py-2.5 px-3.5">
                  Day
                </th>
                <th scope="col" className="py-2.5 px-3.5 text-right">
                  Working Hours
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/40">
              {siteConfig.openingHours.map((schedule: ClinicOpeningHour) => {
                const isToday =
                  status?.currentDayName.toLowerCase() === schedule.day.toLowerCase();

                return (
                  <tr
                    key={schedule.day}
                    className={`transition-colors ${
                      isToday
                        ? "bg-brand/5 font-semibold text-brand-dark"
                        : "hover:bg-surface-alt/30"
                    }`}
                  >
                    <td className="py-2.5 px-3.5 flex items-center gap-2">
                      <span>{schedule.day}</span>
                      {isToday && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-brand text-white">
                          Today
                        </span>
                      )}
                    </td>
                    <td
                      className={`py-2.5 px-3.5 text-right ${
                        schedule.isClosed ? "text-ink-muted italic" : "text-ink"
                      }`}
                    >
                      {schedule.label}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Emergency Callout Card */}
      <div className="bg-brand-dark text-white rounded-3xl p-6 border border-accent/30 shadow-card space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-accent/20 text-accent flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-accent block">
              Urgent Clinical Care
            </span>
            <h4 className="font-display font-semibold text-white text-base mt-0.5">
              Dental Emergency?
            </h4>
          </div>
        </div>

        <p className="text-xs text-white/75 leading-relaxed">
          {siteConfig.emergencyNote}
        </p>

        <div className="pt-1">
          <a
            href={`tel:${siteConfig.emergencyPhone.replace(/[\s\-\(\)]/g, "")}`}
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-accent text-on-accent font-semibold text-xs tracking-wide hover:brightness-105 transition-all shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Emergency Desk: {siteConfig.emergencyPhone}</span>
          </a>
        </div>
      </div>

      {/* 3. Social Media Presence */}
      <div className="bg-white rounded-3xl p-5 border border-line shadow-soft flex items-center justify-between">
        <span className="text-xs font-semibold text-ink">
          Connect With Us
        </span>
        <div className="flex items-center gap-2">
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit GuruOm Dental on ${social.label}`}
                className="w-9 h-9 rounded-full border border-line bg-surface hover:bg-brand hover:text-white hover:border-brand text-ink-muted flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <Icon className="w-4 h-4" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};
