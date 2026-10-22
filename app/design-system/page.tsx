import React from "react";
import {
  Sparkles,
  Shield,
  Activity,
  Heart,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
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
  SmartImage,
} from "@/components/ui";

export const metadata = {
  title: "Design System Showcase",
  description: "Internal design system documentation and component workbench for GuruOm Dental.",
};

const colorTokens = [
  { name: "Brand (Primary)", class: "bg-brand text-white", hex: "#0E5A5F", var: "--brand" },
  { name: "Brand Dark", class: "bg-brand-dark text-white", hex: "#072F33", var: "--brand-dark" },
  { name: "Brand Light", class: "bg-brand-light text-white", hex: "#1F7C82", var: "--brand-light" },
  { name: "Accent (Mint)", class: "bg-accent text-ink", hex: "#5FD3BC", var: "--accent" },
  { name: "Accent Soft", class: "bg-accent-soft text-brand-dark border border-line", hex: "#E6F6F2", var: "--accent-soft" },
  { name: "Surface (Page Bg)", class: "bg-surface text-ink border border-line", hex: "#F7F5F0", var: "--surface" },
  { name: "Surface Alt", class: "bg-surface-alt text-ink border border-line", hex: "#EEF3F1", var: "--surface-alt" },
  { name: "White", class: "bg-white text-ink border border-line", hex: "#FFFFFF", var: "--white" },
  { name: "Ink (Main Text)", class: "bg-ink text-white", hex: "#10262A", var: "--ink" },
  { name: "Ink Muted", class: "bg-ink-muted text-white", hex: "#5B7075", var: "--ink-muted" },
  { name: "Line (Borders)", class: "bg-line text-ink border border-slate-300", hex: "#DCE6E4", var: "--line" },
  { name: "Success", class: "bg-success text-white", hex: "#2E9E6B", var: "--success" },
  { name: "Warning", class: "bg-warning text-white", hex: "#D9962B", var: "--warning" },
  { name: "Danger", class: "bg-danger text-white", hex: "#D64545", var: "--danger" },
];

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-surface pb-32">
      {/* Temporary Page Notice Banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 text-center text-xs font-medium text-amber-900">
        <span className="font-semibold">Internal Design System Workbench:</span> This is a living test page for tokens, components, and responsive typography. This route can be removed or protected before launch.
      </div>

      {/* Top Header */}
      <header className="border-b border-line bg-white py-12">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-display-md font-display text-brand">GuruOm Dental</span>
                <Badge variant="accent" size="sm">Design System v1.0</Badge>
              </div>
              <p className="text-body text-ink-muted max-w-2xl">
                Calm, premium, trustworthy, and clinical but warm. Built on Tailwind CSS v4 (@theme), Next/Font (Instrument Serif & DM Sans), and motion-ready primitives.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button href="/" variant="ghost" size="sm">
                Back to Home
              </Button>
            </div>
          </div>
        </Container>
      </header>

      {/* 1. COLOR TOKENS */}
      <Section variant="surface">
        <Container>
          <div className="mb-10">
            <Eyebrow variant="dot" color="brand">Token Library</Eyebrow>
            <h2 className="text-display-md text-ink mt-2">1. Color Palette</h2>
            <p className="text-body text-ink-muted">Tailwind semantic utilities with corresponding CSS custom properties for GSAP animations.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {colorTokens.map((token) => (
              <div
                key={token.name}
                className="rounded-lg p-3 bg-white border border-line shadow-soft flex flex-col justify-between"
              >
                <div
                  className={`h-16 w-full rounded-md shadow-inner mb-3 flex items-center justify-center font-bold text-xs ${token.class}`}
                >
                  Aa
                </div>
                <div>
                  <div className="text-xs font-semibold text-ink truncate">{token.name}</div>
                  <div className="text-[11px] font-mono text-ink-muted mt-0.5">{token.hex}</div>
                  <div className="text-[10px] font-mono text-brand truncate mt-1">{token.var}</div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 2. TYPOGRAPHY */}
      <Section variant="white">
        <Container>
          <div className="mb-10">
            <Eyebrow variant="line" color="brand">Fluid Clamp Scale</Eyebrow>
            <h2 className="text-display-md text-ink mt-2">2. Typography Scale</h2>
            <p className="text-body text-ink-muted">Instrument Serif (Display) + DM Sans (Body). Fluid clamp() units scale seamlessly across viewports.</p>
          </div>

          <div className="space-y-10 border-t border-line pt-8">
            <div className="space-y-2">
              <div className="text-xs font-mono text-brand uppercase tracking-wider">.text-display-xl (Hero Headline)</div>
              <p className="text-display-xl text-ink">
                Transforming Smiles with Calm Precision.
              </p>
            </div>

            <div className="space-y-2 border-t border-line/60 pt-6">
              <div className="text-xs font-mono text-brand uppercase tracking-wider">.text-display-lg (Major Section Headline)</div>
              <p className="text-display-lg text-ink">
                Swiss Implantology & Pain-Free Mastery
              </p>
            </div>

            <div className="space-y-2 border-t border-line/60 pt-6">
              <div className="text-xs font-mono text-brand uppercase tracking-wider">.text-display-md (Card & Sub-Hero Titles)</div>
              <p className="text-display-md text-ink">
                Gentle Aesthetics Designed for a Lifetime
              </p>
            </div>

            <div className="space-y-2 border-t border-line/60 pt-6">
              <div className="text-xs font-mono text-brand uppercase tracking-wider">.text-heading (Standard Heading)</div>
              <p className="text-heading text-ink">
                Microscopic Endodontic Care & Laser Periodontics
              </p>
            </div>

            <div className="space-y-2 border-t border-line/60 pt-6">
              <div className="text-xs font-mono text-brand uppercase tracking-wider">.text-subheading (DM Sans Medium)</div>
              <p className="text-subheading text-ink">
                Personalized treatment workflows backed by digital intraoral precision scanning.
              </p>
            </div>

            <div className="space-y-2 border-t border-line/60 pt-6">
              <div className="text-xs font-mono text-brand uppercase tracking-wider">.text-body-lg (Lead Paragraphs)</div>
              <p className="text-body-lg text-ink-muted max-w-3xl">
                Every smile journey at GuruOm Dental begins with an attentive consultation and 3D preview, ensuring complete peace of mind and tailored aesthetics.
              </p>
            </div>

            <div className="space-y-2 border-t border-line/60 pt-6">
              <div className="text-xs font-mono text-brand uppercase tracking-wider">.text-body (Standard Body Copy)</div>
              <p className="text-body text-ink-muted max-w-2xl">
                Our surgical suites feature high-magnification Carl Zeiss optics, hospital-grade Class-B sterilization, and ergonomic sensory-calming suites.
              </p>
            </div>

            <div className="space-y-2 border-t border-line/60 pt-6">
              <div className="text-xs font-mono text-brand uppercase tracking-wider">.text-small (Captions, Footers, Meta)</div>
              <p className="text-small text-ink-muted">
                Suite 402, Lotus Tower, S.G. Highway, Ahmedabad, Gujarat • Licensed NABH Accredited Facility.
              </p>
            </div>

            <div className="space-y-2 border-t border-line/60 pt-6">
              <div className="text-xs font-mono text-brand uppercase tracking-wider">.text-eyebrow (Uppercase Section Label)</div>
              <p className="text-eyebrow text-brand">
                Clinical Excellence • Zero Anxiety Protocol
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* 3. BUTTONS */}
      <Section variant="alt">
        <Container>
          <div className="mb-10">
            <Eyebrow variant="dot" color="brand">Interactive Elements</Eyebrow>
            <h2 className="text-display-md text-ink mt-2">3. Button Variants & Sizes</h2>
            <p className="text-body text-ink-muted">Pill-shaped with sliding arrow indicator, hover lift, active states, and accessible focus outlines.</p>
          </div>

          <div className="space-y-8">
            {/* Variants */}
            <div className="bg-white rounded-xl p-8 border border-line shadow-soft space-y-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Variants (Medium Size)</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary">Primary (Brand)</Button>
                <Button variant="secondary">Secondary (Accent)</Button>
                <Button variant="ghost">Ghost (Outline)</Button>
                <Button variant="light">Light Variant</Button>
              </div>
            </div>

            {/* Dark Background Test for Light Button */}
            <div className="bg-brand-dark rounded-xl p-8 border border-brand space-y-6 text-white">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-accent">Variants on Dark Background</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="light">Light Action</Button>
                <Button variant="secondary">Secondary Mint</Button>
                <Button variant="ghost" className="text-white border-white/20 hover:border-white hover:bg-white/10">Ghost White</Button>
              </div>
            </div>

            {/* Sizes */}
            <div className="bg-white rounded-xl p-8 border border-line shadow-soft space-y-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Sizes (Primary)</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="primary" size="sm">Small Button</Button>
                <Button variant="primary" size="md">Medium Button</Button>
                <Button variant="primary" size="lg">Large Hero Button</Button>
              </div>
            </div>

            {/* Next Link support */}
            <div className="bg-white rounded-xl p-8 border border-line shadow-soft space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Polymorphic Next.js Link Support</h3>
              <Button href="#target" variant="primary">
                Rendered as &lt;Link href=&quot;#target&quot;&gt;
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* 4. EYEBROW & SECTION HEADINGS */}
      <Section variant="surface">
        <Container>
          <div className="mb-10">
            <Eyebrow variant="dot" color="brand">Typography Components</Eyebrow>
            <h2 className="text-display-md text-ink mt-2">4. Eyebrows & Section Headings</h2>
            <p className="text-body text-ink-muted">All headings have `data-split=&quot;heading&quot;` attached for ready-to-hook GSAP SplitText animations.</p>
          </div>

          <div className="space-y-12">
            {/* Eyebrow variants */}
            <div className="p-6 bg-white rounded-xl border border-line space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Eyebrow Markers & Colors</h3>
              <div className="flex flex-wrap items-center gap-6">
                <Eyebrow variant="dot" color="brand">Brand Dot</Eyebrow>
                <Eyebrow variant="line" color="brand">Brand Line</Eyebrow>
                <Eyebrow variant="dot" color="accent">Accent Dot</Eyebrow>
                <Eyebrow variant="line" color="accent">Accent Line</Eyebrow>
                <Eyebrow variant="dot" color="muted">Muted Dot</Eyebrow>
              </div>
            </div>

            {/* Left Aligned Section Heading */}
            <div className="p-8 bg-white rounded-xl border border-line">
              <SectionHeading
                align="left"
                eyebrow="Specialized Surgery"
                title="Swiss Implants with Guided 3D Accuracy"
                description="Our specialists use intraoral photogrammetry and micro-surgical guides for painless same-day tooth replacement."
              />
            </div>

            {/* Center Aligned Section Heading */}
            <div className="p-8 bg-white rounded-xl border border-line">
              <SectionHeading
                align="center"
                eyebrow="Patient Testimonials"
                title="Stories of Renewed Confidence"
                description="Listen to real patients share their experience with our calm environment and gentle clinical protocols."
              />
            </div>

            {/* Dark Variant Section Heading */}
            <div className="p-8 bg-brand rounded-xl border border-brand-dark">
              <SectionHeading
                align="left"
                dark={true}
                eyebrow="Sanctuary of Care"
                title="A Refreshingly Calm Dental Experience"
                description="Designed from the ground up to eliminate clinical intimidation and replace it with hospitality."
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* 5. BADGES / CHIPS & ICON CIRCLES */}
      <Section variant="white">
        <Container>
          <div className="mb-10">
            <Eyebrow variant="dot" color="brand">Micro Components</Eyebrow>
            <h2 className="text-display-md text-ink mt-2">5. Badges, Chips & Icon Containers</h2>
            <p className="text-body text-ink-muted">Soft-toned status badges and proportional icon circles.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Badges */}
            <div className="p-6 bg-surface rounded-xl border border-line space-y-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Badges & Chips</h3>
              <div className="flex flex-wrap gap-2.5">
                <Badge variant="default">Default Pill</Badge>
                <Badge variant="brand">Brand Badge</Badge>
                <Badge variant="accent">Accent Mint</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="success" icon={<CheckCircle2 className="w-3 h-3 text-success" />}>
                  100% Painless
                </Badge>
                <Badge variant="warning" icon={<Clock className="w-3 h-3 text-warning" />}>
                  24/7 Emergency
                </Badge>
                <Badge variant="danger">Critical Alert</Badge>
              </div>

              <div className="pt-4 border-t border-line/60 flex items-center gap-3">
                <Badge size="sm" variant="accent">Small Pill</Badge>
                <Badge size="md" variant="accent">Medium Pill</Badge>
              </div>
            </div>

            {/* IconCircle */}
            <div className="p-6 bg-surface rounded-xl border border-line space-y-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">IconCircle Containers</h3>
              <div className="flex flex-wrap items-center gap-4">
                <IconCircle variant="brand" size="sm" icon={<Sparkles className="w-4 h-4" />} />
                <IconCircle variant="accent" size="md" icon={<Shield className="w-5 h-5" />} />
                <IconCircle variant="surface" size="lg" icon={<Activity className="w-6 h-6" />} />
                <IconCircle variant="alt" size="md" icon={<Heart className="w-5 h-5" />} />
                <IconCircle variant="white" size="md" icon={<Calendar className="w-5 h-5" />} />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 6. CARDS */}
      <Section variant="alt">
        <Container>
          <div className="mb-10">
            <Eyebrow variant="dot" color="brand">Surfaces & Shadows</Eyebrow>
            <h2 className="text-display-md text-ink mt-2">6. Card Variants & Hover Lift</h2>
            <p className="text-body text-ink-muted">Three variants with soft teal-tinted shadows (shadow-soft, shadow-card) and smooth hover transitions.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* White Card */}
            <Card variant="white">
              <IconCircle variant="accent" size="md" icon={<Sparkles className="w-5 h-5" />} className="mb-6" />
              <div className="text-xs font-semibold uppercase tracking-wider text-brand mb-2">Variant: White</div>
              <h3 className="text-heading text-ink mb-3">Cosmetic Smile Design</h3>
              <p className="text-body text-ink-muted mb-6">
                Porcelain veneers and ultra-thin ceramic laminates sculpted to match your natural smile geometry.
              </p>
              <div className="pt-4 border-t border-line flex items-center justify-between text-xs font-semibold text-brand">
                <span>Explore Treatment</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Card>

            {/* Alt Card */}
            <Card variant="alt">
              <IconCircle variant="surface" size="md" icon={<Shield className="w-5 h-5" />} className="mb-6" />
              <div className="text-xs font-semibold uppercase tracking-wider text-brand mb-2">Variant: Alt</div>
              <h3 className="text-heading text-ink mb-3">Titanium Implants</h3>
              <p className="text-body text-ink-muted mb-6">
                Permanent, biologically biocompatible restorations backed by international lifetime warranties.
              </p>
              <div className="pt-4 border-t border-line flex items-center justify-between text-xs font-semibold text-brand">
                <span>View Technology</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Card>

            {/* Dark Card */}
            <Card variant="dark">
              <IconCircle variant="accent" size="md" icon={<Heart className="w-5 h-5 text-ink" />} className="mb-6" />
              <div className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">Variant: Dark</div>
              <h3 className="text-heading text-ink-inverse mb-3">Micro Endodontics</h3>
              <p className="text-body text-ink-inverse/80 mb-6">
                Single-visit painless root canal therapy conducted under high-power illumination and optical magnification.
              </p>
              <div className="pt-4 border-t border-brand/50 flex items-center justify-between text-xs font-semibold text-accent">
                <span>Learn Protocol</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Card>
          </div>
        </Container>
      </Section>

      {/* 7. SMART IMAGE PLACEHOLDERS */}
      <Section variant="white">
        <Container>
          <div className="mb-10">
            <Eyebrow variant="dot" color="brand">Asset Management</Eyebrow>
            <h2 className="text-display-md text-ink mt-2">7. SmartImage Placeholder System</h2>
            <p className="text-body text-ink-muted">
              Preserves exact aspect ratios to eliminate layout shift (CLS). Centralized slot registry in <code>/data/images.ts</code>.
            </p>
          </div>

          <div className="space-y-8">
            {/* 16:9 & 21:9 */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <span className="text-xs font-mono text-brand mb-2 block">Ratio: 16/9 (Hero / Services)</span>
                <SmartImage
                  ratio="16/9"
                  alt="Hero clinic atmosphere placeholder"
                  label="Hero Sanctuary (1920x1080)"
                />
              </div>

              <div>
                <span className="text-xs font-mono text-brand mb-2 block">Ratio: 21/9 (Panoramic CTA Banner)</span>
                <SmartImage
                  ratio="21/9"
                  alt="Panoramic clinic banner placeholder"
                  label="Wide Clinic Panorama (2100x900)"
                />
              </div>
            </div>

            {/* 4:3, 3:4, 1:1 */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <span className="text-xs font-mono text-brand mb-2 block">Ratio: 4/3 (Gallery & Cases)</span>
                <SmartImage
                  ratio="4/3"
                  alt="Clinical case study photo"
                  label="Gallery: Smile Case (800x600)"
                />
              </div>

              <div>
                <span className="text-xs font-mono text-brand mb-2 block">Ratio: 3/4 (Doctor Portraits)</span>
                <SmartImage
                  ratio="3/4"
                  alt="Doctor portrait placeholder"
                  label="Doctor Portrait (900x1200)"
                />
              </div>

              <div>
                <span className="text-xs font-mono text-brand mb-2 block">Ratio: 1/1 (Diagnostics & Testimonials)</span>
                <SmartImage
                  ratio="1/1"
                  alt="3D CBCT diagnostic machine"
                  label="Diagnostic Device (600x600)"
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 8. SECTION & CONTAINER BACKGROUNDS */}
      <Section variant="surface">
        <Container>
          <div className="mb-10">
            <Eyebrow variant="line" color="brand">Layout Consistency</Eyebrow>
            <h2 className="text-display-md text-ink mt-2">8. Section Backgrounds & Spacers</h2>
            <p className="text-body text-ink-muted">All background variants with standard padding (py-16 mobile, py-24 tablet, py-32 desktop).</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl p-6 bg-surface border border-line text-ink">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand">variant=&quot;surface&quot;</span>
              <p className="text-small text-ink-muted mt-2">Warm off-white base layer (#F7F5F0)</p>
            </div>

            <div className="rounded-xl p-6 bg-surface-alt border border-line text-ink">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand">variant=&quot;alt&quot;</span>
              <p className="text-small text-ink-muted mt-2">Cool minty off-white (#EEF3F1)</p>
            </div>

            <div className="rounded-xl p-6 bg-white border border-line text-ink">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand">variant=&quot;white&quot;</span>
              <p className="text-small text-ink-muted mt-2">Pure crisp white contrast (#FFFFFF)</p>
            </div>

            <div className="rounded-xl p-6 bg-brand text-white">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">variant=&quot;brand&quot;</span>
              <p className="text-small text-white/80 mt-2">Primary deep rich teal (#0E5A5F)</p>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
