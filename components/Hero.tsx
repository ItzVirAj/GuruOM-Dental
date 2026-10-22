"use client";

import { useRef } from "react";
import { clinicInfo } from "@/data/dental-data";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Split headline into words & characters for elegant entrance
      if (headlineRef.current) {
        const split = new SplitText(headlineRef.current, {
          type: "lines,words,chars",
          linesClass: "overflow-hidden",
        });

        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        tl.from(badgeRef.current, {
          opacity: 0,
          y: -20,
          duration: 0.8,
        })
          .from(
            split.chars,
            {
              yPercent: 100,
              opacity: 0,
              stagger: 0.015,
              duration: 1,
            },
            "-=0.4"
          )
          .from(
            paraRef.current,
            {
              opacity: 0,
              y: 20,
              duration: 0.8,
            },
            "-=0.5"
          )
          .from(
            ctaRef.current,
            {
              opacity: 0,
              y: 20,
              duration: 0.8,
            },
            "-=0.6"
          )
          .from(
            cardRef.current,
            {
              opacity: 0,
              scale: 0.95,
              y: 30,
              duration: 1,
            },
            "-=0.7"
          );
      }
    },
    { scope: heroRef }
  );

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 bg-gradient-to-b from-sky-50/60 via-slate-50 to-white"
    >
      {/* Decorative gradient glow blobs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 -z-10 w-[600px] h-[350px] bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-10 -z-10 w-[400px] h-[300px] bg-teal-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines */}
          <div className="lg:col-span-7 space-y-6">
            <div ref={badgeRef} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/80 border border-sky-200 text-sky-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              Trusted by 14,000+ Happy Patients across Gujarat
            </div>

            <h1
              ref={headlineRef}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]"
            >
              Mastering the Art of <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-500">Perfect Smiles</span> with Precision.
            </h1>

            <p
              ref={paraRef}
              className="text-lg sm:text-xl text-slate-600 max-w-xl font-normal leading-relaxed"
            >
              Experience painless, world-class dental care. From Swiss dental implants and microscopic root canals to digital smile design and clear invisible aligners.
            </p>

            <div ref={ctaRef} className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#appointment"
                className="px-7 py-3.5 rounded-full bg-gradient-to-r from-sky-600 to-teal-500 text-white font-semibold text-base shadow-lg shadow-sky-600/25 hover:shadow-xl hover:shadow-sky-600/35 hover:-translate-y-0.5 transition-all duration-200"
              >
                Book Appointment
              </a>
              <a
                href="#services"
                className="px-6 py-3.5 rounded-full border border-slate-300 text-slate-700 font-semibold text-base hover:bg-slate-100/80 transition-colors"
              >
                Explore Treatments
              </a>
            </div>

            {/* Trust Metrics */}
            <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                  {clinicInfo.rating} ★
                </div>
                <div className="text-xs text-slate-500 font-medium">Google Rating ({clinicInfo.reviewCount}+)</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                  100%
                </div>
                <div className="text-xs text-slate-500 font-medium">Painless Guarantee</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                  16+ Yrs
                </div>
                <div className="text-xs text-slate-500 font-medium">Clinical Mastery</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Card */}
          <div ref={cardRef} className="lg:col-span-5">
            <div className="relative rounded-3xl p-8 bg-gradient-to-br from-white to-slate-50/80 border border-slate-200/80 shadow-2xl shadow-sky-900/10 backdrop-blur-xl">
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-teal-600">
                    Quick Consultation
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 font-heading mt-1">
                    Book Your Smile Assessment
                  </h3>
                </div>
                <span className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-sm">
                  01
                </span>
              </div>

              <div className="space-y-4 py-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Patel"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Treatment Required
                  </label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition text-slate-700">
                    <option>Dental Implants & Replacement</option>
                    <option>Cosmetic Smile Makeover / Veneers</option>
                    <option>Clear Invisible Aligners</option>
                    <option>Painless Root Canal (RCT)</option>
                    <option>Teeth Cleaning & Laser Whitening</option>
                  </select>
                </div>
                <button
                  type="button"
                  className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all duration-200"
                >
                  Schedule Free Dental Consult
                </button>
              </div>

              <div className="bg-sky-50/70 rounded-2xl p-4 flex items-center gap-3 border border-sky-100">
                <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
                <p className="text-xs text-sky-950 font-medium leading-relaxed">
                  Includes digital 3D intraoral scan & consultation with our senior dental surgeons.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
