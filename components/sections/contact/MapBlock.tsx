"use client";

import React, { useState } from "react";
import {
  MapPin,
  Navigation,
  Copy,
  CheckCheck,
  Compass,
  Car,
  Bus,
  ExternalLink,
} from "lucide-react";
import { siteConfig } from "@/data/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ScrollTrigger } from "@/lib/gsap";

export const MapBlock: React.FC = () => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasEmbedUrl = Boolean(
    siteConfig.mapEmbedUrl && siteConfig.mapEmbedUrl.trim().length > 0
  );

  const handleLoadMap = () => {
    setIframeLoaded(true);
    // Refresh ScrollTrigger as layout might adjust
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(siteConfig.address.full);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const travelTips = [
    {
      title: "Landmark",
      description: "Opposite Shriram Nagar Arch, near Sawli Housing Society entrance.",
      icon: Compass,
    },
    {
      title: "Parking Facility",
      description: "Dedicated patient parking bays available right in front of the clinic.",
      icon: Car,
    },
    {
      title: "Public Transit",
      description: "5-minute auto rickshaw ride from Ahilyanagar Central Bus Station.",
      icon: Bus,
    },
  ];

  return (
    <section aria-labelledby="clinic-location-heading" className="py-14 sm:py-16 bg-surface-alt/50 border-b border-line">
      <Container>
        <div className="space-y-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-accent-deep block">
              Clinic Location & Directions
            </span>
            <h2
              id="clinic-location-heading"
              className="text-display-sm sm:text-display-md font-display text-ink tracking-tight mt-1"
            >
              How to Reach GuruOm Dental
            </h2>
            <p className="mt-1 text-sm text-ink-muted max-w-2xl">
              Conveniently situated in Ahilyanagar with barrier-free ground floor access and
              dedicated patient parking.
            </p>
          </div>

          {/* Interactive Map Frame */}
          <div className="relative w-full h-[360px] sm:h-[440px] md:h-[480px] rounded-3xl overflow-hidden border border-line bg-surface shadow-card">
            {iframeLoaded && hasEmbedUrl ? (
              <iframe
                src={siteConfig.mapEmbedUrl}
                title="Map showing GuruOm Dental location"
                width="100%"
                height="100%"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full border-0"
              />
            ) : (
              /* Static Privacy-Preserving Placeholder (Zero external HTTP requests until requested) */
              <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-surface to-surface-alt">
                {/* Decorative map grid background elements */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(var(--brand)_1px,transparent_1px)] [background-size:16px_16px]"
                />

                <div className="relative z-10 max-w-md mx-auto space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand text-white mx-auto flex items-center justify-center shadow-soft">
                    <MapPin className="w-7 h-7" aria-hidden="true" />
                  </div>

                  <div>
                    <h3 className="font-display font-semibold text-ink text-lg sm:text-xl">
                      GuruOm Dental Clinic
                    </h3>
                    <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                      {siteConfig.address.line1}, {siteConfig.address.line2},{" "}
                      {siteConfig.address.city}, {siteConfig.address.state}{" "}
                      {siteConfig.address.postalCode}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    {hasEmbedUrl ? (
                      <Button
                        type="button"
                        variant="primary"
                        size="md"
                        showIcon={false}
                        onClick={handleLoadMap}
                      >
                        <span className="flex items-center gap-2">
                          <Navigation className="w-4 h-4" />
                          <span>Load Interactive Map</span>
                        </span>
                      </Button>
                    ) : (
                      /* Developer note: mapEmbedUrl placeholder fallback */
                      <div className="space-y-3">
                        <Button
                          href={siteConfig.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="primary"
                          size="md"
                          showIcon={false}
                        >
                          <span className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4" />
                            <span>Open in Google Maps</span>
                          </span>
                        </Button>
                        <p className="text-[11px] text-ink-muted/80 italic">
                          (Developer: Add Google Maps embed URL to siteConfig.mapEmbedUrl to enable embedded view)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Details & Directions Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Address & Quick Actions */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-line shadow-soft space-y-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block">
                  Clinic Postal Address
                </span>
                <p className="text-sm font-medium text-ink mt-1 leading-relaxed">
                  {siteConfig.address.full}
                </p>
                <span className="text-xs text-ink-muted block mt-1">
                  Plus Code: <strong className="text-ink">{siteConfig.address.plusCode}</strong>
                </span>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <Button
                  href={siteConfig.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="primary"
                  size="sm"
                  showIcon={false}
                >
                  <span className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions</span>
                  </span>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  showIcon={false}
                  onClick={handleCopyAddress}
                  aria-label="Copy clinic address to clipboard"
                >
                  <span className="flex items-center gap-1.5">
                    {copied ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-success" />
                        <span className="text-success font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Address</span>
                      </>
                    )}
                  </span>
                </Button>
              </div>

              {/* Accessible live region for copy confirmation */}
              <div className="sr-only" aria-live="polite">
                {copied ? "Address copied to clipboard" : ""}
              </div>
            </div>

            {/* How to Reach Us Travel Tips */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {travelTips.map((tip) => {
                const Icon = tip.icon;
                return (
                  <div
                    key={tip.title}
                    className="bg-white p-5 rounded-3xl border border-line shadow-soft space-y-2"
                  >
                    <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <h4 className="font-display font-semibold text-ink text-xs sm:text-sm">
                      {tip.title}
                    </h4>
                    <p className="text-xs text-ink-muted leading-relaxed">
                      {tip.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
