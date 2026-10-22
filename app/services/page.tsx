import { PageHeader, Container, Section, Card, Badge } from "@/components/ui";
import { dentalServices } from "@/data/dental-data";

export const metadata = {
  title: "Specialized Treatments",
  description: "Explore cosmetic dentistry, Swiss dental implants, clear invisible aligners, and painless root canals at GuruOm Dental.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        title="Clinical Treatments & Procedures"
        description="Every treatment at GuruOm Dental pairs Swiss & German precision engineering with painless protocols and lifetime aesthetic durability."
      />
      <Section variant="surface">
        <Container>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dentalServices.map((service) => (
              <Card key={service.id} variant="white" id={service.id}>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="accent" size="sm">{service.category}</Badge>
                  <span className="text-xs text-brand font-semibold">★ {service.highlight}</span>
                </div>
                <h3 className="text-heading text-ink mb-2">{service.title}</h3>
                <p className="text-small text-ink-muted mb-4">{service.description}</p>
                <div className="text-[11px] font-mono text-ink-muted pt-3 border-t border-line">
                  Duration: {service.duration}
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
