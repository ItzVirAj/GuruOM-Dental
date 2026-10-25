"use client";

import React, { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Container, Button, Eyebrow, SmartImage } from "@/components/ui";
import { SplitHeading, MagneticWrap, useReducedMotion } from "@/components/animations";
import { aboutIntroContent, AboutIntroContent } from "@/data/home";

export interface AboutIntroProps {
  content?: AboutIntroContent;
}

export const AboutIntro: React.FC<AboutIntroProps> = ({
  content = aboutIntroContent,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const imageWrapRef = useRef<HTMLDivElement | null>(null);
  const textColRef = useRef<HTMLDivElement | null>(null);
  const dividerRef = useRef<HTMLDivElement | null>(null);
  const btnWrapRef = useRef<HTMLDivElement | null>(null);

  const prefersReducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      gsap.set(section, { visibility: "visible", opacity: 1 });
      if (prefersReducedMotion) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: section, start: "top 80%", once: true },
          defaults: { ease: "power3.out" },
        });

        // Image reveal with clip-path wipe
        if (imageWrapRef.current) {
          gsap.set(imageWrapRef.current, { clipPath: "inset(0% 0% 100% 0% round 24px)" });
          tl.to(
            imageWrapRef.current,
            {
              clipPath: "inset(0% 0% 0% 0% round 24px)",
              duration: 1.1,
              ease: "power3.inOut",
            },
            0
          );
        }

        // Text reveal
        if (textColRef.current) {
          const els = textColRef.current.querySelectorAll("[data-anim-reveal]");
          tl.fromTo(
            els,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, stagger: 0.12, duration: 0.65 },
            0.35
          );
        }

        if (dividerRef.current) {
          tl.fromTo(dividerRef.current, { scaleX: 0 }, { scaleX: 1, duration: 0.7 }, 0.7);
        }

        if (btnWrapRef.current) {
          tl.fromTo(
            btnWrapRef.current,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.55 },
            0.85
          );
        }

        // Parallax on image on scroll
        if (imageWrapRef.current) {
          gsap.to(imageWrapRef.current, {
            yPercent: -8,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          });
        }
      });

      mm.add("(max-width: 1023px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: section, start: "top 85%", once: true },
          defaults: { ease: "power2.out" },
        });

        if (imageWrapRef.current) {
          tl.fromTo(
            imageWrapRef.current,
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.7 },
            0
          );
        }

        if (textColRef.current) {
          const els = textColRef.current.querySelectorAll("[data-anim-reveal]");
          tl.fromTo(
            els,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, stagger: 0.1, duration: 0.6 },
            0.2
          );
        }
      });
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion] }
  );

  return (
    <section
      ref={sectionRef}
      id="about-intro"
      aria-labelledby="about-intro-heading"
      className="relative w-full bg-surface text-ink overflow-hidden py-20 sm:py-24 lg:py-32"
    >
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 xl:gap-20 items-center">
          {/* =====================================================
              LEFT COLUMN — TEXT CONTENT
          ===================================================== */}
          <div ref={textColRef} className="flex flex-col justify-center lg:py-4">
            {/* Eyebrow */}
            <div data-anim-reveal className="mb-5">
              <Eyebrow variant="dot" color="accent">
                {content.eyebrow}
              </Eyebrow>
            </div>

            {/* Headline */}
            <div data-anim-reveal className="mb-6">
              <SplitHeading
                id="about-intro-heading"
                as="h2"
                type="lines"
                mask
                className="font-display font-bold tracking-tight text-ink leading-[1.12] text-4xl sm:text-5xl lg:text-[2.9rem] xl:text-5xl"
              >
                {content.title}
              </SplitHeading>
            </div>

            {/* Paragraph */}
            <p
              data-anim-reveal
              className="font-body text-ink-muted text-base sm:text-lg leading-relaxed mb-8 max-w-[540px]"
            >
              {content.paragraph}
            </p>

            {/* Divider */}
            <div
              ref={dividerRef}
              aria-hidden="true"
              className="h-px max-w-[540px] bg-line mb-8 origin-left"
            />

            {/* CTA */}
            <div ref={btnWrapRef}>
              <MagneticWrap strength={0.25}>
                <Button href={content.cta.href} variant="primary" size="lg" showIcon>
                  {content.cta.label}
                </Button>
              </MagneticWrap>
            </div>
          </div>

          {/* =====================================================
              RIGHT COLUMN — CLINICAL SHOWCASE IMAGE
          ===================================================== */}
          <div className="relative w-full max-w-lg mx-auto md:max-w-none">
            <div
              ref={imageWrapRef}
              className="relative w-full rounded-3xl overflow-hidden shadow-card border border-line/60 bg-surface-alt will-change-transform"
            >
              <SmartImage
                slot="aboutSecondary"
                alt="GuruOm Dental modern clinical sanctuary and digital diagnostics"
                ratio="4/5"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 560px"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default AboutIntro;
