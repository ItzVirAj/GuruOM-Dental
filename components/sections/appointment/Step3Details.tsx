"use client";

import React from "react";
import Link from "next/link";
import {
  User,
  Phone,
  Mail,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import { SENSITIVE_HEALTH_NOTICE } from "@/lib/booking";

export interface Step3DetailsProps {
  fullName: string;
  phone: string;
  email: string;
  notes: string;
  consent: boolean;
  website: string; // Honeypot
  errors?: {
    fullName?: string;
    phone?: string;
    email?: string;
    notes?: string;
    consent?: string;
    website?: string;
  };
  onFullNameChange: (val: string) => void;
  onPhoneChange: (val: string) => void;
  onEmailChange: (val: string) => void;
  onNotesChange: (val: string) => void;
  onConsentChange: (val: boolean) => void;
  onWebsiteChange: (val: string) => void;
  onBlurField?: (fieldName: string) => void;
}

export const Step3Details: React.FC<Step3DetailsProps> = ({
  fullName,
  phone,
  email,
  notes,
  consent,
  website,
  errors,
  onFullNameChange,
  onPhoneChange,
  onEmailChange,
  onNotesChange,
  onConsentChange,
  onWebsiteChange,
  onBlurField,
}) => {
  const notesCharCount = notes ? notes.length : 0;
  const maxNotesLength = 500;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Step Heading */}
      <div>
        <h2
          id="step3-heading"
          tabIndex={-1}
          className="text-display-sm sm:text-display-md font-display text-ink tracking-tight focus:outline-none"
        >
          Your Contact Details
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Provide your information so our front desk can confirm your appointment and send you
          directions.
        </p>
      </div>

      {/* Sensitive Medical Info Guard Notice */}
      <div
        role="note"
        aria-label="Medical privacy note"
        className="flex items-start gap-3 p-3.5 rounded-2xl bg-brand/5 border border-brand/20 text-xs text-brand-dark"
      >
        <ShieldAlert className="w-4 h-4 text-brand shrink-0 mt-0.5" aria-hidden="true" />
        <p className="leading-relaxed">
          <strong>Privacy Notice:</strong> {SENSITIVE_HEALTH_NOTICE}
        </p>
      </div>

      {/* Form Fields Grid */}
      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="field-fullName" className="block text-xs font-semibold text-ink mb-1.5">
            Full Name <span className="text-accent-deep">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
              <User className="w-4 h-4" aria-hidden="true" />
            </div>
            <input
              id="field-fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => onFullNameChange(e.target.value)}
              onBlur={() => onBlurField?.("fullName")}
              placeholder="e.g. Rahul Sharma"
              aria-describedby={errors?.fullName ? "fullName-error" : undefined}
              aria-invalid={Boolean(errors?.fullName)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-ink placeholder:text-ink-muted/50 transition-all focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors?.fullName
                  ? "border-danger bg-danger/5"
                  : "border-line bg-white hover:border-brand/40"
              }`}
            />
          </div>
          {errors?.fullName && (
            <p
              id="fullName-error"
              role="alert"
              className="flex items-center gap-1.5 text-xs text-danger mt-1.5"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.fullName}</span>
            </p>
          )}
        </div>

        {/* Mobile Phone Number */}
        <div>
          <label htmlFor="field-phone" className="block text-xs font-semibold text-ink mb-1.5">
            Mobile Number <span className="text-accent-deep">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
              <Phone className="w-4 h-4" aria-hidden="true" />
            </div>
            <input
              id="field-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              onBlur={() => onBlurField?.("phone")}
              placeholder="e.g. 98765 43210 (or +91)"
              aria-describedby={errors?.phone ? "phone-error" : "phone-help"}
              aria-invalid={Boolean(errors?.phone)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-ink placeholder:text-ink-muted/50 transition-all focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors?.phone
                  ? "border-danger bg-danger/5"
                  : "border-line bg-white hover:border-brand/40"
              }`}
            />
          </div>
          <p id="phone-help" className="text-[11px] text-ink-muted mt-1">
            Indian mobile number for WhatsApp & call appointment confirmation.
          </p>
          {errors?.phone && (
            <p
              id="phone-error"
              role="alert"
              className="flex items-center gap-1.5 text-xs text-danger mt-1"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.phone}</span>
            </p>
          )}
        </div>

        {/* Email Address (Optional) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="field-email" className="block text-xs font-semibold text-ink">
              Email Address
            </label>
            <span className="text-[11px] text-ink-muted">Optional</span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
              <Mail className="w-4 h-4" aria-hidden="true" />
            </div>
            <input
              id="field-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              onBlur={() => onBlurField?.("email")}
              placeholder="e.g. rahul@example.com"
              aria-describedby={errors?.email ? "email-error" : undefined}
              aria-invalid={Boolean(errors?.email)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-ink placeholder:text-ink-muted/50 transition-all focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                errors?.email
                  ? "border-danger bg-danger/5"
                  : "border-line bg-white hover:border-brand/40"
              }`}
            />
          </div>
          {errors?.email && (
            <p
              id="email-error"
              role="alert"
              className="flex items-center gap-1.5 text-xs text-danger mt-1.5"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.email}</span>
            </p>
          )}
        </div>

        {/* General Request / Notes */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="field-notes" className="block text-xs font-semibold text-ink">
              Scheduling Notes or Requests
            </label>
            <span
              className={`text-[11px] ${
                notesCharCount > maxNotesLength ? "text-danger font-semibold" : "text-ink-muted"
              }`}
            >
              {notesCharCount}/{maxNotesLength}
            </span>
          </div>
          <div className="relative">
            <textarea
              id="field-notes"
              name="notes"
              rows={3}
              maxLength={maxNotesLength}
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              onBlur={() => onBlurField?.("notes")}
              placeholder="e.g. Need wheelchair assistance, prefer morning reminder call..."
              aria-describedby={errors?.notes ? "notes-error" : undefined}
              aria-invalid={Boolean(errors?.notes)}
              className={`w-full p-3 rounded-xl border text-sm text-ink placeholder:text-ink-muted/50 transition-all focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none ${
                errors?.notes
                  ? "border-danger bg-danger/5"
                  : "border-line bg-white hover:border-brand/40"
              }`}
            />
          </div>
          {errors?.notes && (
            <p
              id="notes-error"
              role="alert"
              className="flex items-center gap-1.5 text-xs text-danger mt-1"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.notes}</span>
            </p>
          )}
        </div>

        {/* Honeypot field for bot suppression (off-screen, not display:none) */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            opacity: 0,
            zIndex: -999,
            pointerEvents: "none",
            left: "-9999px",
            top: "-9999px",
            width: "1px",
            height: "1px",
          }}
        >
          <label htmlFor="field-website">Do not fill this field if you are human</label>
          <input
            id="field-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => onWebsiteChange(e.target.value)}
          />
        </div>

        {/* Consent Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              id="field-consent"
              type="checkbox"
              checked={consent}
              onChange={(e) => onConsentChange(e.target.checked)}
              aria-describedby={errors?.consent ? "consent-error" : undefined}
              className="mt-0.5 h-4 w-4 rounded border-line text-brand focus:ring-brand focus:ring-offset-2"
            />
            <span className="text-xs text-ink-muted leading-relaxed">
              I agree to the{" "}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline underline-offset-2 font-medium"
              >
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline underline-offset-2 font-medium"
              >
                Terms of Service
              </Link>
              , and consent to receive appointment confirmation and reminders via phone call or
              WhatsApp.
            </span>
          </label>
          {errors?.consent && (
            <p
              id="consent-error"
              role="alert"
              className="flex items-center gap-1.5 text-xs text-danger mt-1.5 pl-7"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.consent}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
