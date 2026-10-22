import { clinicInfo } from "@/data/dental-data";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white font-bold">
                GD
              </div>
              <span className="font-heading font-extrabold text-2xl text-white">
                GuruOm<span className="text-sky-400">.</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              {clinicInfo.tagline}. Delivering painless, precision dentistry and healthy, radiant smiles using state-of-the-art technology.
            </p>
          </div>

          {/* Timings */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4 font-heading">
              Clinic Hours
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              {clinicInfo.timing}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-xs text-teal-400 bg-teal-950/60 border border-teal-800/50 px-3 py-1.5 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              Emergency Care On-Call
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4 font-heading">
              Contact & Address
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed mb-2">
              {clinicInfo.address}
            </p>
            <p className="text-sm text-sky-400 font-semibold mb-1">
              {clinicInfo.phone}
            </p>
            <p className="text-xs text-slate-400">
              {clinicInfo.email}
            </p>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 GuruOm Dental Clinic. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Care</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Patient Notice</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
