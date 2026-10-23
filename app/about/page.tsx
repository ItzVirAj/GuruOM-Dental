import { PageHeader, Container, Section, Card, IconCircle } from "@/components/ui";
import { Shield, Sparkles, Heart } from "lucide-react";

export const metadata = {
  title: "About Us",
  description: "Learn about GuruOm Dental, our founding philosophy, technology, and gentle clinical standards.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Story & Philosophy"
        title="About GuruOm Dental"
        description="Founded with a dedication to zero-anxiety dentistry, microscopic surgical precision, and world-class smile restoration."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "About" },
        ]}
      />
      <Section variant="white">
        <Container>
          <div className="grid md:grid-cols-3 gap-6">
            <Card variant="alt">
              <IconCircle variant="accent" icon={<Shield className="w-5 h-5" />} className="mb-4" />
              <h3 className="text-heading text-ink mb-2">Hospital-Grade Safety</h3>
              <p className="text-small text-ink-muted">
                Class-B vacuum autoclaves, biological monitoring, and disposable barriers for 100% sterile peace of mind.
              </p>
            </Card>
            <Card variant="alt">
              <IconCircle variant="accent" icon={<Sparkles className="w-5 h-5" />} className="mb-4" />
              <h3 className="text-heading text-ink mb-2">Microscopic Precision</h3>
              <p className="text-small text-ink-muted">
                High-magnification surgical optics enable ultra-conservative, tissue-preserving dental procedures.
              </p>
            </Card>
            <Card variant="alt">
              <IconCircle variant="accent" icon={<Heart className="w-5 h-5" />} className="mb-4" />
              <h3 className="text-heading text-ink mb-2">Calm & Compassionate</h3>
              <p className="text-small text-ink-muted">
                Designed to soothe dental anxiety through natural daylight, acoustic damping, and compassionate touch.
              </p>
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}
