import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader, Container } from "@/components/ui";
import { BookingWizard } from "@/components/sections/appointment";
import { doctorsData } from "@/data/doctors";
import { servicesData } from "@/data/services";
import { carePlans } from "@/data/pricing";
import { siteConfig } from "@/data/site";

interface AppointmentPageProps {
  searchParams: Promise<{
    doctor?: string;
    plan?: string;
    service?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: AppointmentPageProps): Promise<Metadata> {
  const params = await searchParams;
  const hasQueryParams = Boolean(params.doctor || params.plan || params.service);

  return {
    title: "Book an Appointment | GuruOm Dental",
    description:
      "Schedule your priority dental appointment in 3 simple steps with our specialists at GuruOm Dental Ahilyanagar. Painless care, clear diagnostics, and immediate confirmation.",
    openGraph: {
      title: "Book an Appointment | GuruOm Dental",
      description:
        "Schedule your priority dental consultation in 3 simple steps. Choose your specialist and preferred time slot.",
      url: `${siteConfig.url}/appointment`,
      siteName: siteConfig.name,
      type: "website",
    },
    alternates: {
      canonical: "/appointment",
    },
    robots: hasQueryParams
      ? {
          index: false,
          follow: true,
        }
      : {
          index: true,
          follow: true,
        },
  };
}

// Dynamic SearchParams resolver isolated within Suspense boundary for Next.js 16 PPR
async function AppointmentWizardContainer({
  searchParams,
}: {
  searchParams: Promise<{ doctor?: string; plan?: string; service?: string }>;
}) {
  const params = await searchParams;

  // Validate prefilled query parameters against our clinical datasets
  const validService = servicesData.some((s) => s.slug === params.service)
    ? params.service
    : undefined;

  const validDoctor =
    params.doctor === "any" || doctorsData.some((d) => d.slug === params.doctor)
      ? params.doctor
      : "any";

  const validPlan = carePlans.some((p) => p.id === params.plan)
    ? params.plan
    : undefined;

  return (
    <BookingWizard
      initialService={validService}
      initialDoctor={validDoctor}
      initialPlan={validPlan}
    />
  );
}

function AppointmentLoadingFallback() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
      <div className="lg:col-span-7 xl:col-span-8 bg-white border border-line rounded-3xl p-8 sm:p-10 shadow-card animate-pulse space-y-8">
        <div className="h-8 bg-surface-alt rounded-xl w-1/3" />
        <div className="h-4 bg-surface-alt rounded-lg w-2/3" />
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="h-24 bg-surface-alt rounded-2xl" />
          <div className="h-24 bg-surface-alt rounded-2xl" />
        </div>
      </div>
      <div className="hidden lg:block lg:col-span-5 xl:col-span-4 bg-white border border-line rounded-3xl p-6 shadow-soft animate-pulse space-y-4">
        <div className="h-6 bg-surface-alt rounded-xl w-1/2" />
        <div className="h-20 bg-surface-alt rounded-2xl" />
        <div className="h-20 bg-surface-alt rounded-2xl" />
      </div>
    </div>
  );
}

export default function AppointmentPage({ searchParams }: AppointmentPageProps) {
  return (
    <main id="main-content" className="bg-surface/50 min-h-screen">
      {/* 1. Page Header */}
      <PageHeader
        eyebrow="Book a Visit"
        title="Book your appointment in 3 simple steps."
        description="Choose your treatment, select an available date, and leave your contact details. Our team will verify and hold your priority chair time."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Appointment" },
        ]}
      />

      {/* 2. Interactive Booking Wizard & Summary Area */}
      <div className="py-12 sm:py-16 md:py-20">
        <Container>
          <Suspense fallback={<AppointmentLoadingFallback />}>
            <AppointmentWizardContainer searchParams={searchParams} />
          </Suspense>
        </Container>
      </div>
    </main>
  );
}
