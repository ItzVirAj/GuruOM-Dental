import { PageHeader, Container, Section, Card, Badge } from "@/components/ui";
import { doctors } from "@/data/dental-data";

export const metadata = {
  title: "Our Specialists",
  description: "Meet the dental surgeons, implantologists, and aesthetic smile designers at GuruOm Dental.",
};

export default function DoctorsPage() {
  return (
    <>
      <PageHeader
        title="Meet Our Dental Specialists"
        description="Our clinical team brings over 25+ combined years of maxillofacial surgery, aesthetic dentistry, and digital endodontics."
      />
      <Section variant="white">
        <Container>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {doctors.map((doctor) => (
              <Card key={doctor.id} variant="alt" id={doctor.id}>
                <div className="space-y-3">
                  <Badge variant="brand" size="sm">{doctor.experience}</Badge>
                  <h3 className="text-display-md text-ink">{doctor.name}</h3>
                  <p className="text-small font-semibold text-brand">{doctor.role}</p>
                  <p className="text-small text-ink-muted">{doctor.specialization}</p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
