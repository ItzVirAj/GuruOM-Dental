import Link from "next/link";
import { ownerHref } from "@/src/lib/owner-url";
import { LogoutButton } from "./logout-button";
import { OwnerNavLinks, type NavItemDef } from "./owner-nav-links";
import { Video, Globe, ArrowUpRight, ShieldCheck } from "lucide-react";

interface OwnerHeaderProps {
  ownerEmail?: string;
}

export function OwnerHeader({ ownerEmail }: OwnerHeaderProps) {
  const homeHref = ownerHref("");

  const navItems: NavItemDef[] = [
    { label: "Dashboard", href: homeHref, iconKey: "dashboard" },
    { label: "Posts", href: ownerHref("/posts"), iconKey: "posts" },
    { label: "Media", href: ownerHref("/media"), iconKey: "media" },
    { label: "Videos", href: ownerHref("/videos"), iconKey: "videos" },
    { label: "Categories", href: ownerHref("/categories"), iconKey: "categories" },
    { label: "Activity", href: ownerHref("/activity"), iconKey: "activity" },
    { label: "Security", href: ownerHref("/security"), iconKey: "security" },
  ];

  const disabledItems: Array<{ label: string; icon: typeof Video; tooltip: string }> = [];

  const initial = (ownerEmail ? ownerEmail[0] : "O").toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-15 gap-3">
          {/* Brand & Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={homeHref}
              className="flex items-center gap-2.5 rounded-lg p-0.5 focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:outline-none group select-none"
            >
              <div className="w-7.5 h-7.5 rounded-[8px] bg-linear-to-b from-[#383435] to-[#1E1B1C] shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.15)] ring-1 ring-black/10 flex items-center justify-center text-white font-sans font-bold text-[11px] tracking-tight group-hover:scale-[1.02] transition-transform">
                GD
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-sans font-semibold text-ink text-[13px] tracking-tight">
                  GuruOm Dental
                </span>
                <span className="text-[10px] font-medium tracking-wide bg-black/[0.04] text-ink-muted/80 px-1.5 py-0.5 rounded-full border border-black/[0.04]">
                  Owner
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Center: Segmented Navigation Capsule */}
          <nav
            aria-label="Owner navigation"
            className="hidden md:flex items-center bg-black/[0.04] p-1 rounded-full border border-black/[0.04] shadow-[inset_0_1px_1px_rgba(0,0,0,0.02)]"
          >
            <OwnerNavLinks items={navItems} />

            {/* Disabled Coming Soon items */}
            {disabledItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="relative group">
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[13px] tracking-tight text-ink-muted/50 cursor-not-allowed select-none transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 opacity-60 stroke-[1.75]" />
                    <span>{item.label}</span>
                    <span className="text-[9px] font-semibold uppercase tracking-wider bg-black/[0.04] text-ink-muted/60 px-1.5 py-0.2 rounded-full">
                      Soon
                    </span>
                  </button>
                  <div
                    role="tooltip"
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block px-2.5 py-1 bg-ink/90 backdrop-blur-md text-white text-[11px] font-medium rounded-lg shadow-lg whitespace-nowrap pointer-events-none z-50 border border-white/10"
                  >
                    {item.tooltip}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Right Area: Public Site, Profile Capsule & Logout */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Link to patient-facing site */}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium text-ink-muted/80 hover:text-ink hover:bg-black/[0.04] active:bg-black/[0.06] transition-all duration-150 select-none"
              title="Open public website in a new tab"
            >
              <Globe className="w-3.5 h-3.5 text-ink-muted/70 stroke-[1.75]" />
              <span>Live Site</span>
              <ArrowUpRight className="w-3 h-3 text-ink-muted/50" />
            </Link>

            <div className="hidden lg:block h-3.5 w-px bg-black/[0.08]" aria-hidden="true" />

            {/* Authenticated user capsule with 2FA badge */}
            {ownerEmail && (
              <div className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-black/[0.03] border border-black/[0.04]">
                <div className="relative">
                  <div className="w-6 h-6 rounded-full bg-linear-to-b from-stone-100 to-stone-200 border border-black/10 flex items-center justify-center text-[10px] font-semibold text-ink select-none">
                    {initial}
                  </div>
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"
                    title="2FA Active Session"
                  />
                </div>
                <span className="text-xs font-medium text-ink/90 hidden xl:inline-block max-w-[150px] truncate">
                  {ownerEmail}
                </span>
                <span
                  className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-500/10 px-1.5 py-0.5 rounded-full"
                  title="Two-factor authentication verified"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-600 stroke-[2.2]" />
                  2FA
                </span>
              </div>
            )}

            {/* Sign Out */}
            <LogoutButton />
          </div>
        </div>

        {/* Mobile Navigation bar (iOS-style Segmented scroll) */}
        <div className="md:hidden py-1.5 border-t border-black/[0.05] overflow-x-auto no-scrollbar">
          <nav
            aria-label="Mobile owner navigation"
            className="inline-flex items-center gap-1 p-0.5 rounded-full bg-black/[0.03] border border-black/[0.04] min-w-full"
          >
            <OwnerNavLinks items={navItems} mobile />
          </nav>
        </div>
      </div>
    </header>
  );
}
