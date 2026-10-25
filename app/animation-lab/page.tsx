"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Shield,
  Activity,
  Heart,
  Eye,
  CheckCircle,
  ArrowUp,
  Zap,
} from "lucide-react";
import {
  Container,
  Section,
  Button,
  Eyebrow,
  SectionHeading,
  Badge,
  Card,
  IconCircle,
} from "@/components/ui";
import {
  Reveal,
  SplitHeading,
  Marquee,
  Counter,
  ParallaxImage,
  MagneticWrap,
  PinSection,
  useLenis,
} from "@/components/animations";
import { useReducedMotion, useIsDesktop } from "@/hooks";

export default function AnimationLabPage() {
  const reducedMotion = useReducedMotion();
  const isDesktop = useIsDesktop(1024);
  const lenis = useLenis();
  const [logMessage, setLogMessage] = useState<string>("");

  const handleLogReducedMotion = () => {
    const msg = `prefers-reduced-motion: ${reducedMotion ? "ACTIVE (reduced motion ON)" : "INACTIVE (animations ENABLED)"} | Desktop (>=1024px): ${isDesktop}`;
    console.log("[Animation Lab]", msg);
    setLogMessage(msg);
    setTimeout(() => setLogMessage(""), 4000);
  };

  const scrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Ensure all ScrollTriggers are accurately computed after page paint
  React.useEffect(() => {
    const timer = setTimeout(() => {
      import("@/lib/gsap").then(({ ScrollTrigger }) => {
        ScrollTrigger.refresh();
      });
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-surface pb-32">
      {/* Temporary Notice Banner */}
      <div className="sticky top-0 z-50 bg-warning/15 backdrop-blur-md border-b border-warning/30 px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-ink shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
          <span>
            <strong>Animation Lab & Motion Engine Workbench:</strong> Temporary page, delete before launch.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant={reducedMotion ? "warning" : "success"}
            size="sm"
          >
            Reduced Motion: {reducedMotion ? "ON" : "OFF"}
          </Badge>

          <button
            onClick={handleLogReducedMotion}
            className="px-3 py-1 rounded-pill bg-white border border-warning/40 hover:bg-warning/20 text-[11px] font-semibold text-ink transition-colors"
          >
            Check Accessibility State
          </button>

          <Link
            href="/design-system"
            className="text-ink hover:text-brand underline font-semibold text-[11px]"
          >
            Design System →
          </Link>
        </div>
      </div>

      {logMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-brand-dark text-white text-xs px-4 py-3 rounded-lg shadow-float border border-brand animate-fade-in font-mono">
          {logMessage}
        </div>
      )}

      {/* Lab Header with viewport breathing room */}
      <header className="bg-white border-b border-line py-20 min-h-[50vh] flex flex-col justify-center">
        <Container>
          <div className="max-w-3xl space-y-4">
            <Eyebrow variant="dot" color="brand">Motion Framework</Eyebrow>
            <h1 className="text-display-lg text-ink font-display">
              GSAP + Lenis Animation Foundation
            </h1>
            <p className="text-body-lg text-ink-muted">
              Production-ready, accessible, and high-performance primitives. Scroll down slowly below the fold to watch ScrollTrigger reveals, SplitText masking, vertical rolling odometers, parallax, and pinned slides trigger into view.
            </p>
            <div className="pt-6 flex items-center gap-3 text-xs font-semibold text-brand animate-bounce">
              <span>↓ Scroll down to test triggers</span>
            </div>
          </div>
        </Container>
      </header>

      {/* 1. REVEAL: VARIANTS & STAGGER */}
      <Section variant="surface" id="reveal">
        <Container>
          <SectionHeading
            align="left"
            eyebrow="Primitive: <Reveal>"
            title="1. ScrollTrigger Reveals & Stagger Grids"
            description="Supports 7 directional/optical variants with autoAlpha no-flash protection and reduced-motion fallback. (Set to once={false} so you can scroll up and down repeatedly)."
            className="mb-14"
          />

          {/* Individual Variants */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
            <Reveal variant="up" once={false}>
              <Card variant="white" className="p-5 text-center">
                <Badge variant="accent" size="sm" className="mb-2">variant=&quot;up&quot;</Badge>
                <p className="text-xs text-ink-muted">Slides up from y: 40</p>
              </Card>
            </Reveal>

            <Reveal variant="down" once={false}>
              <Card variant="white" className="p-5 text-center">
                <Badge variant="accent" size="sm" className="mb-2">variant=&quot;down&quot;</Badge>
                <p className="text-xs text-ink-muted">Slides down from y: -40</p>
              </Card>
            </Reveal>

            <Reveal variant="left" once={false}>
              <Card variant="white" className="p-5 text-center">
                <Badge variant="accent" size="sm" className="mb-2">variant=&quot;left&quot;</Badge>
                <p className="text-xs text-ink-muted">Slides in from right/left</p>
              </Card>
            </Reveal>

            <Reveal variant="right" once={false}>
              <Card variant="white" className="p-5 text-center">
                <Badge variant="accent" size="sm" className="mb-2">variant=&quot;right&quot;</Badge>
                <p className="text-xs text-ink-muted">Slides in from left/right</p>
              </Card>
            </Reveal>

            <Reveal variant="fade" once={false}>
              <Card variant="white" className="p-5 text-center">
                <Badge variant="accent" size="sm" className="mb-2">variant=&quot;fade&quot;</Badge>
                <p className="text-xs text-ink-muted">Pure opacity transition</p>
              </Card>
            </Reveal>

            <Reveal variant="scale" once={false}>
              <Card variant="white" className="p-5 text-center">
                <Badge variant="accent" size="sm" className="mb-2">variant=&quot;scale&quot;</Badge>
                <p className="text-xs text-ink-muted">Expands from scale: 0.94</p>
              </Card>
            </Reveal>

            <Reveal variant="blur" once={false}>
              <Card variant="white" className="p-5 text-center">
                <Badge variant="accent" size="sm" className="mb-2">variant=&quot;blur&quot;</Badge>
                <p className="text-xs text-ink-muted">Transitions from blur(10px)</p>
              </Card>
            </Reveal>
          </div>

          {/* Staggered Grid of 6 Cards */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Stagger Container (stagger=0.1s over 6 children, once=false)
            </h3>
            <Reveal variant="up" stagger={0.1} once={false} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Digital Smile Mockup", icon: <Sparkles className="w-5 h-5" /> },
                { title: "Guided Implantology", icon: <Shield className="w-5 h-5" /> },
                { title: "Microscopic RCT", icon: <Activity className="w-5 h-5" /> },
                { title: "Sensory Calming Suites", icon: <Heart className="w-5 h-5" /> },
                { title: "Zero-Radiation Imaging", icon: <Eye className="w-5 h-5" /> },
                { title: "Lifetime Precision Guarantee", icon: <CheckCircle className="w-5 h-5" /> },
              ].map((item, idx) => (
                <Card key={idx} variant="white">
                  <IconCircle variant="accent" size="md" icon={item.icon} className="mb-4" />
                  <h4 className="text-heading text-ink mb-2">{item.title}</h4>
                  <p className="text-small text-ink-muted">
                    Engineered with surgical standards and clinical compassion for anxiety-free outcomes.
                  </p>
                </Card>
              ))}
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* 2. SPLITHEADING: LINES, WORDS, CHARS */}
      <Section variant="white" id="split-heading">
        <Container>
          <SectionHeading
            align="left"
            eyebrow="Primitive: <SplitHeading>"
            title="2. SplitText Masking & Typography Animation"
            description="Deconstructs headlines into lines, words, or characters. Uses overflow-hidden mask clipping and screen-reader aria labels."
            className="mb-14"
          />

          <div className="space-y-16 border-t border-line pt-8">
            {/* Demo A: Lines + Mask */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-brand block uppercase tracking-wider">
                type=&quot;lines&quot; | mask=true (Scroll Triggered, once=false)
              </span>
              <SplitHeading as="h2" type="lines" mask={true} once={false} className="text-display-md text-ink max-w-3xl">
                Precision Implantology and Digital Aesthetics Crafted for Genuine Life Smiles.
              </SplitHeading>
            </div>

            {/* Demo B: Words */}
            <div className="space-y-2 border-t border-line/60 pt-8">
              <span className="text-xs font-mono text-brand block uppercase tracking-wider">
                type=&quot;words&quot; | mask=true (Scroll Triggered, once=false)
              </span>
              <SplitHeading as="h2" type="words" mask={true} once={false} className="text-display-md text-ink max-w-2xl">
                Every restoration is tailored to your unique anatomical facial symmetry.
              </SplitHeading>
            </div>

            {/* Demo C: Characters */}
            <div className="space-y-2 border-t border-line/60 pt-8">
              <span className="text-xs font-mono text-brand block uppercase tracking-wider">
                type=&quot;chars&quot; | mask=false (Scroll Triggered, once=false)
              </span>
              <SplitHeading as="h3" type="chars" mask={false} once={false} className="text-heading text-brand">
                Hospitality Meets Clinical Precision.
              </SplitHeading>
            </div>

            {/* Demo D: Load Triggered */}
            <div className="space-y-2 border-t border-line/60 pt-8">
              <span className="text-xs font-mono text-brand block uppercase tracking-wider">
                trigger=&quot;load&quot; (Immediate Entry)
              </span>
              <SplitHeading as="h3" type="lines" trigger="load" className="text-heading text-ink">
                Immediate entrance animation for hero viewports without requiring initial scroll.
              </SplitHeading>
            </div>
          </div>
        </Container>
      </Section>

      {/* 3. MARQUEE: SEAMLESS REPEATING TRACKS */}
      <Section variant="alt" id="marquee">
        <Container>
          <SectionHeading
            align="left"
            eyebrow="Primitive: <Marquee>"
            title="3. Seamless Infinite Marquee Loops"
            description="Infinite velocity animation with pause on hover, auto-recalculation via ResizeObserver, and optional scroll direction sync."
            className="mb-10"
          />
        </Container>

        <div className="space-y-6">
          {/* Row 1: Leftward moving with pill chips */}
          <Marquee speed={45} direction="left" pauseOnHover={true} gap={20}>
            {[
              "Digital Smile Design",
              "Swiss Titanium Implants",
              "Microscopic RCT",
              "Clear Aligners",
              "Laser Periodontics",
              "Sensory Calming Suites",
              "Zero-Pain Protocol",
              "Lifetime Implant Warranty",
            ].map((text, i) => (
              <Badge key={i} variant="brand" size="md" className="py-2.5 px-6 text-sm">
                ✦ {text}
              </Badge>
            ))}
          </Marquee>

          {/* Row 2: Rightward moving with cards */}
          <Marquee speed={35} direction="right" pauseOnHover={true} gap={24}>
            {[
              { id: "01", name: "Intraoral 3D Scans", desc: "No messy impressions" },
              { id: "02", name: "Painless Anesthesia", desc: "Computer-assisted delivery" },
              { id: "03", name: "Zeiss Optics", desc: "32x Optical magnification" },
              { id: "04", name: "Class-B Sterilization", desc: "Hospital-grade safety" },
              { id: "05", name: "Same-Day Restorations", desc: "Precision CAD/CAM milling" },
            ].map((item, i) => (
              <div
                key={i}
                className="w-72 bg-white rounded-xl p-4 border border-line shadow-soft flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-accent-soft text-brand font-bold flex items-center justify-center shrink-0 text-xs">
                  {item.id}
                </div>
                <div>
                  <div className="text-xs font-semibold text-ink">{item.name}</div>
                  <div className="text-[11px] text-ink-muted">{item.desc}</div>
                </div>
              </div>
            ))}
          </Marquee>
        </div>
      </Section>

      {/* 4. COUNTER: ODOMETER DIGIT ROLLS */}
      <Section variant="white" id="counter">
        <Container>
          <SectionHeading
            align="left"
            eyebrow="Primitive: <Counter>"
            title="4. Odometer Number Ticker"
            description="Rolls individual vertical 0-9 digit wheels to target numbers on viewport enter with accessible visually-hidden full text. (Set to once={false} so you can re-trigger on scroll)."
            className="mb-14"
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <Card variant="alt" className="text-center p-8">
              <div className="text-display-lg text-brand mb-2">
                <Counter value="25" suffix="+" duration={1.6} once={false} />
              </div>
              <p className="text-small font-semibold text-ink">Years of Excellence</p>
              <p className="text-[11px] text-ink-muted mt-1">Multi-generational trust</p>
            </Card>

            <Card variant="alt" className="text-center p-8">
              <div className="text-display-lg text-brand mb-2">
                <Counter value="99.9" suffix="%" duration={2.0} once={false} />
              </div>
              <p className="text-small font-semibold text-ink">Clinical Success Rate</p>
              <p className="text-[11px] text-ink-muted mt-1">Swiss protocol standards</p>
            </Card>

            <Card variant="alt" className="text-center p-8">
              <div className="text-display-lg text-brand mb-2">
                <Counter value="14" suffix="k+" duration={1.8} once={false} />
              </div>
              <p className="text-small font-semibold text-ink">Happy Patient Smiles</p>
              <p className="text-[11px] text-ink-muted mt-1">Across Western India</p>
            </Card>

            <Card variant="alt" className="text-center p-8">
              <div className="text-display-lg text-brand mb-2">
                <Counter value="100" suffix="%" duration={1.7} once={false} />
              </div>
              <p className="text-small font-semibold text-ink">Painless Guarantee</p>
              <p className="text-[11px] text-ink-muted mt-1">Gentle comfort protocol</p>
            </Card>
          </div>
        </Container>
      </Section>

      {/* 5. PARALLAX IMAGE */}
      <Section variant="surface" id="parallax">
        <Container>
          <SectionHeading
            align="left"
            eyebrow="Primitive: <ParallaxImage>"
            title="5. Desktop Scrubbed Parallax"
            description="Subtle Y-translation scrubbed to scroll speed with edge overscale factor. Disabled on touch and reduced-motion."
            className="mb-10"
          />

          <div className="max-w-4xl mx-auto">
            <ParallaxImage
              speed={0.16}
              scale={1.15}
              ratio="21/9"
              alt="Panoramic sanctuary view of GuruOm Dental"
              label="Sanctuary Parallax View (2100x900)"
            />
          </div>
        </Container>
      </Section>

      {/* 6. MAGNETIC WRAP */}
      <Section variant="white" id="magnetic">
        <Container>
          <SectionHeading
            align="left"
            eyebrow="Primitive: <MagneticWrap>"
            title="6. Magnetic Cursor Attraction"
            description="Desktop fine-pointer micro-interaction using gsap.quickTo physics. Returns smoothly to center on mouse leave."
            className="mb-12"
          />

          <div className="p-12 rounded-2xl bg-surface-alt border border-line flex flex-wrap items-center justify-center gap-10">
            <MagneticWrap radius={20} strength={0.4}>
              <Button variant="primary" size="lg">
                Hover Me: Magnetic Button
              </Button>
            </MagneticWrap>

            <MagneticWrap radius={16} strength={0.35}>
              <Button variant="secondary" size="md">
                Secondary Magnetic
              </Button>
            </MagneticWrap>

            <MagneticWrap radius={18} strength={0.45}>
              <IconCircle variant="brand" size="lg" icon={<Zap className="w-6 h-6 text-accent" />} />
            </MagneticWrap>
          </div>
        </Container>
      </Section>

      {/* 7. PINSECTION: SCROLL-DRIVEN PINNED SLIDES */}
      <Section variant="surface" className="p-0 py-0" id="pin-section">
        <Container className="pt-16 pb-8">
          <SectionHeading
            align="left"
            eyebrow="Primitive: <PinSection>"
            title="7. ScrollTrigger Pinned Viewport Section"
            description="Pins the section in place while the user scrolls through the designated scroll duration. Lenis-compatible via ticker sync."
          />
        </Container>

        <PinSection duration="+=120%">
          {(progress) => (
            <div className="w-full h-full bg-brand-dark text-white flex flex-col justify-between p-8 sm:p-16 border-y border-brand">
              <div className="flex items-center justify-between">
                <Badge variant="accent" size="md">
                  Pinned Section Experience
                </Badge>
                <span className="font-mono text-xs text-accent">
                  Scroll Progress: {Math.round(progress * 100)}%
                </span>
              </div>

              <div className="max-w-2xl space-y-4">
                <Eyebrow variant="line" color="accent">Step-by-Step Clinical Journey</Eyebrow>
                <h3 className="text-display-md text-white font-display">
                  {progress < 0.33
                    ? "Phase 1: Digital 3D Diagnosis & Facial Analysis"
                    : progress < 0.66
                    ? "Phase 2: Guided Flapless Precision Placement"
                    : "Phase 3: Immediate Aesthetics & Permanent Vitality"}
                </h3>
                <p className="text-body-lg text-white/80">
                  {progress < 0.33
                    ? "We utilize intraoral scanning and cone-beam 3D computed tomography to design your treatment outcome before any clinical touch."
                    : progress < 0.66
                    ? "German robotic surgical guides enable microscopic accuracy with zero incision or sutures needed in 90% of cases."
                    : "Wake up to natural-looking teeth that feel completely organic, allowing you to smile and eat comfortably on day one."}
                </p>
              </div>

              {/* Progress bar indicator */}
              <div className="w-full space-y-2">
                <div className="flex justify-between text-xs text-white/60 font-mono">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-75"
                    style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </PinSection>
      </Section>

      {/* LONG SPACER & SCROLL TO TOP */}
      <Section variant="white" className="py-24">
        <Container>
          <div className="text-center max-w-xl mx-auto space-y-6">
            <Badge variant="default" size="md">Test Complete</Badge>
            <h2 className="text-display-md text-ink">Smooth Scroll & Cleanup Verified</h2>
            <p className="text-body text-ink-muted">
              Lenis coordinates smoothly with GSAP ScrollTrigger ticker. Clicking below triggers <code>lenis.scrollTo(0)</code>.
            </p>
            <Button variant="primary" size="md" onClick={scrollToTop} icon={<ArrowUp className="w-4 h-4" />}>
              Back to Top
            </Button>
          </div>
        </Container>
      </Section>
    </main>
  );
}
