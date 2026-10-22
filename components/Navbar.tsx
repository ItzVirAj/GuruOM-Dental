"use client";

import Link from "next/link";
import { clinicInfo } from "@/data/dental-data";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-400 flex items-center justify-center text-white font-bold shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <span className="font-heading font-extrabold text-xl tracking-tight text-slate-900 block leading-none">
              GuruOm<span className="text-sky-600">.</span>
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-600 block mt-0.5">
              Dental Clinic
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#services" className="hover:text-sky-600 transition-colors">
            Treatments
          </a>
          <a href="#about" className="hover:text-sky-600 transition-colors">
            About Clinic
          </a>
          <a href="#doctors" className="hover:text-sky-600 transition-colors">
            Specialists
          </a>
          <a href="#contact" className="hover:text-sky-600 transition-colors">
            Contact
          </a>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-4">
          <a
            href={`tel:${clinicInfo.phone.replace(/\s+/g, "")}`}
            className="hidden sm:inline-flex text-xs font-semibold px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
          >
            {clinicInfo.phone}
          </a>
          <a
            href="#appointment"
            className="inline-flex items-center justify-center text-sm font-semibold text-white px-5 py-2.5 rounded-full bg-gradient-to-r from-sky-600 to-teal-500 hover:from-sky-500 hover:to-teal-400 shadow-md shadow-sky-600/20 hover:shadow-lg hover:shadow-sky-600/30 transition-all duration-200"
          >
            Book Visit
          </a>
        </div>
      </div>
    </header>
  );
}
