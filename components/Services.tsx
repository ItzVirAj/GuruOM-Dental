"use client";

import { useRef } from "react";
import { dentalServices } from "@/data/dental-data";
import { gsap, useGSAP } from "@/lib/gsap";

export default function Services() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!cardsRef.current) return;
      const cards = cardsRef.current.children;

      gsap.from(cards, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <section id="services" ref={containerRef} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-deep bg-accent-soft px-3 py-1 rounded-full border border-accent/40">
            Specialized Treatments
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight font-display">
            Comprehensive Dental Excellence Under One Roof
          </h2>
          <p className="text-ink-muted text-base leading-relaxed">
            Every procedure is backed by microscopic precision, zero-pain protocols, and international quality standards.
          </p>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dentalServices.map((service) => (
            <div
              key={service.id}
              className="group relative rounded-2xl p-8 bg-surface border border-line hover:border-accent hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white border border-line text-ink">
                    {service.category}
                  </span>
                  <span className="text-xs font-medium text-accent-deep flex items-center gap-1 font-semibold">
                    ★ {service.highlight}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-ink font-heading mb-3 group-hover:text-brand transition-colors">
                  {service.title}
                </h3>

                <p className="text-sm text-ink-muted leading-relaxed mb-6">
                  {service.description}
                </p>
              </div>

              <div className="pt-4 border-t border-line flex items-center justify-between">
                <span className="text-xs text-ink-muted font-medium">
                  {service.duration}
                </span>
                <span className="text-xs font-semibold text-brand group-hover:text-accent-deep group-hover:translate-x-1 transition-all inline-flex items-center gap-1">
                  Learn more →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
