import { Container, Section, Button, Badge } from "@/components/ui";

export default function Home() {
  return (
    <main className="min-h-screen bg-surface flex items-center justify-center py-20">
      <Container>
        <div className="max-w-2xl mx-auto text-center space-y-6 bg-white p-10 sm:p-14 rounded-xl border border-line shadow-card">
          <div className="flex justify-center">
            <Badge variant="accent" size="md">
              Design System Ready
            </Badge>
          </div>

          <h1 className="text-display-lg text-ink font-display">
            GuruOm Dental
          </h1>

          <p className="text-body-lg text-ink-muted">
            The design system, color tokens, typography scale, responsive layout containers, UI primitives, and smart image placeholder system are ready.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Button href="/design-system" variant="primary" size="lg">
              Design System Showcase
            </Button>
            <Button href="/animation-lab" variant="secondary" size="lg">
              Open Animation Lab
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
