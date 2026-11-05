import React from "react";
import { Container, Button, DoctorCard } from "@/components/ui";
import { Reveal } from "@/components/animations/Reveal";
import { doctorsData } from "@/data/doctors";

export const HomeDoctors: React.FC = () => {
  const featuredDoctors = doctorsData.filter((d) => d.featured).slice(0, 3);

  return (
    <section
      aria-label="Featured doctors"
      className="py-16 sm:py-20 md:py-24 bg-surface/50 border-b border-line"
    >
      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand">
              Clinical Leadership
            </span>
            <h2 className="text-display-md sm:text-display-lg font-display text-ink tracking-tight mt-1">
              Meet our doctors.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-ink-muted leading-relaxed">
              Experienced dental specialists combining gentle clinical touch with advanced training in digital implantology, microscopic endodontics, and orthodontic smile design.
            </p>
          </div>

          <div className="shrink-0">
            <Button href="/about" variant="secondary" size="md">
              Meet the full team
            </Button>
          </div>
        </div>

        {/* Doctor Cards Staggered Reveal */}
        <Reveal variant="up" stagger={0.15} className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8 sm:gap-10">
          {featuredDoctors.map((doc) => (
            <div key={doc.slug} className="h-full">
              <DoctorCard doctor={doc} />
            </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
};

