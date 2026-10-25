"use client";

import React, { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export interface NewsletterFormProps {
  variant?: "light" | "dark";
  buttonText?: string;
  placeholder?: string;
  className?: string;
}

export const NewsletterForm: React.FC<NewsletterFormProps> = ({
  variant = "light",
  buttonText = "Subscribe",
  placeholder = "Your email address...",
  className = "",
}) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");

    try {
      // Simulate remote newsletter subscription dispatch
      await new Promise((resolve) => setTimeout(resolve, 600));
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again later.");
    }
  };

  const isDark = variant === "dark";

  return (
    <div className={`w-full ${className}`}>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
      >
        <div className="relative flex-1">
          <label htmlFor={`newsletter-email-${variant}`} className="sr-only">
            Email address for dental care newsletter
          </label>
          <input
            id={`newsletter-email-${variant}`}
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder={placeholder}
            disabled={status === "loading" || status === "success"}
            required
            className={`w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand font-body ${
              isDark
                ? "bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/40"
                : "bg-white border border-line text-ink placeholder:text-ink-muted/60 focus:border-brand"
            }`}
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className={`px-5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shrink-0 disabled:opacity-50 select-none flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
            isDark
              ? "bg-accent hover:brightness-105 text-on-accent focus-visible:ring-accent"
              : "bg-brand hover:bg-brand-dark text-white focus-visible:ring-brand"
          }`}
        >
          {status === "loading" ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <span>{status === "success" ? "Subscribed" : buttonText}</span>
          )}
        </button>
      </form>

      {/* Accessible Notifications Region */}
      <div aria-live="polite" className="mt-2.5 text-xs">
        {status === "success" && (
          <p className="flex items-center gap-1.5 text-success font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Thank you! You have been successfully subscribed to our clinical journal.</span>
          </p>
        )}
        {status === "error" && (
          <p className="flex items-center gap-1.5 text-danger font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default NewsletterForm;
