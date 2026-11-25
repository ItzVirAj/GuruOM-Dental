"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Container, NewsletterForm } from "@/components/ui";
import { siteConfig } from "@/data/site";

const clinicLinks = [
  { label: "Home", href: "/" },
  { label: "About us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
];

const resourceLinks = [
  { label: "Journal blog", href: "/blog" },
  { label: "Video guides", href: "/videos" },
  { label: "Careers", href: "/careers" },
];

export function Footer() {
  // Hydration-safe current year
  const year = useSyncExternalStore(
    () => () => {},
    () => new Date().getFullYear(),
    () => 2026
  );

  return (
    <footer
      className="relative w-full bg-surface text-ink border-t border-line font-body"
      aria-label="Footer"
    >
      <Container className="pt-12 sm:pt-16 pb-10 sm:pb-12">
        {/* 1. Brand Masthead */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-line">
          <div>
            <Link
              href="/"
              className="inline-block font-display text-3xl sm:text-4xl tracking-tight text-ink hover:text-accent-deep transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep rounded-sm"
              aria-label={`${siteConfig.name} - Return to Homepage`}
            >
              {siteConfig.name}
            </Link>
            <p className="mt-1.5 text-sm text-ink-muted max-w-md leading-relaxed">
              Digital diagnostics, in-house dental lab precision, and specialist care in {siteConfig.address.city}.
            </p>
          </div>

          <div className="hidden sm:block text-right text-sm text-ink-muted">
            <p>{siteConfig.workingHours.weekdays}</p>
            <p className="mt-0.5">{siteConfig.workingHours.saturday}</p>
          </div>
        </div>

        {/* 2. Navigation, Front Desk & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 py-10 lg:py-14 border-b border-line items-start">
          {/* Navigation & Direct Front Desk Links */}
          <div className="order-2 lg:order-1 lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-8">
            <nav aria-label="Clinic navigation">
              <h2 className="text-sm font-semibold text-ink mb-3">Clinic</h2>
              <ul className="space-y-1 text-sm">
                {clinicLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-flex items-center min-h-[40px] text-ink-muted hover:text-accent-deep transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Patient resources">
              <h2 className="text-sm font-semibold text-ink mb-3">Resources</h2>
              <ul className="space-y-1 text-sm">
                {resourceLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-flex items-center min-h-[40px] text-ink-muted hover:text-accent-deep transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="col-span-2 sm:col-span-1 pt-6 border-t border-line sm:pt-0 sm:border-t-0">
              <h2 className="text-sm font-semibold text-ink mb-3">Front desk</h2>
              <div className="space-y-1 text-sm">
                <a
                  href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
                  className="inline-flex items-center min-h-[40px] font-semibold text-ink hover:text-accent-deep transition-colors"
                >
                  {siteConfig.phone}
                </a>
                <div>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="inline-flex items-center min-h-[40px] text-ink-muted hover:text-ink transition-colors break-all"
                  >
                    {siteConfig.email}
                  </a>
                </div>
                <p className="pt-1 text-xs text-ink-muted sm:hidden">
                  {siteConfig.workingHours.weekdays}
                </p>
              </div>
            </div>
          </div>

          {/* Journal Updates Newsletter Card */}
          <div className="order-1 lg:order-2 lg:col-span-5 rounded-xl bg-white border border-line p-5 sm:p-7">
            <h2 className="font-display text-xl sm:text-2xl text-ink tracking-tight">
              Stay informed
            </h2>
            <p className="mt-1.5 mb-5 text-body text-ink-muted">
              Occasional clinical notes and patient guides from our Ahilyanagar specialists.
            </p>
            <NewsletterForm variant="light" buttonText="Subscribe" />
          </div>
        </div>

        {/* 3. Clinic Address & Social Links */}
        <div className="py-7 border-b border-line flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-sm text-ink-muted leading-relaxed">
              {siteConfig.address.full}
            </p>
            <a
              href={siteConfig.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open 4QM5+F35, Ahilyanagar in Google Maps"
              className="mt-2 inline-flex items-center gap-1.5 min-h-[40px] text-sm font-semibold text-accent-deep hover:text-ink underline underline-offset-4 transition-colors"
            >
              <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Open in Google Maps</span>
              <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </a>
          </div>

          <div className="flex items-center gap-3" aria-label="Social media channels">
            <a
              href={siteConfig.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow GuruOm Dental on Instagram"
              className="w-11 h-11 rounded-full border border-line bg-white flex items-center justify-center text-ink hover:bg-brand-dark hover:text-white hover:border-brand-dark transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>

            <a
              href={siteConfig.socials.youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Subscribe to GuruOm Dental on YouTube"
              className="w-11 h-11 rounded-full border border-line bg-white flex items-center justify-center text-ink hover:bg-brand-dark hover:text-white hover:border-brand-dark transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>

            <a
              href={siteConfig.socials.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with GuruOm Dental on WhatsApp"
              className="w-11 h-11 rounded-full border border-line bg-white flex items-center justify-center text-ink hover:bg-brand-dark hover:text-white hover:border-brand-dark transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.52 3.48A11.93 11.93 0 0 0 12.06 0C5.46 0 .09 5.37.09 11.97c0 2.11.55 4.16 1.6 5.97L0 24l6.23-1.63a11.9 11.9 0 0 0 5.83 1.51h.01c6.6 0 11.97-5.37 11.97-11.97 0-3.2-.1.25-1.25-4.44-3.52-6.43zm-8.46 18.36h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.74.98 1-3.65-.24-.38a9.92 9.92 0 0 1-1.52-5.23c0-5.48 4.46-9.94 9.95-9.94 2.65 0 5.15 1.03 7.03 2.91a9.88 9.88 0 0 1 2.91 7.03c0 5.49-4.47 9.94-9.96 9.94z" />
              </svg>
            </a>

            <a
              href={siteConfig.socials.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit GuruOm Dental on Facebook"
              className="w-11 h-11 rounded-full border border-line bg-white flex items-center justify-center text-ink hover:bg-brand-dark hover:text-white hover:border-brand-dark transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          </div>
        </div>

        {/* 4. Legal Strip */}
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-ink-muted">
          <p>
            Copyright © {year} {siteConfig.name}. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <Link href="/terms" className="min-h-[36px] inline-flex items-center hover:text-ink transition-colors">
              Terms &amp; conditions
            </Link>
            <Link href="/privacy" className="min-h-[36px] inline-flex items-center hover:text-ink transition-colors">
              Privacy policy
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
