"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Send,
  Loader2,
  AlertCircle,
  CheckCheck,
  Copy,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { contactReasons } from "@/data/site";
import { contactFormSchema, ContactFormData, URGENT_CARE_NOTICE } from "@/lib/contact";
import { submitContact } from "@/app/contact/actions";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export const ContactForm: React.FC = () => {
  // Form State (no sessionStorage used for contact enquiry per requirement)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState<string>("general");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // Honeypot

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceCode, setReferenceCode] = useState("");
  const [copied, setCopied] = useState(false);

  // Field Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Animation Refs
  const cardWrapperRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const checkSvgRef = useRef<SVGSVGElement | null>(null);

  const messageLength = message.length;
  const maxMessageLength = 1000;

  // Inline blur validation
  const handleBlur = (fieldName: keyof ContactFormData) => {
    const dataToTest = {
      fullName,
      email,
      phone,
      reason,
      message,
      consent,
      website,
    };
    const res = contactFormSchema.safeParse(dataToTest);
    if (!res.success) {
      const match = res.error.issues.find((issue) => issue.path[0] === fieldName);
      if (match) {
        setErrors((prev) => ({ ...prev, [fieldName]: match.message }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[fieldName];
          return next;
        });
      }
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const handleCopyReference = async () => {
    try {
      await navigator.clipboard.writeText(referenceCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handleReset = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setReason("general");
    setMessage("");
    setConsent(false);
    setWebsite("");
    setErrors({});
    setServerError(null);
    setIsSubmitted(false);
    setReferenceCode("");

    // Animate back smoothly
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const rawData = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      reason,
      message: message.trim(),
      consent,
      website: website || "",
    };

    const parseResult = contactFormSchema.safeParse(rawData);

    if (!parseResult.success) {
      const validationErrors: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => {
        const field = String(issue.path[0]);
        if (!validationErrors[field]) validationErrors[field] = issue.message;
      });
      setErrors(validationErrors);

      // Focus first invalid field
      const firstErrorField = parseResult.error.issues[0]?.path[0];
      if (firstErrorField !== undefined) {
        const input = document.getElementById(`field-${String(firstErrorField)}`);
        input?.focus();
      }
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await submitContact(parseResult.data);

      if (response.ok) {
        setReferenceCode(response.reference);

        // Smooth height tween when transitioning to success view
        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

        if (cardWrapperRef.current && !prefersReducedMotion) {
          const oldHeight = cardWrapperRef.current.offsetHeight;
          setIsSubmitted(true);

          requestAnimationFrame(() => {
            if (!cardWrapperRef.current) return;
            const newHeight = cardWrapperRef.current.scrollHeight;

            gsap.fromTo(
              cardWrapperRef.current,
              { height: oldHeight },
              {
                height: newHeight,
                duration: 0.4,
                ease: "power3.out",
                onComplete: () => {
                  if (cardWrapperRef.current) {
                    cardWrapperRef.current.style.height = "auto";
                  }
                  ScrollTrigger.refresh();
                },
              }
            );

            // Animate Checkmark
            if (checkSvgRef.current) {
              gsap.fromTo(
                checkSvgRef.current,
                { scale: 0.5, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.5, delay: 0.15, ease: "back.out(1.7)" }
              );
            }
          });
        } else {
          setIsSubmitted(true);
          ScrollTrigger.refresh();
        }
      } else {
        if (response.fieldErrors) {
          const serverValidationErrors: Record<string, string> = {};
          Object.entries(response.fieldErrors).forEach(([key, msgs]) => {
            if (Array.isArray(msgs) && msgs.length > 0 && msgs[0]) {
              serverValidationErrors[key] = msgs[0];
            }
          });
          setErrors(serverValidationErrors);
        }
        setServerError(response.message || "Failed to send message. Please try again.");
      }
    } catch {
      setServerError(
        "A network error occurred while contacting our server. Please check your connection or call us directly."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      ref={cardWrapperRef}
      className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-line shadow-card relative overflow-hidden transition-none"
    >
      {/* SUCCESS PANEL */}
      {isSubmitted ? (
        <div ref={contentRef} className="space-y-6 text-center py-4 animate-fadeIn">
          {/* Animated Success Check */}
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-600 ring-8 ring-emerald-500/5">
              <svg
                ref={checkSvgRef}
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

          <div className="max-w-md mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
              Enquiry Received
            </span>
            <h3 className="text-display-md sm:text-display-lg font-display text-ink tracking-tight">
              Thank You!
            </h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              We&apos;ve received your message, <strong className="text-ink">{fullName}</strong>.
              We&apos;ll reply within 1 business day.
            </p>
          </div>

          {/* Reference Code Badge */}
          <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-surface border border-line shadow-soft max-w-sm mx-auto">
            <div className="text-left">
              <span className="block text-[10px] uppercase tracking-wider text-ink-muted font-semibold">
                Tracking Reference
              </span>
              <span className="font-mono text-base font-bold text-brand tracking-wider">
                {referenceCode}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyReference}
              aria-label={copied ? "Reference copied" : "Copy reference code"}
              className="p-2 rounded-xl text-ink-muted hover:text-brand hover:bg-white border border-transparent hover:border-line transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {copied ? (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                  <CheckCheck className="w-4 h-4" />
                  <span>Copied!</span>
                </span>
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Action button to send another message */}
          <div className="pt-4 flex justify-center">
            <Button
              type="button"
              variant="ghost"
              size="md"
              showIcon={false}
              onClick={handleReset}
            >
              <span className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                <span>Send another message</span>
              </span>
            </Button>
          </div>
        </div>
      ) : (
        /* FORM VIEW */
        <div ref={contentRef} className="space-y-6">
          <div>
            <h2
              id="contact-form-heading"
              className="text-display-sm sm:text-display-md font-display text-ink tracking-tight"
            >
              Send Us a Message
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Have a clinical question or feedback? Fill in your details below and our team will get
              back to you promptly.
            </p>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div
              role="alert"
              className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start justify-between gap-3 animate-fadeIn"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
              <button
                type="button"
                onClick={() => setServerError(null)}
                className="text-red-500 hover:text-red-800 text-xs font-semibold underline underline-offset-2 shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="field-fullName" className="block text-xs font-semibold text-ink mb-1.5">
                Full Name <span className="text-accent">*</span>
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
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }));
                  }}
                  onBlur={() => handleBlur("fullName")}
                  placeholder="e.g. Rahul Sharma"
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                  aria-invalid={Boolean(errors.fullName)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-ink placeholder:text-ink-muted/50 transition-all focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                    errors.fullName
                      ? "border-red-500 bg-red-50/30"
                      : "border-line bg-white hover:border-brand/40"
                  }`}
                />
              </div>
              {errors.fullName && (
                <p
                  id="fullName-error"
                  role="alert"
                  className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.fullName}</span>
                </p>
              )}
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label htmlFor="field-email" className="block text-xs font-semibold text-ink mb-1.5">
                  Email Address <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted">
                    <Mail className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <input
                    id="field-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    onBlur={() => handleBlur("email")}
                    placeholder="e.g. rahul@example.com"
                    aria-describedby={errors.email ? "email-error" : undefined}
                    aria-invalid={Boolean(errors.email)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-ink placeholder:text-ink-muted/50 transition-all focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                      errors.email
                        ? "border-red-500 bg-red-50/30"
                        : "border-line bg-white hover:border-brand/40"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p
                    id="email-error"
                    role="alert"
                    className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Phone (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="field-phone" className="block text-xs font-semibold text-ink">
                    Phone Number
                  </label>
                  <span className="text-[11px] text-ink-muted">Optional</span>
                </div>
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
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                    }}
                    onBlur={() => handleBlur("phone")}
                    placeholder="e.g. 98765 43210"
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                    aria-invalid={Boolean(errors.phone)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-ink placeholder:text-ink-muted/50 transition-all focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                      errors.phone
                        ? "border-red-500 bg-red-50/30"
                        : "border-line bg-white hover:border-brand/40"
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p
                    id="phone-error"
                    role="alert"
                    className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Reason for Contact (Accessible Native Select) */}
            <div>
              <label htmlFor="field-reason" className="block text-xs font-semibold text-ink mb-1.5">
                Reason for Contact <span className="text-accent">*</span>
              </label>
              <select
                id="field-reason"
                name="reason"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (errors.reason) setErrors((prev) => ({ ...prev, reason: "" }));
                }}
                onBlur={() => handleBlur("reason")}
                aria-describedby={errors.reason ? "reason-error" : undefined}
                className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-white text-sm text-ink transition-all focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent hover:border-brand/40 cursor-pointer"
              >
                {contactReasons.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              {errors.reason && (
                <p
                  id="reason-error"
                  role="alert"
                  className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.reason}</span>
                </p>
              )}
            </div>

            {/* Message Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="field-message" className="block text-xs font-semibold text-ink">
                  Your Message <span className="text-accent">*</span>
                </label>
                <span
                  className={`text-[11px] ${
                    messageLength > maxMessageLength ? "text-red-500 font-semibold" : "text-ink-muted"
                  }`}
                >
                  {messageLength}/{maxMessageLength}
                </span>
              </div>
              <textarea
                id="field-message"
                name="message"
                rows={4}
                required
                maxLength={maxMessageLength}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errors.message) setErrors((prev) => ({ ...prev, message: "" }));
                }}
                onBlur={() => handleBlur("message")}
                placeholder="How can our clinical team help you today?"
                aria-describedby={
                  errors.message ? "message-error" : "message-urgent-notice"
                }
                aria-invalid={Boolean(errors.message)}
                className={`w-full p-3 rounded-xl border text-sm text-ink placeholder:text-ink-muted/50 transition-all focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none ${
                  errors.message
                    ? "border-red-500 bg-red-50/30"
                    : "border-line bg-white hover:border-brand/40"
                }`}
              />

              {/* Urgent Dental Problems Visible Notice */}
              <p
                id="message-urgent-notice"
                className="flex items-center gap-1.5 text-[11px] text-amber-700 font-medium mt-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-600" aria-hidden="true" />
                <span>{URGENT_CARE_NOTICE}</span>
              </p>

              {errors.message && (
                <p
                  id="message-error"
                  role="alert"
                  className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.message}</span>
                </p>
              )}
            </div>

            {/* Honeypot field (hidden off-screen from users & screen readers, NOT display:none) */}
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
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            {/* Consent Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  id="field-consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (errors.consent) setErrors((prev) => ({ ...prev, consent: "" }));
                  }}
                  aria-describedby={errors.consent ? "consent-error" : undefined}
                  className="mt-0.5 h-4 w-4 rounded border-line text-brand focus:ring-brand focus:ring-offset-2"
                />
                <span className="text-xs text-ink-muted leading-relaxed">
                  I consent to GuruOm Dental processing my contact details in accordance with the{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand hover:underline underline-offset-2 font-medium"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {errors.consent && (
                <p
                  id="consent-error"
                  role="alert"
                  className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5 pl-7"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.consent}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                showIcon={false}
                disabled={isSubmitting}
                className="w-full"
              >
                <span className="flex items-center gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Your Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </span>
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
