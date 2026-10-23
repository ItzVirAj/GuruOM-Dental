import { notFound } from "next/navigation";
import { servicesData } from "@/data/services";
import { PageHeader, Container, Section, Card, Button } from "@/components/ui";

export function generateStaticParams() {
  return servicesData.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = servicesData.find((s) => s.slug === slug);
  if (!service) return { title: "Service Not Found" };

  return {
    title: `${service.title} | GuruOm Dental`,
    description: service.shortDescription,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = servicesData.find((s) => s.slug === slug);

  if (!service) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow="Specialized Care"
        title={service.title}
        description={service.longDescription}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: service.title },
        ]}
      />
      <Section variant="surface">
        <Container>
          <div className="max-w-2xl mx-auto space-y-6">
            <Card variant="white">
              <h2 className="text-display-md font-display text-ink mb-4">
                Treatment Overview
              </h2>
              <p className="text-body text-ink-muted mb-6 leading-relaxed">
                {service.shortDescription}
              </p>
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-line text-sm">
                <div>
                  <span className="text-xs uppercase tracking-wider text-ink-muted block">
                    Estimated Duration
                  </span>
                  <span className="font-semibold text-brand">
                    {service.duration}
                  </span>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-ink-muted block">
                    Starting Price
                  </span>
                  <span className="font-semibold text-brand">
                    {service.startingPrice}
                  </span>
                </div>
              </div>
              <div className="pt-6 flex flex-wrap gap-4">
                <Button href="/appointment" variant="primary">
                  Book Consultation
                </Button>
                <Button href="/services" variant="ghost">
                  All Services
                </Button>
              </div>
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}
