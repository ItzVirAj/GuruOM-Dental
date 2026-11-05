import React from "react";
import { Phone, Mail, Building2, MapPin, Sparkles } from "lucide-react";
import { labs, type LabLocation } from "@/data/labs";
import { siteConfig } from "@/data/site";
import { Container } from "@/components/ui/Container";

interface LocationCardProps {
  location: LabLocation;
  badgeLabel: string;
  isPrimaryLab?: boolean;
}

function LocationCard({ location, badgeLabel, isPrimaryLab = false }: LocationCardProps) {
  const phone = location.phone || siteConfig.phone;
  const rawPhone = phone.replace(/[^+\d]/g, "");
  const email = location.email || siteConfig.email;

  return (
    <article
      className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 transition-all duration-300 border ${
        isPrimaryLab
          ? "bg-white border-brand/20 shadow-soft hover:shadow-card hover:border-brand/40"
          : "bg-white border-line shadow-soft hover:shadow-card hover:border-brand/30"
      }`}
    >
      <div className="space-y-4">
        {/* Header row: Name & Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-xl sm:text-2xl text-ink tracking-tight">
              {location.name}
            </h3>
            {location.districtName && location.districtName !== location.name && (
              <p className="text-xs text-ink-muted font-body">
                {location.districtName}
              </p>
            )}
          </div>
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold tracking-wide shrink-0 ${
              isPrimaryLab
                ? "bg-brand/10 text-brand-dark border border-brand/20"
                : "bg-surface-alt text-ink-muted border border-line"
            }`}
          >
            {isPrimaryLab ? (
              <Sparkles className="w-3 h-3 text-accent" aria-hidden="true" />
            ) : (
              <MapPin className="w-3 h-3 text-ink-muted" aria-hidden="true" />
            )}
            <span>{badgeLabel}</span>
          </span>
        </div>

        {/* Tagline / Subtitle */}
        {location.tagline && (
          <p className="text-xs sm:text-sm text-ink-muted font-body leading-relaxed line-clamp-2">
            {location.tagline}
          </p>
        )}
      </div>

      {/* Contact Channels: Mobile & Mail */}
      <div className="pt-6 mt-6 border-t border-line/70 space-y-3 font-body">
        {/* Mobile Number */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-surface-alt flex items-center justify-center text-brand shrink-0">
            <Phone className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <span className="block text-[11px] uppercase tracking-wider text-ink-muted font-medium">
              Mobile Number
            </span>
            <a
              href={`tel:${rawPhone}`}
              className="text-sm sm:text-base font-semibold text-ink hover:text-brand transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-sm truncate block"
              aria-label={`Call ${location.name} at ${phone}`}
            >
              {phone}
            </a>
          </div>
        </div>

        {/* Email Address */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-surface-alt flex items-center justify-center text-brand shrink-0">
            <Mail className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <span className="block text-[11px] uppercase tracking-wider text-ink-muted font-medium">
              Email Address
            </span>
            <a
              href={`mailto:${email}`}
              className="text-sm sm:text-base font-semibold text-ink hover:text-brand transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-sm truncate block"
              aria-label={`Email ${location.name} at ${email}`}
            >
              {email}
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

export function LabsContactView() {
  const precisionLabs = labs.filter((l) => l.type === "lab");
  const serviceAreas = labs.filter((l) => l.type === "service");

  return (
    <section aria-label="Labs and Service Areas Directory" className="py-12 sm:py-16 md:py-20 bg-surface">
      <Container>
        <div className="space-y-16 sm:space-y-20">
          {/* Section 1: In-House Digital Precision Labs */}
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-line pb-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand mb-2">
                  <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Precision Facilities</span>
                </div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink tracking-tight">
                  In-House Digital Precision Labs
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-ink-muted font-body max-w-md">
                Direct mobile and email contact for CAD/CAM milling, 3D printing, and prosthetics fabrication facilities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {precisionLabs.map((lab) => (
                <LocationCard
                  key={lab.id}
                  location={lab}
                  badgeLabel="Digital Lab"
                  isPrimaryLab={true}
                />
              ))}
            </div>
          </div>

          {/* Section 2: Regional Service & Delivery Hubs */}
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-line pb-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand mb-2">
                  <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Regional Network</span>
                </div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink tracking-tight">
                  Regional Clinical Service Areas
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-ink-muted font-body max-w-md">
                Dedicated regional service desks coordinating doctor intake, scheduled pickups, and delivery across Maharashtra.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {serviceAreas.map((area) => (
                <LocationCard
                  key={area.id}
                  location={area}
                  badgeLabel="Service Hub"
                  isPrimaryLab={false}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default LabsContactView;

