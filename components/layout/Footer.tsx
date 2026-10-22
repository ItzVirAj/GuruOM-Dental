"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Container, Button, SmartImage } from "@/components/ui";
import { Marquee, Reveal, SplitHeading, useLenis } from "@/components/animations";
import { siteConfig, footerLinkColumns } from "@/data/site";

export function Footer() {
  const lenis = useLenis();

  // Hydration-safe year using useSyncExternalStore
  const year = useSyncExternalStore(
    () => () => {},
    () => new Date().getFullYear(),
    () => 2026
  );

  // Newsletter form state
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Simple email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");

    try {
      // TODO: Connect this to your newsletter/CRM endpoint (e.g., Mailchimp, Resend, Supabase).
      // Example: await fetch('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) });
      await new Promise((resolve) => setTimeout(resolve, 800));

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again later.");
    }
  };

  const handleBackToTop = () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const tickerPhrases = [
    "Gentle Care",
    "Digital Diagnostics",
    "Hospital-Grade Hygiene",
    "Emergency Support",
    "Transparent Pricing",
  ];

  return (
    <footer className="relative bg-brand-dark text-white overflow-hidden pt-16 lg:pt-24">
      {/* 1. Top CTA Strip */}
      <Container className="mb-16 lg:mb-20">
        <Reveal>
          <div className="relative rounded-3xl bg-brand/50 border border-brand-light/30 p-8 sm:p-12 lg:p-16 overflow-hidden">
            {/* Background ambient glow */}
            <div
              className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-accent/15 blur-3xl"
              aria-hidden="true"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 flex flex-col gap-6">
                <span className="text-xs font-bold uppercase tracking-widest text-accent">
                  Book Your Consultation
                </span>
                <SplitHeading
                  as="h2"
                  type="words"
                  className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
                >
                  Your healthiest smile starts here.
                </SplitHeading>
                <p className="text-surface-alt/80 text-base max-w-xl leading-relaxed">
                  Join hundreds of families who trust GuruOm Dental for painless checkups, 3D
                  aligners, and restorative dentistry.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Button href="/appointment" variant="secondary" size="lg" className="font-bold text-brand-dark">
                    Book Appointment
                  </Button>
                  <Button
                    href={`tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`}
                    variant="ghost"
                    size="lg"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Call {siteConfig.phone}
                  </Button>
                </div>
              </div>

              {/* Decorative CTA SmartImage */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-sm rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  <SmartImage
                    slot="footerCta"
                    alt="GuruOm Dental Clinic ambiance and consultation"
                    aspect="16/9"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>

      {/* 2. Main Columns Grid */}
      <Container className="mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Column 1: Brand, info, hours, socials (Span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Reveal delay={0.05}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-brand-dark">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.5 2 6 4.5 6 8c0 3.2 1.3 5.4 2.1 7.2.7 1.6 1.4 3.3 1.9 5.8.2.8.9 1 1.5.8.7-.3.9-1.1.9-1.8 0-1.8-.4-3.5-.8-5.2-.2-.8.5-1.5 1.4-1.5s1.6.7 1.4 1.5c-.4 1.7-.8 3.4-.8 5.2 0 .7.2 1.5.9 1.8.6.2 1.3 0 1.5-.8.5-2.5 1.2-4.2 1.9-5.8.8-1.8 2.1-4 2.1-7.2 0-3.5-2.5-6-6-6z" />
                  </svg>
                </div>
                <span className="font-display text-xl font-bold tracking-tight text-white">
                  {siteConfig.name}
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="text-sm text-surface-alt/70 leading-relaxed max-w-sm">
                Providing gentle, hospital-grade dental healthcare and cosmetic smiles in {siteConfig.address.city} with advanced 3D radiography and pain-free treatments.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="flex flex-col gap-1 text-xs text-surface-alt/80">
                <span className="font-semibold text-accent uppercase tracking-wider text-[11px]">
                  Clinic Hours
                </span>
                <span>{siteConfig.workingHours.weekdays}</span>
                <span>{siteConfig.workingHours.saturday}</span>
                <span className="text-surface-alt/60">{siteConfig.workingHours.sunday}</span>
              </div>
            </Reveal>

            {/* Social Icons that lift on hover */}
            <Reveal delay={0.2}>
              <div className="flex items-center gap-3 pt-2">
                {/* Instagram */}
                <a
                  href={siteConfig.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-surface-alt transition-transform hover:-translate-y-1 hover:bg-white/15 hover:text-accent focus-visible:ring-2 focus-visible:ring-accent outline-none"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href={siteConfig.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-surface-alt transition-transform hover:-translate-y-1 hover:bg-white/15 hover:text-accent focus-visible:ring-2 focus-visible:ring-accent outline-none"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.688 5H18V0h-3.808C10.597 0 9 1.583 9 4.615V8z" />
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href={siteConfig.socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-surface-alt transition-transform hover:-translate-y-1 hover:bg-white/15 hover:text-accent focus-visible:ring-2 focus-visible:ring-accent outline-none"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href={siteConfig.socials.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-surface-alt transition-transform hover:-translate-y-1 hover:bg-white/15 hover:text-accent focus-visible:ring-2 focus-visible:ring-accent outline-none"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                  </svg>
                </a>
              </div>
            </Reveal>
          </div>

          {/* Columns 2, 3, 4: Footer Link Groups (Span 5 total) */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {footerLinkColumns.map((col, idx) => (
              <div key={col.title} className="flex flex-col gap-4">
                <Reveal delay={0.1 + idx * 0.05}>
                  <span className="text-xs font-bold uppercase tracking-widest text-accent">
                    {col.title}
                  </span>
                </Reveal>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Reveal delay={0.15 + idx * 0.05}>
                        <Link
                          href={link.href}
                          className="text-sm text-surface-alt/75 transition-colors hover:text-white outline-none focus-visible:underline"
                        >
                          {link.label}
                        </Link>
                      </Reveal>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Last Column: Newsletter Signup (Span 3) */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <Reveal delay={0.25}>
              <span className="text-xs font-bold uppercase tracking-widest text-accent">
                Newsletter
              </span>
              <h4 className="font-display text-base font-bold text-white mt-1">
                Stay updated on dental wellness
              </h4>
              <p className="text-xs text-surface-alt/70 leading-relaxed">
                Receive quarterly oral health tips, technology updates, and clinic specials.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2.5 mt-2">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    disabled={status === "loading" || status === "success"}
                    aria-label="Email address for newsletter"
                    className="w-full rounded-xl bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 border border-white/15 focus:border-accent focus:bg-white/15 focus:outline-none focus:ring-1 focus:ring-accent transition-colors disabled:opacity-60"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={status === "loading" || status === "success"}
                  className="w-full justify-center bg-brand-light hover:bg-brand"
                >
                  {status === "loading" ? "Subscribing..." : "Subscribe"}
                </Button>

                {/* Status messages */}
                {status === "success" && (
                  <p className="text-xs text-accent mt-1 flex items-center gap-1.5 font-medium">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Thank you, you&apos;re subscribed!
                  </p>
                )}
                {status === "error" && (
                  <p className="text-xs text-rose-300 mt-1">{errorMessage}</p>
                )}
              </form>
            </Reveal>

            {/* Direct Contact Snapshot */}
            <Reveal delay={0.35}>
              <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-1 text-xs text-surface-alt/70">
                <span className="text-white font-medium">Visit Clinic</span>
                <span>{siteConfig.address.full}</span>
                <a
                  href={siteConfig.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline hover:text-accent-soft mt-1 inline-block"
                >
                  View on Google Maps →
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>

      {/* 3. Bottom Ticker Marquee */}
      <div className="border-y border-white/10 py-4 bg-brand-dark/80">
        <Marquee speed={32} pauseOnHover>
          {tickerPhrases.map((phrase, i) => (
            <span
              key={i}
              className="mx-8 flex items-center gap-6 font-display text-lg sm:text-xl font-bold uppercase tracking-wider text-surface-alt/30 select-none"
            >
              <span>{phrase}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-accent/40" aria-hidden="true" />
            </span>
          ))}
        </Marquee>
      </div>

      {/* 4. Bottom Legal Bar & Back to Top */}
      <Container className="py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-surface-alt/60">
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>

            {/* Back to top button */}
            <button
              type="button"
              onClick={handleBackToTop}
              className="flex items-center gap-1.5 text-accent hover:text-accent-soft transition-colors font-medium cursor-pointer outline-none focus-visible:underline"
            >
              <span>Back to top</span>
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </div>
      </Container>
    </footer>
  );
}
