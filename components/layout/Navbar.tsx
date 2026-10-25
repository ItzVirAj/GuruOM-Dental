"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { gsap, useGSAP } from "@/lib/gsap";
import { Container, Button, Badge, SmartImage } from "@/components/ui";
import { useIsDesktop, useReducedMotion } from "@/components/animations";
import { siteConfig, navLinks, megaMenuGroups } from "@/data/site";

export interface NavbarProps {
  variant?: "transparent-light" | "solid";
}

export function Navbar({}: NavbarProps) {
  const pathname = usePathname();
  const isDesktop = useIsDesktop();
  const prefersReducedMotion = useReducedMotion();

  // State
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeHoverIndex, setActiveHoverIndex] = useState<number | null>(null);

  // Refs
  const navContainerRef = useRef<HTMLElement | null>(null);
  const navInnerRef = useRef<HTMLDivElement | null>(null);
  const linksNavRef = useRef<HTMLDivElement | null>(null);
  const linkRefs = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([]);
  const indicatorRef = useRef<HTMLSpanElement | null>(null);
  const megaPanelRef = useRef<HTMLDivElement | null>(null);
  const megaTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const hamburgerButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Active route matching
  const isRouteActive = useCallback(
    (href: string) => {
      if (href === "/") return pathname === "/";
      return pathname.startsWith(href);
    },
    [pathname]
  );

  // -------------------------------------------------------------
  // A) Scroll Style State (Always visible, permanently fixed)
  // -------------------------------------------------------------
  // Sync scroll state reliably via passive scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(y > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useGSAP(
    () => {
      const el = navContainerRef.current;
      if (!el) return;
      // Ensure navbar is always positioned at 0 and never translated away
      gsap.set(el, { yPercent: 0 });
    },
    []
  );

  // Animate inner navbar height slightly on scroll state change (80px -> 68px)
  useEffect(() => {
    const inner = navInnerRef.current;
    if (!inner) return;

    if (prefersReducedMotion) {
      return;
    }

    if (isScrolled) {
      gsap.to(inner, {
        height: 68,
        duration: 0.25,
        ease: "power2.out",
        overwrite: "auto",
      });
    } else {
      gsap.to(inner, {
        height: 80,
        duration: 0.25,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  }, [isScrolled, prefersReducedMotion]);

  // -------------------------------------------------------------
  // B) Active Indicator Sliding Logic
  // -------------------------------------------------------------
  const updateIndicator = useCallback(() => {
    const nav = linksNavRef.current;
    const indicator = indicatorRef.current;
    if (!nav || !indicator || !isDesktop) return;

    // Find active element (either hovered item or current route link)
    const activeEl =
      activeHoverIndex !== null
        ? linkRefs.current[activeHoverIndex]
        : (nav.querySelector("a[data-active='true']") as HTMLElement);

    if (activeEl) {
      const left = activeEl.offsetLeft;
      const width = activeEl.offsetWidth;

      if (prefersReducedMotion) {
        gsap.set(indicator, { opacity: 1, x: left, width });
      } else {
        gsap.to(indicator, {
          opacity: 1,
          x: left,
          width,
          duration: 0.28,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    } else {
      gsap.to(indicator, {
        opacity: 0,
        duration: 0.2,
        overwrite: "auto",
      });
    }
  }, [activeHoverIndex, isDesktop, prefersReducedMotion]);

  useEffect(() => {
    updateIndicator();
  }, [updateIndicator, pathname]);

  // -------------------------------------------------------------
  // C) Mega Menu Animation Timeline
  // -------------------------------------------------------------
  useGSAP(
    () => {
      const panel = megaPanelRef.current;
      if (!panel) return;

      if (isMegaOpen) {
        if (megaTimelineRef.current) megaTimelineRef.current.kill();

        const tl = gsap.timeline();
        megaTimelineRef.current = tl;

        if (prefersReducedMotion) {
          tl.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "none" });
        } else {
          tl.fromTo(
            panel,
            { opacity: 0, y: -12, scale: 0.985 },
            { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: "power3.out" }
          );

          const groups = panel.querySelectorAll(".mega-group");
          const promo = panel.querySelector(".mega-promo");

          if (groups.length) {
            tl.fromTo(
              groups,
              { opacity: 0, y: 14 },
              { opacity: 1, y: 0, stagger: 0.05, duration: 0.3, ease: "power2.out" },
              "-=0.2"
            );
          }

          if (promo) {
            tl.fromTo(
              promo,
              { opacity: 0, scale: 0.96 },
              { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" },
              "-=0.25"
            );
          }
        }
      } else if (megaTimelineRef.current) {
        megaTimelineRef.current.kill();
        if (panel) {
          gsap.to(panel, {
            opacity: 0,
            y: prefersReducedMotion ? 0 : -8,
            duration: 0.2,
            ease: "power2.in",
            overwrite: "auto",
          });
        }
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
    closeTimerRef.current = setTimeout(() => {
      setIsMegaOpen(false);
    }, 220);
  };

  // Close menus on Escape key
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
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  // Mobile menu GSAP animation
  useGSAP(
    () => {
      const overlay = mobileMenuRef.current;
      if (!overlay) return;

      if (isMobileOpen) {
        if (prefersReducedMotion) {
          gsap.set(overlay, { opacity: 1 });
        } else {
          gsap.fromTo(
            overlay,
            { clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" },
            {
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
              duration: 0.45,
              ease: "power3.inOut",
            }
          );

          const items = overlay.querySelectorAll(".mobile-nav-item");
          const footer = overlay.querySelector(".mobile-nav-footer");

          if (items.length) {
            gsap.fromTo(
              items,
              { opacity: 0, y: 24 },
              { opacity: 1, y: 0, stagger: 0.06, delay: 0.15, duration: 0.4, ease: "power3.out" }
            );
          }

          if (footer) {
            gsap.fromTo(
              footer,
              { opacity: 0, y: 16 },
              { opacity: 1, y: 0, delay: 0.35, duration: 0.4, ease: "power2.out" }
            );
          }
        }
      }
    },
    { dependencies: [isMobileOpen, prefersReducedMotion] }
  );

  return (
    <>
      {/* Skip to Content accessible link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 rounded-md bg-accent px-4 py-2 font-medium text-brand-dark shadow-lg outline-none ring-2 ring-accent transition"
      >
        Skip to main content
      </a>

      {/* Permanently fixed, always visible, dark glassmorphism navbar */}
      <header
        ref={navContainerRef}
        className="fixed top-0 left-0 right-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300"
        style={{
          height: "var(--nav-h, 5rem)",
          backgroundColor: isScrolled ? "rgba(10, 10, 10, 0.88)" : "rgba(10, 10, 10, 0.72)",
          backdropFilter: "blur(16px) saturate(160%)",
          WebkitBackdropFilter: "blur(16px) saturate(160%)",
          borderColor: isScrolled ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.09)",
          boxShadow: isScrolled ? "0 10px 30px -5px rgba(0, 0, 0, 0.4)" : "none",
        }}
      >
        <Container>
          <div
            ref={navInnerRef}
            className="flex h-20 items-center justify-between transition-[height] duration-250"
          >
            {/* 1. Brand Logo */}
            <Link
              href="/"
              className="group flex items-center shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg py-1"
              aria-label="GuruOm Dental - Home"
            >
              <Image
                src="/images/NewLogo2nd-Viraj-Guru-OM-PNG.png"
                alt="GuruOm Dental"
                width={160}
                height={37}
                priority
                style={{ width: "auto", height: "36px" }}
                className="w-auto h-9 max-h-9 object-contain object-left transition-transform duration-300 group-hover:scale-[1.02] drop-shadow-sm"
              />
            </Link>

            {/* 2. Desktop Centered Navigation Links */}
            <nav
              ref={linksNavRef}
              className="relative hidden lg:flex items-center gap-1"
              aria-label="Primary Navigation"
            >
              {/* Sliding Active Pill Indicator */}
              <span
                ref={indicatorRef}
                className="pointer-events-none absolute bottom-0 h-0.5 rounded-full transition-opacity duration-200 bg-accent"
                style={{ opacity: 0 }}
                aria-hidden="true"
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
                    onMouseEnter={() => setActiveHoverIndex(idx)}
                    onMouseLeave={() => setActiveHoverIndex(null)}
                    aria-current={active ? "page" : undefined}
                    className={`group relative px-3 py-2 text-sm font-medium transition-colors rounded-md outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      active ? "text-accent font-semibold" : "text-white/85 hover:text-white"
                    }`}
                  >
                    {/* Text-roll hover animation */}
                    <span className="relative inline-flex flex-col h-5 overflow-hidden">
                      <span className="transition-transform duration-300 ease-out group-hover:-translate-y-full">
                        {link.label}
                      </span>
                      <span
                        className="absolute top-full left-0 transition-transform duration-300 ease-out group-hover:-translate-y-full text-accent font-medium"
                        aria-hidden="true"
                      >
                        {link.label}
                      </span>
                    </span>
                  </Link>
                );
              })}

              {/* Mega Menu "Pages" Trigger */}
              <div
                className="relative"
                onMouseEnter={() => {
                  setActiveHoverIndex(navLinks.length);
                  openMegaMenu();
                }}
                onMouseLeave={() => {
                  setActiveHoverIndex(null);
                  scheduleCloseMegaMenu();
                }}
              >
                <button
                  ref={(el) => {
                    linkRefs.current[navLinks.length] = el;
                  }}
                  type="button"
                  onClick={() => setIsMegaOpen((prev) => !prev)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setIsMegaOpen((prev) => !prev);
                    }
                  }}
                  aria-expanded={isMegaOpen}
                  aria-haspopup="true"
                  aria-controls="desktop-mega-menu"
                  className={`group flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors ${
                    isMegaOpen ? "text-accent" : "text-white/85 hover:text-white"
                  }`}
                >
                  <span>Pages</span>
                  <svg
                    className={`h-4 w-4 transition-transform duration-300 ${
                      isMegaOpen ? "rotate-180 text-accent" : "text-white/60 group-hover:text-white"
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Mega Menu Dropdown Panel (Dark Theme) */}
                {isMegaOpen && (
                  <div
                    id="desktop-mega-menu"
                    ref={megaPanelRef}
                    className="absolute top-full -left-48 mt-3 w-[720px] rounded-2xl bg-black/90 backdrop-blur-xl p-6 shadow-2xl ring-1 ring-white/10 border border-white/10 z-50 text-white"
                    onMouseEnter={openMegaMenu}
                    onMouseLeave={scheduleCloseMegaMenu}
                  >
                    <div className="grid grid-cols-4 gap-6">
                      {/* 3 Link Groups */}
                      {megaMenuGroups.map((group) => (
                        <div key={group.title} className="mega-group flex flex-col gap-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-accent">
                            {group.title}
                          </span>
                          <ul className="flex flex-col gap-2">
                            {group.items.map((item) => (
                              <li key={item.label}>
                                <Link
                                  href={item.href}
                                  onClick={() => setIsMegaOpen(false)}
                                  className="group/item block rounded-lg p-1.5 transition-colors hover:bg-white/5 outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                >
                                  <div className="text-sm font-semibold text-white group-hover/item:text-accent transition-colors">
                                    {item.label}
                                  </div>
                                  <div className="text-[11px] text-white/60 line-clamp-1 leading-snug">
                                    {item.description}
                                  </div>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}

                      {/* Mega Menu Promo Card */}
                      <div className="mega-promo flex flex-col justify-between rounded-xl bg-white/5 p-4 border border-white/10">
                        <div className="flex flex-col gap-2">
                          <div className="overflow-hidden rounded-lg">
                            <SmartImage
                              slot="navPromo"
                              alt="Book your first visit consultation"
                              aspect="4/5"
                              className="rounded-lg object-cover"
                            />
                          </div>
                          <Badge variant="outline" size="sm" className="w-fit mt-1 border-accent/40 text-accent">
                            New Patients
                          </Badge>
                          <h4 className="font-display text-sm font-bold text-white">
                            Book your first visit
                          </h4>
                          <p className="text-xs text-white/70 leading-relaxed font-body">
                            Experience comprehensive oral scanning with zero radiation discomfort.
                          </p>
                        </div>
                        <div className="mt-4">
                          <Button
                            href="/appointment"
                            variant="primary"
                            size="sm"
                            className="w-full text-xs justify-center"
                            onClick={() => setIsMegaOpen(false)}
                          >
                            Get Started
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* 3. Right Action Area (Phone + Magnetic Button) */}
            <div className="hidden lg:flex items-center gap-5">
              <a
                href={`tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`}
                className="flex items-center gap-2 text-sm font-medium text-white/85 hover:text-white transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md"
              >
                <svg
                  className="h-4 w-4 text-accent"
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
                <span>{siteConfig.phone}</span>
              </a>
            </div>

            {/* 4. Mobile Hamburger Button */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                ref={hamburgerButtonRef}
                type="button"
                onClick={() => setIsMobileOpen((prev) => !prev)}
                aria-expanded={isMobileOpen}
                aria-controls="mobile-navigation-menu"
                aria-label={isMobileOpen ? "Close navigation menu" : "Open navigation menu"}
                className="relative flex h-11 w-11 items-center justify-center rounded-xl p-2.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent bg-white/10 text-white hover:bg-white/15"
              >
                <div className="relative flex flex-col justify-between w-5 h-4">
                  <span
                    className={`h-0.5 w-full rounded-full bg-current transition-all duration-300 ${
                      isMobileOpen ? "translate-y-[7px] rotate-45" : ""
                    }`}
                  />
                  <span
                    className={`h-0.5 w-full rounded-full bg-current transition-opacity duration-200 ${
                      isMobileOpen ? "opacity-0" : "opacity-100"
                    }`}
                  />
                  <span
                    className={`h-0.5 w-full rounded-full bg-current transition-all duration-300 ${
                      isMobileOpen ? "-translate-y-[7px] -rotate-45" : ""
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* 5. Mobile Fullscreen Overlay Menu */}
      {isMobileOpen && (
        <div
          id="mobile-navigation-menu"
          ref={mobileMenuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed inset-0 z-40 flex flex-col justify-between bg-brand-dark px-6 pt-24 pb-8 text-white lg:hidden overflow-y-auto"
        >
          {/* Main Links List */}
          <div className="flex flex-col gap-5 pt-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              Menu
            </span>
            <ul className="flex flex-col gap-3">
              {navLinks.map((link) => {
                const active = isRouteActive(link.href);
                return (
                  <li key={link.href} className="mobile-nav-item">
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`font-display text-3xl font-bold tracking-tight transition-colors hover:text-accent outline-none focus-visible:underline ${
                        active ? "text-accent" : "text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Quick pages group for mobile */}
            <div className="mobile-nav-item mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-2">
              <Link
                href="/services"
                onClick={() => setIsMobileOpen(false)}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                All Services
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsMobileOpen(false)}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                Clinic Location
              </Link>
            </div>
          </div>

          {/* Footer Contact Info & CTA in Mobile Menu */}
          <div className="mobile-nav-footer mt-8 flex flex-col gap-5 border-t border-white/15 pt-6">
            <div className="flex flex-col gap-1 text-sm text-surface-alt">
              <span className="font-semibold text-white">Call Front Desk</span>
              <a
                href={`tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`}
                className="text-accent hover:underline text-base font-bold"
              >
                {siteConfig.phone}
              </a>
              <span className="text-xs text-white/70 mt-1">{siteConfig.address.full}</span>
            </div>

            <Button
              href="/appointment"
              variant="secondary"
              size="lg"
              className="w-full text-brand-dark font-bold justify-center"
              onClick={() => setIsMobileOpen(false)}
            >
              Book Appointment
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
