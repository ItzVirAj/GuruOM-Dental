import { Container, Button, Badge } from "@/components/ui";
import { SplitHeading, Reveal } from "@/components/animations";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* 1. Dark Hero Block (To test transparent-light navbar variant) */}
      <section className="relative bg-brand-dark text-white pt-36 pb-24 lg:pt-44 lg:pb-32 overflow-hidden border-b border-brand-light/20">
        {/* Subtle ambient lighting */}
        <div
          className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-accent/15 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 left-10 h-72 w-72 rounded-full bg-brand/30 blur-2xl"
          aria-hidden="true"
        />

        <Container>
          <div className="max-w-3xl flex flex-col gap-6">
            <Reveal>
              <div className="flex items-center gap-3">
                <Badge variant="accent" size="sm">
                  Clinical Excellence
                </Badge>
                <span className="text-xs uppercase tracking-widest text-surface-alt/70 font-medium">
                  Transparent Navbar Test Zone
                </span>
              </div>
            </Reveal>

            <SplitHeading
              as="h1"
              type="words"
              className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
            >
              Advanced dentistry with calm, gentle precision.
            </SplitHeading>

            <Reveal delay={0.2}>
              <p className="text-surface-alt/85 text-lg sm:text-xl leading-relaxed max-w-2xl">
                Experience pain-free treatments, 3D diagnostics, and bespoke aesthetic smile design in an atmosphere crafted for total peace of mind.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Button href="/appointment" variant="secondary" size="lg" className="text-brand-dark font-bold">
                  Book Free Consultation
                </Button>
                <Button
                  href="/services"
                  variant="ghost"
                  size="lg"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Explore Treatments
                </Button>
              </div>
            </Reveal>

            {/* Hint box for testing */}
            <Reveal delay={0.4}>
              <div className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-xs flex items-center gap-4 text-xs text-surface-alt/80">
                <span className="flex h-3 w-3 rounded-full bg-accent animate-pulse" />
                <span>
                  <strong>Navbar behavior test:</strong> At top of page, navbar is transparent with light typography. As soon as you scroll past 40px, it turns solid with a frosted backdrop blur.
                </span>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* 2. 150vh Scroll Playground to test Hide/Show Behavior */}
      <section className="bg-surface py-20 min-h-[150vh] relative">
        <Container>
          <div className="max-w-4xl mx-auto flex flex-col gap-16">
            {/* Scroll instructions */}
            <Reveal>
              <div className="rounded-3xl bg-white p-8 sm:p-12 border border-surface-alt shadow-sm flex flex-col gap-6">
                <Badge variant="outline" size="sm" className="w-fit">
                  Scroll Interaction Lab
                </Badge>
                <h2 className="font-display text-2xl sm:text-3xl text-ink font-bold">
                  Scroll down to test auto-hide, scroll up to reveal
                </h2>
                <p className="text-ink-muted text-base leading-relaxed">
                  The navbar uses GSAP ScrollTrigger debouncing to detect scroll delta. When scrolling downward, the navbar slides out of view. When reversing upward, it smoothly slides back down into view.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-surface-alt">
                    <span className="text-xs uppercase tracking-wider text-ink-muted font-bold">Top State</span>
                    <p className="text-sm font-semibold text-ink mt-1">Transparent / Light</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-alt">
                    <span className="text-xs uppercase tracking-wider text-ink-muted font-bold">Scrolled (&gt;40px)</span>
                    <p className="text-sm font-semibold text-ink mt-1">Solid Frost + 64px</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-alt">
                    <span className="text-xs uppercase tracking-wider text-ink-muted font-bold">Scroll Down</span>
                    <p className="text-sm font-semibold text-ink mt-1">Hidden (-100% Y)</p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Test Cards & Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Reveal delay={0.1}>
                <div className="rounded-2xl bg-white p-8 border border-surface-alt shadow-xs flex flex-col justify-between h-full">
                  <div>
                    <h3 className="font-display text-xl font-bold text-ink">Design System Showcase</h3>
                    <p className="text-sm text-ink-muted mt-2 leading-relaxed">
                      Inspect color tokens, typography scales, buttons, badges, and smart images.
                    </p>
                  </div>
                  <div className="mt-6">
                    <Button href="/design-system" variant="primary" size="md">
                      View Design System
                    </Button>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <div className="rounded-2xl bg-white p-8 border border-surface-alt shadow-xs flex flex-col justify-between h-full">
                  <div>
                    <h3 className="font-display text-xl font-bold text-ink">Animation Foundation</h3>
                    <p className="text-sm text-ink-muted mt-2 leading-relaxed">
                      Test SplitHeading, Reveal, MagneticWrap, Marquee, and Lenis smooth scrolling.
                    </p>
                  </div>
                  <div className="mt-6">
                    <Button href="/animation-lab" variant="primary" size="md">
                      View Animation Lab
                    </Button>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Tall spacers for 150vh testing */}
            <div className="flex flex-col gap-12 py-10">
              {[1, 2, 3].map((sectionNum) => (
                <div
                  key={sectionNum}
                  className="rounded-2xl border-2 border-dashed border-surface-alt p-12 text-center flex flex-col items-center justify-center gap-3 bg-surface-alt/30"
                >
                  <span className="text-xs uppercase font-bold tracking-widest text-brand">
                    Scroll Checkpoint {sectionNum}
                  </span>
                  <p className="font-display text-xl text-ink">
                    Continue scrolling to test Footer reveal animations and back-to-top button
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
