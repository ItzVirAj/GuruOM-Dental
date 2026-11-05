"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap, useGSAP } from "@/lib/gsap";
import { Container } from "@/components/ui";
import { useIsDesktop, useReducedMotion } from "@/components/animations";
import { siteConfig, navLinks, megaMenuGroups } from "@/data/site";

export interface NavbarProps {
  variant?: "transparent-light" | "solid";
}

const NAV_HEIGHT = "3.25rem"; // 52px

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 4l6 6-6 6" />
    </svg>
  );
}

export function Navbar({ }: NavbarProps) {
  const pathname = usePathname();
  const isDesktop = useIsDesktop();
  const prefersReducedMotion = useReducedMotion();

  // State
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobilePagesOpen, setIsMobilePagesOpen] = useState(false);
  const [activeHoverIndex, setActiveHoverIndex] = useState<number | null>(null);

  // Refs
  const linksNavRef = useRef<HTMLElement | null>(null);
  const linkRefs = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([]);
  const indicatorRef = useRef<HTMLSpanElement | null>(null);
  const megaPanelRef = useRef<HTMLDivElement | null>(null);
  const megaBackdropRef = useRef<HTMLDivElement | null>(null);
  const megaTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const phoneHref = `tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`;

  const isRouteActive = useCallback(
    (href: string) => {
      if (href === "/") return pathname === "/";
      return pathname.startsWith(href);
    },
    [pathname]
  );

  // -------------------------------------------------------------
  // Keep the page's --nav-h in sync with this navbar's height
  // -------------------------------------------------------------
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.style.getPropertyValue("--nav-h");
    root.style.setProperty("--nav-h", NAV_HEIGHT);
    return () => {
      if (prev) root.style.setProperty("--nav-h", prev);
      else root.style.removeProperty("--nav-h");
    };
  }, []);

  // -------------------------------------------------------------
  // Scroll state
  // -------------------------------------------------------------
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(y > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close everything on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMegaOpen(false);
    setIsMobileOpen(false);
    setIsMobilePagesOpen(false);
  }, [pathname]);

  // -------------------------------------------------------------
  // Sliding glass pill indicator
  // -------------------------------------------------------------
  const updateIndicator = useCallback(() => {
    const nav = linksNavRef.current;
    const indicator = indicatorRef.current;
    if (!nav || !indicator || !isDesktop) return;

    const targetIndex = isMegaOpen ? navLinks.length : activeHoverIndex;
    const hovered = targetIndex !== null;

    const el = hovered
      ? linkRefs.current[targetIndex as number]
      : (nav.querySelector("a[data-active='true']") as HTMLElement | null);

    if (!el) {
      gsap.to(indicator, { opacity: 0, duration: 0.2, overwrite: "auto" });
      return;
    }

    const props = {
      x: el.offsetLeft,
      width: el.offsetWidth,
      opacity: hovered ? 1 : 0.6,
    };

    if (prefersReducedMotion) {
      gsap.set(indicator, props);
    } else {
      gsap.to(indicator, {
        ...props,
        duration: 0.32,
        ease: "power3.out",
        overwrite: "auto",
      });
    }
  }, [activeHoverIndex, isMegaOpen, isDesktop, prefersReducedMotion]);

  useEffect(() => {
    updateIndicator();
  }, [updateIndicator, pathname]);

  // -------------------------------------------------------------
  // Mega menu open / close animation
  // -------------------------------------------------------------
  useGSAP(
    () => {
      const panel = megaPanelRef.current;
      const backdrop = megaBackdropRef.current;
      if (!panel || !backdrop) return;

      megaTimelineRef.current?.kill();

      if (isMegaOpen) {
        const tl = gsap.timeline();
        megaTimelineRef.current = tl;
        tl.set([panel, backdrop], { visibility: "visible" });

        if (prefersReducedMotion) {
          tl.to([panel, backdrop], { opacity: 1, duration: 0.15, ease: "none" });
        } else {
          tl.fromTo(
            panel,
            { opacity: 0, y: -10 },
            { opacity: 1, y: 0, duration: 0.38, ease: "power3.out" },
            0
          );
          tl.fromTo(
            backdrop,
            { opacity: 0 },
            { opacity: 1, duration: 0.3, ease: "power2.out" },
            0
          );
          const items = panel.querySelectorAll(".mega-reveal");
          if (items.length) {
            tl.fromTo(
              items,
              { opacity: 0, y: 12 },
              { opacity: 1, y: 0, stagger: 0.045, duration: 0.4, ease: "power2.out" },
              0.08
            );
          }
        }
      } else {
        gsap.to([panel, backdrop], {
          opacity: 0,
          duration: prefersReducedMotion ? 0.1 : 0.2,
          ease: "power2.in",
          overwrite: "auto",
          onComplete: () => {
            gsap.set([panel, backdrop], { visibility: "hidden" });
          },
        });
      }
    },
    { dependencies: [isMegaOpen, prefersReducedMotion] }
  );

  const openMegaMenu = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsMegaOpen(true);
  };

  const scheduleCloseMegaMenu = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setIsMegaOpen(false), 160);
  };

  // Escape closes everything
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMegaOpen(false);
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  // -------------------------------------------------------------
  // Mobile sheet animation
  // -------------------------------------------------------------
  useGSAP(
    () => {
      const sheet = mobileMenuRef.current;
      if (!sheet || !isMobileOpen) return;

      if (prefersReducedMotion) {
        gsap.set(sheet, { opacity: 1 });
        return;
      }

      gsap.fromTo(
        sheet,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );

      const items = sheet.querySelectorAll(".mobile-reveal");
      if (items.length) {
        gsap.fromTo(
          items,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.05,
            delay: 0.08,
            duration: 0.45,
            ease: "power3.out",
          }
        );
      }
    },
    { dependencies: [isMobileOpen, prefersReducedMotion] }
  );

  return (
    <>
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 z-[60] rounded-full bg-accent px-4 py-2 text-sm font-semibold text-brand-dark shadow-lg outline-none ring-2 ring-accent"
      >
        Skip to main content
      </a>

      {/* Dim + blur backdrop behind the mega menu */}
      <div
        ref={megaBackdropRef}
        onMouseEnter={scheduleCloseMegaMenu}
        onClick={() => setIsMegaOpen(false)}
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        style={{ visibility: "hidden", opacity: 0 }}
      />

      {/* ---------------- Header ---------------- */}
      <header
        className={`fixed inset-x-0 top-0 z-50 backdrop-blur-xl backdrop-saturate-[180%] transition-[background-color,border-color] duration-300 border-b ${isScrolled || isMegaOpen || isMobileOpen
            ? "bg-brand-dark/85 border-white/10"
            : "bg-brand-dark/60 border-transparent"
          }`}
        style={{ height: `var(--nav-h, ${NAV_HEIGHT})` }}
      >
        <Container>
          <div className="relative flex h-[3.25rem] items-center justify-between">
            {/* 1. Wordmark */}
            <Link
              href="/"
              aria-label="GuruOm Dental - Home"
              className="shrink-0 rounded-md font-just-serif text-[21px] font-normal tracking-tight text-white outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-accent"
              style={{ fontFamily: "var(--font-just-serif), serif" }}
            >
              GuruOm Dental
            </Link>

            {/* 2. Desktop links */}
            <nav
              ref={linksNavRef}
              aria-label="Primary Navigation"
              className="relative hidden items-center gap-0.5 lg:flex"
              onMouseLeave={() => setActiveHoverIndex(null)}
            >
              {/* Glass pill */}
              <span
                ref={indicatorRef}
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-1/2 -mt-4 h-8 rounded-full bg-white/10 ring-1 ring-inset ring-white/[0.06]"
                style={{ opacity: 0 }}
              />

              {navLinks.map((link, idx) => {
                const active = isRouteActive(link.href);
                return (
                  <Link
                    key={link.href}
                    ref={(el) => {
                      linkRefs.current[idx] = el;
                    }}
                    href={link.href}
                    data-active={active}
                    aria-current={active ? "page" : undefined}
                    onMouseEnter={() => {
                      setActiveHoverIndex(idx);
                      scheduleCloseMegaMenu();
                    }}
                    onFocus={() => setActiveHoverIndex(idx)}
                    onBlur={() => setActiveHoverIndex(null)}
                    className={`relative z-10 flex h-8 items-center rounded-full px-3.5 text-[13px] tracking-tight outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent ${active
                        ? "font-semibold text-white"
                        : "font-medium text-white/70 hover:text-white"
                      }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Pages trigger */}
              <button
                ref={(el) => {
                  linkRefs.current[navLinks.length] = el;
                }}
                type="button"
                aria-expanded={isMegaOpen}
                aria-haspopup="true"
                aria-controls="desktop-mega-menu"
                onMouseEnter={() => {
                  setActiveHoverIndex(navLinks.length);
                  openMegaMenu();
                }}
                onFocus={() => setActiveHoverIndex(navLinks.length)}
                onBlur={() => setActiveHoverIndex(null)}
                onClick={() => setIsMegaOpen((p) => !p)}
                className={`relative z-10 flex h-8 items-center gap-1 rounded-full px-3.5 text-[13px] font-medium tracking-tight outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent ${isMegaOpen ? "text-white" : "text-white/70 hover:text-white"
                  }`}
              >
                Pages
                <svg
                  className={`h-3.5 w-3.5 transition-transform duration-300 ${isMegaOpen ? "rotate-180" : ""
                    }`}
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 8l5 5 5-5" />
                </svg>
              </button>
            </nav>

            {/* 3. Right actions */}
            <div className="hidden items-center gap-2 lg:flex">
              <a
                href={phoneHref}
                aria-label={`Call ${siteConfig.phone}`}
                className="inline-flex h-8 items-center gap-2 rounded-full px-3 text-[13px] font-medium text-white/70 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-accent"
              >
                <svg
                  className="h-3.5 w-3.5 text-accent"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span className="hidden xl:inline">{siteConfig.phone}</span>
              </a>

              <Link
                href="/contact"
                className="inline-flex h-8 items-center rounded-full bg-accent px-4 text-[13px] font-semibold text-brand-dark outline-none transition-all duration-200 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white active:scale-[0.97]"
              >
                Contact
              </Link>
            </div>

            {/* 4. Mobile hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileOpen((p) => !p)}
              aria-expanded={isMobileOpen}
              aria-controls="mobile-navigation-menu"
              aria-label={isMobileOpen ? "Close navigation menu" : "Open navigation menu"}
              className="relative -mr-2 flex h-10 w-10 items-center justify-center rounded-full text-white outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-accent lg:hidden"
            >
              <span className="relative block h-[18px] w-[18px]">
                <span
                  className={`absolute left-0 h-[1.5px] w-full rounded-full bg-current transition-all duration-300 ${isMobileOpen ? "top-1/2 rotate-45" : "top-[5px]"
                    }`}
                />
                <span
                  className={`absolute left-0 h-[1.5px] w-full rounded-full bg-current transition-all duration-300 ${isMobileOpen ? "top-1/2 -rotate-45" : "top-[12px]"
                    }`}
                />
              </span>
            </button>
          </div>
        </Container>

        {/* ---------------- Mega menu panel (always mounted) ---------------- */}
        <div
          id="desktop-mega-menu"
          ref={megaPanelRef}
          onMouseEnter={openMegaMenu}
          onMouseLeave={scheduleCloseMegaMenu}
          className="absolute inset-x-0 top-full hidden border-b border-white/10 bg-brand-dark/95 text-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-2xl backdrop-saturate-[180%] lg:block"
          style={{ visibility: "hidden", opacity: 0 }}
        >
          <Container>
            <div className="grid grid-cols-12 gap-10 py-10">
              {/* Link groups */}
              <div className="col-span-9 grid grid-cols-3 gap-8">
                {megaMenuGroups.map((group) => (
                  <div key={group.title} className="mega-reveal flex flex-col gap-4">
                    <span className="text-xs font-medium text-white/50">
                      {group.title}
                    </span>
                    <ul className="flex flex-col gap-3.5">
                      {group.items.map((item) => (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            onClick={() => setIsMegaOpen(false)}
                            className="group/item block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent"
                          >
                            <span className="block text-[17px] font-semibold leading-tight tracking-tight text-white transition-colors group-hover/item:text-accent">
                              {item.label}
                            </span>
                            <span className="mt-0.5 block text-[12px] leading-snug text-white/50 line-clamp-1">
                              {item.description}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Promo */}
              <div className="mega-reveal col-span-3">
                <div className="flex h-full flex-col justify-between gap-6 rounded-3xl border border-white/10 bg-white/[0.05] p-6">
                  <div className="flex flex-col gap-2">
                    <span className="w-fit rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-semibold text-accent">
                      New patients
                    </span>
                    <h4 className="mt-1 font-display text-xl font-bold leading-tight tracking-tight">
                      Book your first visit.
                    </h4>
                    <p className="text-[13px] leading-relaxed text-white/60">
                      Comprehensive oral scanning with zero radiation discomfort.
                    </p>
                  </div>
                  <Link
                    href="/contact"
                    onClick={() => setIsMegaOpen(false)}
                    className="inline-flex w-fit items-center gap-1 rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-brand-dark outline-none transition-all hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white active:scale-[0.97]"
                  >
                    Contact Labs
                    <Chevron className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </header>

      {/* ---------------- Mobile sheet ---------------- */}
      {isMobileOpen && (
        <div
          id="mobile-navigation-menu"
          ref={mobileMenuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-brand-dark/95 text-white backdrop-blur-2xl lg:hidden"
          style={{ paddingTop: `calc(var(--nav-h, ${NAV_HEIGHT}) + 1rem)` }}
        >
          <Container className="flex flex-1 flex-col justify-between pb-8">
            <ul className="flex flex-col">
              {navLinks.map((link) => {
                const active = isRouteActive(link.href);
                return (
                  <li key={link.href} className="mobile-reveal border-b border-white/10">
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center justify-between py-4 font-display text-[28px] font-semibold tracking-tight outline-none transition-colors focus-visible:text-accent ${active ? "text-accent" : "text-white"
                        }`}
                    >
                      {link.label}
                      <Chevron className="h-5 w-5 text-white/30" />
                    </Link>
                  </li>
                );
              })}

              {/* Pages accordion */}
              <li className="mobile-reveal border-b border-white/10">
                <button
                  type="button"
                  onClick={() => setIsMobilePagesOpen((p) => !p)}
                  aria-expanded={isMobilePagesOpen}
                  className="flex w-full items-center justify-between py-4 font-display text-[28px] font-semibold tracking-tight text-white outline-none focus-visible:text-accent"
                >
                  Pages
                  <svg
                    className={`h-5 w-5 text-white/30 transition-transform duration-300 ${isMobilePagesOpen ? "rotate-180" : ""
                      }`}
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 8l5 5 5-5" />
                  </svg>
                </button>

                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${isMobilePagesOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-col gap-6 pb-5 pt-1">
                      {megaMenuGroups.map((group) => (
                        <div key={group.title} className="flex flex-col gap-2.5">
                          <span className="text-xs font-medium text-white/50">
                            {group.title}
                          </span>
                          {group.items.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={() => setIsMobileOpen(false)}
                              className="text-lg font-semibold tracking-tight text-white/90 outline-none transition-colors hover:text-accent focus-visible:text-accent"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            </ul>

            {/* Footer */}
            <div className="mobile-reveal mt-10 flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-white/50">Front desk</span>
                <a
                  href={phoneHref}
                  className="text-xl font-semibold tracking-tight text-white transition-colors hover:text-accent"
                >
                  {siteConfig.phone}
                </a>
                <span className="mt-1 text-xs leading-relaxed text-white/50">
                  {siteConfig.address.full}
                </span>
              </div>

              <Link
                href="/contact"
                onClick={() => setIsMobileOpen(false)}
                className="flex h-12 w-full items-center justify-center rounded-full bg-accent text-[15px] font-semibold text-brand-dark outline-none transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white"
              >
                Contact
              </Link>
            </div>
          </Container>
        </div>
      )}
    </>
  );
}

export default Navbar;