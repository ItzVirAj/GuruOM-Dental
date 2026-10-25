"use client";

import React, { useRef } from "react";
import { Container, Section, Eyebrow, SmartImage } from "@/components/ui";
import { SplitHeading } from "@/components/animations";
import { aboutPageContent } from "@/data/about";
import { Cpu, Award, MapPin, Sparkles } from "lucide-react";

export const AboutStory: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { story, milestones, highlights } = aboutPageContent;

  return (
    <Section ref={sectionRef} variant="white" className="py-16 sm:py-20 lg:py-24">
      <Container>
        {/* Milestones Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-20">
          {milestones.map((item, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-2xl bg-surface border border-line/60 shadow-soft"
            >
              <div className="font-display text-3xl sm:text-4xl font-bold text-brand mb-1">
                {item.value}
              </div>
              <div className="font-display font-semibold text-ink text-sm sm:text-base mb-1">
                {item.label}
              </div>
              <div className="text-xs text-ink-muted leading-relaxed font-body">
                {item.sublabel}
              </div>
            </div>
          ))}
        </div>

        {/* Story Narrative & Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start mb-16 sm:mb-20">
          {/* Main Story Narrative */}
          <div className="lg:col-span-8 space-y-6">
            <div className="mb-4">
              <Eyebrow variant="dot" color="accent">
                {story.eyebrow}
              </Eyebrow>
            </div>

            <SplitHeading
              as="h2"
              type="lines"
              mask={true}
              className="font-display text-3xl sm:text-4xl lg:text-5xl text-ink font-bold tracking-tight text-balance leading-tight mb-8"
            >
              {story.title}
            </SplitHeading>

            <div className="space-y-5 text-ink-muted text-base sm:text-lg leading-relaxed font-body">
              {story.paragraphs.map((para, idx) => (
                <p
                  key={idx}
                  className={
                    idx === 0
                      ? "text-ink font-medium text-lg sm:text-xl leading-relaxed"
                      : ""
                  }
                >
                  {para}
                </p>
              ))}
            </div>

            {/* Founder Sign-off */}
            <div className="pt-8 border-t border-line/70 mt-8">
              <p className="font-display text-sm font-semibold uppercase tracking-wider text-ink-muted mb-4">
                {story.signoff.salutation}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {story.signoff.founders.map((founder, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl bg-surface border border-line/60 shadow-xs"
                  >
                    <p className="font-display font-bold text-ink text-base sm:text-lg">
                      {founder.name}
                    </p>
                    <p className="font-display text-sm font-semibold text-brand mt-0.5">
                      {founder.degree}
                    </p>
                    <p className="text-xs text-ink-muted mt-1 font-body">
                      {founder.role}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Image & Highlights Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
            <div className="rounded-3xl overflow-hidden shadow-card border border-line/60 bg-surface-alt">
              <SmartImage
                slot={story.imageSlot}
                alt="GuruOm Dental Ahilyanagar clinic and leadership"
                ratio="4/5"
                className="w-full h-full object-cover"
                sizes="(max-width: 1024px) 100vw, 360px"
              />
            </div>

            {/* Quick Facts Card */}
            <div className="p-6 rounded-2xl bg-surface border border-line/60 shadow-soft">
              <h3 className="font-display font-bold text-ink text-base mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                Key Highlights
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-ink-muted font-body">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                  <span>Central Maharashtra&apos;s leading emerging digital dental lab</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                  <span>Full-mouth rehabilitation &amp; patient-specific implants</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                  <span>In-house DMLS 3D metal printer &amp; automated milling</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Highlights: Tech, Procedures & Network */}
        <div className="pt-12 border-t border-line">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Eyebrow className="justify-center mb-2">Our Capabilities</Eyebrow>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-ink">
              {highlights.title}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Technology */}
            <div className="p-6 rounded-2xl bg-surface border border-line/60">
              <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-ink text-base mb-3">
                Digital Infrastructure
              </h4>
              <ul className="space-y-2 text-sm text-ink-muted font-body">
                {highlights.tech.map((t, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. Specialized Procedures */}
            <div className="p-6 rounded-2xl bg-surface border border-line/60">
              <div className="w-10 h-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center mb-4">
                <Award className="w-5 h-5 text-accent" />
              </div>
              <h4 className="font-display font-bold text-ink text-base mb-3">
                Advanced Procedures
              </h4>
              <ul className="space-y-2 text-sm text-ink-muted font-body">
                {highlights.procedures.map((p, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Cities */}
            <div className="p-6 rounded-2xl bg-surface border border-line/60">
              <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-ink text-base mb-3">
                Network Across Maharashtra
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {highlights.cities.map((c, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-alt text-ink border border-line/50"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default AboutStory;
