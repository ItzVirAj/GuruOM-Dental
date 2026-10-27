"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Award } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";

export const AboutStoryBento: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReducedMotion || !sectionRef.current) return;

      gsap.fromTo(
        ".founder-letter-anim",
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative bg-surface py-20 sm:py-28 lg:py-32 border-b border-line/60 overflow-hidden"
    >
      {/* Apple-style subtle ambient glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-accent/5 blur-[140px] z-0"
        aria-hidden="true"
      />

      <Container className="relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <div className="inline-flex justify-center mb-4">
            <Eyebrow variant="dot" color="accent">
              Our Journey • Est. 2019
            </Eyebrow>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink mb-4">
            The Story of Guru-Om Dental
          </h2>
          <p className="font-body text-base sm:text-lg text-ink-muted leading-relaxed">
            From conventional roots in Ahilyanagar to Central Maharashtra&apos;s
            largest emerging digital dental lab.
          </p>
        </div>

        {/* Apple Editorial Letter Document Card */}
        <article className="founder-letter-anim max-w-4xl mx-auto rounded-3xl sm:rounded-[32px] bg-white border border-line/80 p-8 sm:p-12 lg:p-16 shadow-card relative">
          {/* Subtle Decorative Seal / Top Watermark */}
          <div className="flex items-center justify-between pb-8 mb-8 sm:mb-10 border-b border-line/60">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent" />
              <span className="font-mono text-xs font-bold tracking-wider uppercase text-ink-muted">
                Ahilyanagar (Ahmednagar), Maharashtra
              </span>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface text-ink text-xs font-mono font-medium border border-line/60">
              <Award className="w-3.5 h-3.5 text-accent" />
              Digital Pioneer Since 2019
            </span>
          </div>

          {/* Letter Body Paragraphs (Exact Text Provided by User) */}
          <div className="space-y-6 sm:space-y-7 font-body text-base sm:text-lg text-ink/85 leading-relaxed">
            <p className="text-lg sm:text-xl text-ink font-normal leading-relaxed first-letter:text-4xl sm:first-letter:text-5xl first-letter:font-bold first-letter:text-accent first-letter:float-left first-letter:mr-3 first-letter:leading-none">
              In the heart of Ahilyanagar, (Ahmednagar) the Guru-Om Dental began
              its journey in 2019. Initially rooted in conventional practices, our
              founder Dr. Guruprasad Handal, a passionate Prosthodontist, foresaw
              a transformative shift towards digital dentistry. Recognizing the
              potential for innovation, we took a bold step and transitioned to a
              digital platform, marking the first of many pivotal moments in our
              story.
            </p>

            <p>
              Our journey took flight with the acquisition of our first intraoral
              scanner in 2019, setting the stage for our commitment to embracing
              technological advancements. In just a few short years, we evolved
              from performing traditional dental work to becoming pioneers in the
              digital realm. Today, our lab boasts an impressive array of
              state-of-the-art equipment, including advanced CAD software, 3D
              printers, milling machines, and even a 3D metal printer (DMLS).
            </p>

            <p>
              When we started, our team consisted of just seven dedicated
              individuals. Today, we have grown to a vibrant workforce of over
              40 professionals, comprising prosthodontists, general dentists,
              qualified technicians, and skilled dental lab assistants. This
              growth reflects not only our success but also our commitment to
              quality and excellence in dental care.
            </p>

            <p>
              Initially serving only the Ahmednagar city, our reach now extends to
              over 30 cities across Maharashtra, including Pune, New Mumbai,
              Nashik, Sambhajinagar, Solapur, Dharashiv, Dhule, and Amravati.
            </p>

            <p>
              Our expertise has expanded significantly as well. While we once
              limited ourselves to basic dental prosthetics, we are now highly
              specialized in advanced procedures such as All-on-4, All-on-6
              implants, basal implants, and full mouth rehabilitation, with
              exciting plans for patient-specific implants on the horizon.
            </p>

            <p>
              As we reflect on our remarkable journey, we are deeply grateful to
              our esteemed clients - dentists who have trusted us and
              collaborated with us throughout this evolution. Your support has
              been instrumental in making Guru-Om Dental Lab the largest emerging
              digital dental lab in Central Maharashtra. Together, we look
              forward to shaping the future of dentistry, driven by innovation,
              quality, and an unwavering commitment to our patients&apos; smiles.
              Thank you for being a vital part of our story.
            </p>
          </div>

          {/* Sign-off Section */}
          <div className="mt-10 sm:mt-12 pt-8 sm:pt-10 border-t border-line/70">
            <p className="font-display italic text-lg sm:text-xl text-brand mb-8">
              Regards,
            </p>

            {/* Apple Executive Signatory Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {/* Dr. Akshata Handal */}
              <div className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-surface border border-line/70 shadow-xs">
                <div className="relative w-14 h-14 shrink-0 rounded-full overflow-hidden border-2 border-accent/40 shadow-xs">
                  <Image
                    src="/images/DRAkshata.jpeg"
                    alt="Dr. Akshata Handal, B.D.S."
                    fill
                    sizes="56px"
                    className="object-cover object-top"
                  />
                </div>
                <div>
                  <h4 className="font-display font-bold text-base sm:text-lg text-ink">
                    Dr. Akshata Handal
                  </h4>
                  <span className="inline-block mt-0.5 text-xs font-mono font-semibold text-accent-deep bg-accent-soft px-2.5 py-0.5 rounded-full border border-accent/20">
                    B.D.S.
                  </span>
                </div>
              </div>

              {/* Dr. Guruprasad Handal */}
              <div className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-surface border border-line/70 shadow-xs">
                <div className="relative w-14 h-14 shrink-0 rounded-full overflow-hidden border-2 border-accent/40 shadow-xs">
                  <Image
                    src="/images/DRGuruprasad.jpeg"
                    alt="Dr. Guruprasad Handal, M.D.S. (Prosthodontics)"
                    fill
                    sizes="56px"
                    className="object-cover object-top"
                  />
                </div>
                <div>
                  <h4 className="font-display font-bold text-base sm:text-lg text-ink">
                    Dr. Guruprasad Handal
                  </h4>
                  <span className="inline-block mt-0.5 text-xs font-mono font-semibold text-accent-deep bg-accent-soft px-2.5 py-0.5 rounded-full border border-accent/20">
                    M.D.S. (Prosthodontics)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </Container>
    </section>
  );
};

export default AboutStoryBento;
