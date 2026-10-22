import { PageHeader, Container, Section, Card, Button } from "@/components/ui";

export const metadata = {
  title: "Pricing & Plans",
  description: "Transparent treatment pricing and flexible EMI plans at GuruOm Dental.",
};

export default function PricingPage() {
  return (
    <>
      <PageHeader
        title="Transparent Clinical Pricing"
        description="Zero hidden fees, upfront treatment estimates, and interest-free EMI options tailored to high-value restorative procedures."
      />
      <Section variant="surface">
        <Container>
          <div className="grid md:grid-cols-3 gap-6">
            <Card variant="white">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand">Preventive Care</span>
              <h3 className="text-heading text-ink mt-2 mb-4">Diagnostics & Cleaning</h3>
              <p className="text-body-lg font-bold text-ink mb-4">Starting ₹1,500</p>
              <p className="text-small text-ink-muted mb-6">
                Comprehensive 3D intraoral scan, ultrasonic scaling, and laser polish.
              </p>
              <Button href="/appointment" variant="ghost" size="sm">Select Plan</Button>
            </Card>
            <Card variant="white" className="border-brand">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent font-bold">Most Popular</span>
              <h3 className="text-heading text-ink mt-2 mb-4">Smile Makeover</h3>
              <p className="text-body-lg font-bold text-ink mb-4">Starting ₹9,000 / tooth</p>
              <p className="text-small text-ink-muted mb-6">
                Digital smile design preview, ultra-thin ceramic veneer, and lifetime shade guarantee.
              </p>
              <Button href="/appointment" variant="primary" size="sm">Select Plan</Button>
            </Card>
            <Card variant="white">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand">Restorative</span>
              <h3 className="text-heading text-ink mt-2 mb-4">Swiss Implants</h3>
              <p className="text-body-lg font-bold text-ink mb-4">Starting ₹25,000</p>
              <p className="text-small text-ink-muted mb-6">
                Titanium biocompatible fixture, 3D surgical guide, and custom zirconia abutment.
              </p>
              <Button href="/appointment" variant="ghost" size="sm">Select Plan</Button>
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}
