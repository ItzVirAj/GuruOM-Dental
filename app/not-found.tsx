import type { Metadata } from "next";
import Link from "next/link";
import { Home, Stethoscope, Calendar, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/animations/Reveal";

export const metadata: Metadata = {
  title: "404 - Page Not Found | GuruOm Dental",
  description: "The requested page could not be found. Return to GuruOm Dental home.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main className="min-h-[75vh] flex items-center justify-center py-20 bg-surface">
      <Container className="max-w-lg">
        <Reveal
          variant="scale"
          duration={0.6}
          className="bg-white border border-line rounded-3xl p-8 sm:p-12 text-center shadow-card space-y-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto font-display font-bold text-2xl">
            404
          </div>

          <div className="space-y-2">
            <h1 className="font-display font-bold text-ink text-2xl sm:text-3xl">
              Page Not Found
            </h1>
            <p className="text-sm text-ink-muted max-w-sm mx-auto leading-relaxed">
              The page you are looking for does not exist, has been moved, or is temporarily unavailable.
            </p>
          </div>

          <div className="pt-2 border-t border-line/60">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted block mb-3">
              Explore Our Clinic
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
              <Link
                href="/"
                className="flex items-center justify-center gap-1.5 p-3 rounded-xl border border-line bg-surface/50 hover:bg-surface hover:border-brand/40 text-ink transition-all"
              >
                <Home className="w-3.5 h-3.5 text-brand" />
                <span>Home</span>
              </Link>
              <Link
                href="/services"
                className="flex items-center justify-center gap-1.5 p-3 rounded-xl border border-line bg-surface/50 hover:bg-surface hover:border-brand/40 text-ink transition-all"
              >
                <Stethoscope className="w-3.5 h-3.5 text-brand" />
                <span>Services</span>
              </Link>
              <Link
                href="/appointment"
                className="flex items-center justify-center gap-1.5 p-3 rounded-xl border border-line bg-surface/50 hover:bg-surface hover:border-brand/40 text-ink transition-all"
              >
                <Calendar className="w-3.5 h-3.5 text-brand" />
                <span>Book Visit</span>
              </Link>
              <Link
                href="/contact"
                className="flex items-center justify-center gap-1.5 p-3 rounded-xl border border-line bg-surface/50 hover:bg-surface hover:border-brand/40 text-ink transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-brand" />
                <span>Contact Desk</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </main>
  );
}
