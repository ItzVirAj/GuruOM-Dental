import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  Sparkles,
  Clock,
  Languages,
  CheckCircle2,
  ArrowRight,
  Stethoscope,
} from "lucide-react";
import { doctorsData, getDoctorBySlug, Doctor } from "@/data/doctors";
import { servicesData, ServiceItem } from "@/data/services";
import { siteConfig } from "@/data/site";
import { PageHeader, Container, Badge, SmartImage } from "@/components/ui";
import { Reveal } from "@/components/animations";
import {
  DoctorStickyPortrait,
  DoctorMobileBookingBar,
} from "@/components/sections";

export function generateStaticParams() {
  return doctorsData.map((doc) => ({
    slug: doc.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doctor = getDoctorBySlug(slug);

  if (!doctor) {
    return {
      title: "Doctor Not Found",
    };
  }

  const cleanName = doctor.name.replace("Placeholder ", "");

  return {
    title: `${cleanName} - ${doctor.role}`,
    description: doctor.shortBio,
    openGraph: {
      title: `${cleanName} | ${doctor.role} | GuruOm Dental`,
      description: doctor.shortBio,
      url: `${siteConfig.url}/doctors/${doctor.slug}`,
      siteName: siteConfig.name,
      type: "profile",
    },
    alternates: {
      canonical: `/doctors/${doctor.slug}`,
    },
  };
}

function getRelatedServices(doctor: Doctor): ServiceItem[] {
  const matched = servicesData.filter((svc) => {
    return doctor.specialties.some((spec) => {
      const specLower = spec.toLowerCase();
      const titleLower = svc.title.toLowerCase();
      const slugLower = svc.slug.toLowerCase();
      return (
        titleLower.includes(specLower) ||
        slugLower.includes(specLower) ||
        (specLower.includes("implant") && slugLower.includes("implant")) ||
        (specLower.includes("endodontic") && slugLower.includes("root-canal")) ||
        (specLower.includes("cosmetic") && slugLower.includes("cosmetic")) ||
        (specLower.includes("orthodontic") && slugLower.includes("orthodontic")) ||
        (specLower.includes("aligner") && slugLower.includes("orthodontic")) ||
        (specLower.includes("pediatric") && slugLower.includes("pediatric")) ||
        (specLower.includes("periodontic") && slugLower.includes("cleaning"))
      );
    });
  });

  const pool = [...matched, ...servicesData];
  const uniqueSlugs = new Set<string>();
  const result: ServiceItem[] = [];

  for (const svc of pool) {
    if (!uniqueSlugs.has(svc.slug)) {
      uniqueSlugs.add(svc.slug);
      result.push(svc);
    }
    if (result.length === 3) break;
  }

  return result;
}

export default async function DoctorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doctor = getDoctorBySlug(slug);

  if (!doctor) {
    notFound();
  }

  const cleanName = doctor.name.replace("Placeholder ", "");
  const relatedServices = getRelatedServices(doctor);
  const otherDoctors = doctorsData
    .filter((d) => d.slug !== doctor.slug)
    .slice(0, 3);

  // Physician JSON-LD structured data with only verifiable data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: doctor.name,
    jobTitle: doctor.role,
    description: doctor.shortBio,
    medicalSpecialty: doctor.specialties,
    knowsLanguage: doctor.languages,
    worksFor: {
      "@type": "DentalClinic",
      name: siteConfig.name,
      url: siteConfig.url,
      telephone: siteConfig.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: siteConfig.address.street,
        addressLocality: siteConfig.address.city,
        addressRegion: siteConfig.address.state,
        postalCode: siteConfig.address.pincode,
        addressCountry: "IN",
      },
    },
  };

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <>
      {/* 1. Physician Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 2. Upgraded PageHeader with breadcrumbs */}
      <PageHeader
        eyebrow={doctor.role}
        title={doctor.name}
        description={doctor.shortBio}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Doctors", href: "/doctors" },
          { label: cleanName },
        ]}
      />

      {/* 3. Main Profile Body: Two-Column Layout */}
      <section className="py-14 sm:py-20 lg:py-24 bg-surface">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left Column: Sticky Portrait Card (Desktop) / Top Portrait (Mobile) */}
            <div className="lg:col-span-5">
              <DoctorStickyPortrait doctor={doctor} />
            </div>

            {/* Right Column: Bio, Qualifications, Focus Areas, Availability & Services */}
            <div className="lg:col-span-7 space-y-12">
              {/* Doctor Header & Bio Section */}
              <Reveal variant="up" delay={0.05}>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {doctor.specialties.map((spec) => (
                      <Badge
                        key={spec}
                        variant="accent"
                        size="sm"
                        className="text-xs uppercase tracking-wider font-semibold"
                      >
                        {spec}
                      </Badge>
                    ))}
                  </div>

                  <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-ink">
                    About {cleanName}
                  </h2>

                  <p className="text-sm sm:text-base font-medium text-brand">
                    {doctor.role}
                  </p>

                  <div className="space-y-4 pt-2 text-ink-muted leading-relaxed text-sm sm:text-base">
                    {doctor.longBio.map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* Qualifications & Academic Credentials */}
              <Reveal variant="up" delay={0.1}>
                <div className="rounded-2xl bg-surface-alt/50 border border-surface-alt p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-3 text-ink">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <GraduationCap className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-bold">
                      Credentials & Qualifications
                    </h3>
                  </div>

                  <ul className="space-y-3 pt-2">
                    {doctor.qualifications.map((qual, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-ink/90">
                        <CheckCircle2
                          className="h-4 w-4 text-brand shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{qual}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              {/* Clinical Focus Areas (Grid of 4 Chips/Cards) */}
              <Reveal variant="up" delay={0.15}>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-accent-dark" aria-hidden="true" />
                    <h3 className="font-display text-lg sm:text-xl font-bold text-ink">
                      Clinical Focus Areas
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {doctor.focusAreas.map((area, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-surface-alt/90 shadow-xs hover:border-brand/30 transition-colors"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent-dark text-xs font-bold">
                          {String(idx + 1).padStart(2, "0")}
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-ink">
                          {area}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* Consultation Availability & Languages */}
              <Reveal variant="up" delay={0.2}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Availability */}
                  <div className="rounded-2xl bg-surface border border-surface-alt/90 p-5 space-y-3">
                    <div className="flex items-center gap-2.5 text-ink">
                      <Clock className="h-4 w-4 text-brand" aria-hidden="true" />
                      <h3 className="font-display text-sm font-bold">
                        Clinical Schedule
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {weekDays.map((day) => {
                        const isAvailable = doctor.availability.days.includes(day);
                        return (
                          <span
                            key={day}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                              isAvailable
                                ? "bg-brand text-white shadow-xs"
                                : "bg-surface-alt/60 text-ink-muted/50"
                            }`}
                          >
                            {day}
                          </span>
                        );
                      })}
                    </div>

                    <p className="text-xs text-ink-muted pt-1">
                      Hours: <span className="font-medium text-ink">{doctor.availability.hours}</span>
                    </p>
                  </div>

                  {/* Languages Spoken */}
                  <div className="rounded-2xl bg-surface border border-surface-alt/90 p-5 space-y-3">
                    <div className="flex items-center gap-2.5 text-ink">
                      <Languages className="h-4 w-4 text-brand" aria-hidden="true" />
                      <h3 className="font-display text-sm font-bold">
                        Languages Spoken
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {doctor.languages.map((lang) => (
                        <span
                          key={lang}
                          className="px-3 py-1 rounded-full bg-surface-alt text-xs font-medium text-ink border border-surface-alt/80"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-ink-muted pt-1">
                      Consultation in your preferred language
                    </p>
                  </div>
                </div>
              </Reveal>

              {/* Related Services Row */}
              <Reveal variant="up" delay={0.25}>
                <div className="space-y-4 pt-4 border-t border-surface-alt">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg sm:text-xl font-bold text-ink">
                      Treatments by {cleanName}
                    </h3>
                    <Link
                      href="/services"
                      className="text-xs font-semibold text-brand hover:underline inline-flex items-center gap-1"
                    >
                      All Services
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {relatedServices.map((service) => (
                      <Link
                        key={service.slug}
                        href={`/services/${service.slug}`}
                        className="group flex flex-col p-4 rounded-xl bg-surface-alt/40 border border-surface-alt hover:border-brand/40 hover:bg-surface transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-brand"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand mb-3 group-hover:scale-105 transition-transform">
                          <Stethoscope className="h-4 w-4" />
                        </div>
                        <h4 className="font-display text-xs sm:text-sm font-bold text-ink group-hover:text-brand transition-colors line-clamp-1">
                          {service.title}
                        </h4>
                        <p className="text-[11px] text-ink-muted mt-1 line-clamp-2 leading-relaxed">
                          {service.shortDescription}
                        </p>
                        <span className="mt-auto pt-3 text-[11px] font-semibold text-brand inline-flex items-center gap-1">
                          Explore
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* 4. "Other Doctors" Section at the Bottom */}
      <section className="py-16 sm:py-20 bg-surface-alt/30 border-t border-surface-alt">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-brand">
                Clinical Faculty
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-1">
                Other Specialists at GuruOm Dental
              </h2>
            </div>
            <Link
              href="/doctors"
              className="text-sm font-semibold text-brand hover:underline inline-flex items-center gap-1.5"
            >
              View Full Team
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {otherDoctors.map((otherDoc) => (
              <Link
                key={otherDoc.slug}
                href={`/doctors/${otherDoc.slug}`}
                className="group flex gap-4 p-4 rounded-2xl bg-surface border border-surface-alt/90 shadow-xs hover:border-brand/40 hover:shadow-md hover:-translate-y-1 transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {/* Compact 3/4 Image */}
                <div className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-xl bg-surface-alt">
                  <SmartImage
                    slot={otherDoc.imageSlot}
                    alt={`${otherDoc.name} - ${otherDoc.role}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-col justify-between py-1">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand tracking-wider">
                      {otherDoc.specialties[0]}
                    </span>
                    <h3 className="font-display text-sm sm:text-base font-bold text-ink group-hover:text-brand transition-colors mt-0.5 line-clamp-1">
                      {otherDoc.name.replace("Placeholder ", "")}
                    </h3>
                    <p className="text-xs text-ink-muted line-clamp-1 mt-0.5">
                      {otherDoc.role}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 text-ink-muted">
                    <span>{otherDoc.experienceYears}+ Yrs</span>
                    <span className="font-semibold text-brand inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Profile
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* 5. Mobile Sticky Bottom Booking Bar */}
      <DoctorMobileBookingBar doctor={doctor} />
    </>
  );
}
