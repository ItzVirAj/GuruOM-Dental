"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Copy,
  CheckCheck,
  Calendar as CalendarIcon,
  Clock,
  User,
  Stethoscope,
  ArrowLeft,
  Download,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { servicesData } from "@/data/services";
import { doctorsData } from "@/data/doctors";
import { siteConfig } from "@/data/site";
import { BookingFormData } from "@/lib/booking";
import { gsap } from "@/lib/gsap";

export interface BookingConfirmationProps {
  reference: string;
  bookingData: BookingFormData;
  onReset?: () => void;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  reference,
  bookingData,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const checkIconRef = useRef<SVGSVGElement | null>(null);

  const service = servicesData.find((s) => s.slug === bookingData.serviceSlug);
  const doctor =
    bookingData.doctorSlug === "any"
      ? { name: "Any Available Specialist", role: "On-duty dental team" }
      : doctorsData.find((d) => d.slug === bookingData.doctorSlug);

  // Animate the check mark & entrance on mount
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }
      );

      if (checkIconRef.current) {
        gsap.fromTo(
          checkIconRef.current,
          { scale: 0.5, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, delay: 0.2, ease: "back.out(1.7)" }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleCopyReference = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const handleDownloadIcs = () => {
    if (!bookingData.date || !bookingData.timeSlot) return;

    // Build ISO Date/Time string: date = YYYY-MM-DD, slot = HH:mm (24-hr from id)
    const [hours, minutes] = bookingData.timeSlot.split(":").map(Number);
    const [y, m, d] = bookingData.date.split("-").map(Number);

    const start = new Date(y, m - 1, d, hours || 10, minutes || 0, 0);
    const end = new Date(start.getTime() + 45 * 60 * 1000); // 45 min default duration

    const formatIcsTime = (dt: Date) => {
      const year = dt.getFullYear();
      const month = String(dt.getMonth() + 1).padStart(2, "0");
      const day = String(dt.getDate()).padStart(2, "0");
      const hour = String(dt.getHours()).padStart(2, "0");
      const min = String(dt.getMinutes()).padStart(2, "0");
      const sec = "00";
      return `${year}${month}${day}T${hour}${min}${sec}`;
    };

    const serviceTitle = service ? service.title : "Dental Consultation";
    const doctorName = doctor ? doctor.name : "Clinic Specialist";

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//GuruOm Dental//Appointment Scheduling//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${reference}@guruomdental.com`,
      `DTSTAMP:${formatIcsTime(new Date())}`,
      `DTSTART:${formatIcsTime(start)}`,
      `DTEND:${formatIcsTime(end)}`,
      `SUMMARY:Dental Appointment: ${serviceTitle} - GuruOm Dental`,
      `DESCRIPTION:Appointment Reference: ${reference}\\nService: ${serviceTitle}\\nDoctor: ${doctorName}\\nPatient: ${bookingData.fullName}\\nClinic: GuruOm Dental, Ahilyanagar\\nPhone: ${siteConfig.phone}`,
      `LOCATION:${siteConfig.address.full}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `guruom-dental-appointment-${reference}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formattedDate = bookingData.date
    ? new Date(bookingData.date + "T00:00:00").toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div ref={containerRef} className="space-y-8 text-center py-4">
      {/* Animated Success Check Icon */}
      <div className="flex justify-center">
        <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-success/10 text-success ring-8 ring-success/5">
          <svg
            ref={checkIconRef}
            className="w-10 h-10 stroke-[2.5]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>

      {/* Heading & Reassurance */}
      <div className="max-w-md mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
          Priority Slot Reserved
        </span>
        <h2 className="text-display-md sm:text-display-lg font-display text-ink tracking-tight">
          Request Received!
        </h2>
        <p className="text-sm text-ink-muted leading-relaxed">
          Thank you, <strong className="text-ink">{bookingData.fullName}</strong>. Your consultation
          request has been logged into our clinical schedule.
        </p>
      </div>

      {/* Reference Code Badge */}
      <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-surface border border-line shadow-soft max-w-sm mx-auto">
        <div className="text-left">
          <span className="block text-[10px] uppercase tracking-wider text-ink-muted font-semibold">
            Booking Reference
          </span>
          <span className="font-mono text-base font-bold text-brand tracking-wider">
            {reference}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopyReference}
          aria-label={copied ? "Reference copied" : "Copy reference code"}
          className="p-2 rounded-xl text-ink-muted hover:text-brand hover:bg-white border border-transparent hover:border-line transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {copied ? (
            <span className="flex items-center gap-1 text-xs text-success font-semibold">
              <CheckCheck className="w-4 h-4" />
              <span>Copied!</span>
            </span>
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Summary Box */}
      <div className="text-left bg-surface-alt/70 border border-line rounded-2xl p-5 max-w-lg mx-auto space-y-3.5 text-xs text-ink">
        <div className="font-semibold text-xs uppercase tracking-wider text-ink-muted pb-1 border-b border-line">
          Consultation Summary
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-2.5">
            <Stethoscope className="w-4 h-4 text-brand shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="text-ink-muted block text-[11px]">Service</span>
              <span className="font-medium">{service?.title || bookingData.serviceSlug}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <User className="w-4 h-4 text-brand shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="text-ink-muted block text-[11px]">Doctor</span>
              <span className="font-medium">{doctor?.name}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CalendarIcon className="w-4 h-4 text-brand shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="text-ink-muted block text-[11px]">Date</span>
              <span className="font-medium">{formattedDate}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-brand shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="text-ink-muted block text-[11px]">Time Slot</span>
              <span className="font-medium">
                {bookingData.timeSlot}
                {bookingData.flexible && " (Flexible)"}
              </span>
            </div>
          </div>
        </div>

        {/* Front Desk Promise */}
        <div className="mt-3 pt-3 border-t border-line flex items-start gap-2 text-[11px] text-ink-muted">
          <PhoneCall className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            Our patient coordination desk will call you at{" "}
            <strong className="text-ink">{bookingData.phone}</strong> shortly to confirm and share
            parking & clinic guidelines.
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Button
          type="button"
          variant="primary"
          size="md"
          showIcon={false}
          onClick={handleDownloadIcs}
          className="w-full sm:w-auto"
        >
          <span className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Add to Calendar (.ics)</span>
          </span>
        </Button>

        {onReset && (
          <Button
            type="button"
            variant="light"
            size="md"
            showIcon={false}
            onClick={onReset}
            className="w-full sm:w-auto"
          >
            <span>Book Another Appointment</span>
          </Button>
        )}

        <Button
          href="/"
          variant="ghost"
          size="md"
          showIcon={false}
          className="w-full sm:w-auto"
        >
          <span className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </span>
        </Button>
      </div>
    </div>
  );
};
