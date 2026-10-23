"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Container, NewsletterForm } from "@/components/ui";
import { Marquee } from "@/components/animations";
import { siteConfig } from "@/data/site";

export function Footer() {
  // Hydration-safe current year
  const year = useSyncExternalStore(
    () => () => { },
    () => new Date().getFullYear(),
    () => 2026
  );

  const tickerItems = [
    "MEMBER-ONLY EXCLUSIVES",
    "BOOKED BY 100+ PATIENTS TODAY",
    "24/7 PRIORITY SUPPORT",
    "WORLD-CLASS HYGIENE PROTOCOLS",
    "PAIN-FREE PROCEDURES",
  ];

  const mainPageLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Service", href: "/services" },
    { label: "Doctors", href: "/doctors" },
    { label: "Pricing", href: "/pricing" },
    { label: "Appointment", href: "/appointment" },
    { label: "Blogs", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <footer className="relative w-full bg-white text-[#101828] overflow-hidden" aria-label="Footer">
      {/* 1. Top Ribbon Marquee Strip (Brand Green Background #0E5A5F) */}
      <div className="w-full bg-brand text-white py-2.5 overflow-hidden border-b border-brand-dark/30 shadow-xs">
        <Marquee speed={38} pauseOnHover className="py-0.5">
          <div className="flex items-center gap-10 whitespace-nowrap text-[11px] sm:text-xs font-sans font-bold tracking-widest uppercase">
            {tickerItems.concat(tickerItems).map((text, idx) => (
              <span key={idx} className="inline-flex items-center gap-3">
                {/* 8-Point Asterisk Star Icon in Accent Mint */}
                <svg
                  className="w-3.5 h-3.5 fill-accent opacity-90 shrink-0"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2L13.8 8.8L20.8 7L15.8 12L20.8 17L13.8 15.2L12 22L10.2 15.2L3.2 17L8.2 12L3.2 7L10.2 8.8L12 2Z" />
                </svg>
                <span>{text}</span>
              </span>
            ))}
          </div>
        </Marquee>
      </div>

      <Container className="pt-14 sm:pt-16 lg:pt-20 pb-12 sm:pb-16">
        {/* 2. Brand Header Row: Logo on Left, Phone & Email on Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-12 sm:pb-16">
          {/* Brand Logo & Name */}
          <Link
            href="/"
            className="group inline-flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg"
            aria-label={`${siteConfig.name} - Return to Homepage`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-2xs transition-transform duration-300 group-hover:scale-105">
              {/* Botanical Emblem */}
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C8.5 2 6 4.5 6 8c0 3.2 1.3 5.4 2.1 7.2.7 1.6 1.4 3.3 1.9 5.8.2.8.9 1 1.5.8.7-.3.9-1.1.9-1.8 0-1.8-.4-3.5-.8-5.2-.2-.8.5-1.5 1.4-1.5s1.6.7 1.4 1.5c-.4 1.7-.8 3.4-.8 5.2 0 .7.2 1.5.9 1.8.6.2 1.3 0 1.5-.8.5-2.5 1.2-4.2 1.9-5.8.8-1.8 2.1-4 2.1-7.2 0-3.5-2.5-6-6-6z" />
              </svg>
            </div>
            <div className="flex items-baseline">
              <span className="font-league-spartan text-2xl font-bold tracking-tight text-[#101828]">
                {siteConfig.name}
              </span>
              <span className="text-[10px] align-top ml-1 font-sans font-medium text-[#667085]">
                TM
              </span>
            </div>
          </Link>

          {/* Quick Contact Right Header */}
          <div className="text-left sm:text-right">
            <a
              href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
              className="block text-sm font-sans font-medium text-[#101828] hover:text-brand transition-colors"
            >
              {siteConfig.phone}
            </a>
            <a
              href={`mailto:${siteConfig.email}`}
              className="block text-sm font-sans text-[#475467] hover:text-[#101828] transition-colors mt-0.5"
            >
              {siteConfig.email}
            </a>
          </div>
        </div>

        {/* 3. Main Content Grid: Main Page Links on Left, Newsletter & Map on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          {/* Left Column: Main Page links + Social Icons (~58% width) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-league-spartan font-bold tracking-wider text-[#101828] uppercase mb-6">
                MAIN PAGE
              </h3>
              <ul className="grid grid-cols-2 sm:grid-cols-2 gap-x-12 gap-y-3.5 font-sans text-sm">
                {mainPageLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-[#475467] hover:text-brand transition-colors block py-0.5"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Icons Row */}
            <div className="flex items-center gap-3.5 pt-12 sm:pt-14" aria-label="Social media channels">
              {/* Instagram */}
              <a
                href={siteConfig.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow GuruOm Dental on Instagram"
                className="w-10 h-10 rounded-full border border-[#D0D5DD] flex items-center justify-center text-[#344054] hover:bg-brand hover:text-white hover:border-brand transition-all duration-200 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href={siteConfig.socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Subscribe to GuruOm Dental on YouTube"
                className="w-10 h-10 rounded-full border border-[#D0D5DD] flex items-center justify-center text-[#344054] hover:bg-brand hover:text-white hover:border-brand transition-all duration-200 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href={siteConfig.socials.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with GuruOm Dental on WhatsApp"
                className="w-10 h-10 rounded-full border border-[#D0D5DD] flex items-center justify-center text-[#344054] hover:bg-brand hover:text-white hover:border-brand transition-all duration-200 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.52 3.48A11.93 11.93 0 0 0 12.06 0C5.46 0 .09 5.37.09 11.97c0 2.11.55 4.16 1.6 5.97L0 24l6.23-1.63a11.9 11.9 0 0 0 5.83 1.51h.01c6.6 0 11.97-5.37 11.97-11.97 0-3.2-.1.25-1.25-4.44-3.52-6.43zm-8.46 18.36h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.74.98 1-3.65-.24-.38a9.92 9.92 0 0 1-1.52-5.23c0-5.48 4.46-9.94 9.95-9.94 2.65 0 5.15 1.03 7.03 2.91a9.88 9.88 0 0 1 2.91 7.03c0 5.49-4.47 9.94-9.96 9.94z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href={siteConfig.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit GuruOm Dental on Facebook"
                className="w-10 h-10 rounded-full border border-[#D0D5DD] flex items-center justify-center text-[#344054] hover:bg-brand hover:text-white hover:border-brand transition-all duration-200 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right Column: Newsletter Card + Direct Contact Info (~42% width) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Newsletter Card */}
            <div className="rounded-2xl bg-[#F2F4F7] p-6 sm:p-8">
              <h3 className="font-league-spartan text-xl sm:text-2xl font-bold text-[#101828] tracking-tight mb-2">
                Stay Informed with GuruOm
              </h3>
              <p className="text-xs sm:text-[13.5px] text-[#475467] leading-relaxed mb-6 font-sans">
                Join our community for exclusive updates on the GuruOm standard of care and clinical innovations.
              </p>

              {/* Email Form */}
              <NewsletterForm variant="light" buttonText="SUBMIT NOW" />
            </div>

            {/* Direct Contact Block */}
            <div className="pt-2 font-sans">
              <a
                href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
                className="block text-sm font-medium text-[#101828] hover:text-brand transition-colors"
              >
                {siteConfig.phone}
              </a>
              <a
                href={`mailto:${siteConfig.email}`}
                className="block text-sm text-[#475467] hover:text-[#101828] transition-colors mt-0.5"
              >
                {siteConfig.email}
              </a>

              {/* Divider */}
              <div className="border-t border-[#EAECF0] my-5" />

              {/* Address & View on Map */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
                <div className="max-w-xs sm:max-w-md">
                  <p className="text-xs sm:text-[13px] text-[#475467] leading-relaxed">
                    {siteConfig.address.full}
                  </p>
                  <p className="text-[11px] font-mono font-semibold text-brand tracking-wider mt-1 flex items-center gap-1">
                    <span>📍</span>
                    <span>4QM5+F35, Ahilyanagar, Maharashtra 414003</span>
                  </p>
                </div>

                <a
                  href={siteConfig.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="4QM5+F35, Abhiyanta Colony, Shriram Nagar, Sawli Housing Society, Surya Nagar, Ahilyanagar, Maharashtra 414003"
                  aria-label="Open 4QM5+F35, Ahilyanagar in Google Maps"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#101828] hover:text-brand uppercase transition-colors shrink-0 group"
                >
                  <span className="underline underline-offset-4">VIEW ON MAP</span>
                  {/* Map Pin Icon */}
                  <svg
                    className="w-3.5 h-3.5 text-[#101828] group-hover:text-brand transition-colors"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Bottom Legal Strip */}
        <div className="border-t border-[#EAECF0] pt-6 sm:pt-8 mt-14 sm:mt-18 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
          <p className="text-xs text-[#667085] text-center sm:text-left">
            Copyright © {year} {siteConfig.name}. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-xs font-medium tracking-wider uppercase text-[#475467]">
            <Link href="/terms" className="hover:text-[#101828] transition-colors">
              TERMS & CONDITIONS
            </Link>
            <Link href="/privacy" className="hover:text-[#101828] transition-colors">
              PRIVACY POLICY
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
