"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Container, Button, Badge, SmartImage } from "@/components/ui";
import { MagneticWrap, useLenis, useIsDesktop, useReducedMotion } from "@/components/animations";
import { siteConfig, navLinks, megaMenuGroups } from "@/data/site";

export interface NavbarProps {
  /**
   * Header appearance at the very top of the page.
   * 'transparent-light': transparent background with white/light text (for dark hero sections).
   * 'solid': surface background with dark ink text.
   * Scrolling down past 40px always transitions smoothly to solid surface blur.
   */
  variant?: "transparent-light" | "solid";
}

export function Navbar({ variant }: NavbarProps) {
  const pathname = usePathname();
  const lenis = useLenis();
  const isDesktop = useIsDesktop();
  const prefersReducedMotion = useReducedMotion();

  // Clean route-to-variant resolution: routes with PageHeader or Hero start transparent-light at the top,
  // transitioning smoothly to solid surface on scroll past 40px.
  const isLightTopRoute = pathname.startsWith("/design-system") || pathname.startsWith("/animation-lab");
  const resolvedVariant = variant ?? (isLightTopRoute ? "solid" : "transparent-light");

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
  const lastScrollYRef = useRef(0);
  const isHiddenRef = useRef(false);

  // Active route matching
  const isRouteActive = useCallback(
    (href: string) => {
      if (href === "/") return pathname === "/";
      return pathname.startsWith(href);
    },
    [pathname]
  );

  // -------------------------------------------------------------
  // A) Scroll Hide/Show & Style State (GSAP ScrollTrigger)
  // -------------------------------------------------------------
  useGSAP(
    () => {
      const el = navContainerRef.current;
      const inner = navInnerRef.current;
      if (!el || !inner) return;

      // Initial state
      gsap.set(el, { yPercent: 0 });

      const st = ScrollTrigger.create({
        start: "top top",
        end: 999999,
        onUpdate: (self) => {
          const currentY = self.scroll();
          const delta = currentY - lastScrollYRef.current;
          const isAtTop = currentY <= 40;

          // Toggle scrolled style threshold
          setIsScrolled(currentY > 40);

          // Hide / Show logic with debounce threshold
          if (isAtTop) {
            // Always visible at the top
            if (isHiddenRef.current) {
              gsap.to(el, {
                yPercent: 0,
                duration: prefersReducedMotion ? 0 : 0.35,
                ease: "power2.out",
                overwrite: "auto",
              });
              isHiddenRef.current = false;
            }
          } else if (Math.abs(delta) > 8) {
            if (delta > 0 && !isHiddenRef.current && !isMegaOpen) {
              // Scrolling DOWN: Hide
              gsap.to(el, {
                yPercent: -100,
                duration: prefersReducedMotion ? 0 : 0.35,
                ease: "power2.inOut",
                overwrite: "auto",
              });
              isHiddenRef.current = true;
            } else if (delta < 0 && isHiddenRef.current) {
              // Scrolling UP: Show
              gsap.to(el, {
                yPercent: 0,
                duration: prefersReducedMotion ? 0 : 0.35,
                ease: "power2.out",
                overwrite: "auto",
              });
              isHiddenRef.current = false;
            }
          }

          lastScrollYRef.current = currentY;
        },
      });

      return () => {
        st.kill();
      };
    },
    { dependencies: [prefersReducedMotion, isMegaOpen] }
  );

  // Animate inner navbar padding/height on scroll state change
  useEffect(() => {
    const inner = navInnerRef.current;
    if (!inner) return;

    if (prefersReducedMotion) {
      return;
    }

    if (isScrolled) {
      gsap.to(inner, {
        height: 64,
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    } else {
      gsap.to(inner, {
        height: 80,
        duration: 0.3,
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
    }, 120);
  };

  // Close mega menu and mobile menu on route change
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMegaOpen(false);
    setIsMobileOpen(false);
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isMegaOpen) setIsMegaOpen(false);
        if (isMobileOpen) {
          setIsMobileOpen(false);
          hamburgerButtonRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMegaOpen, isMobileOpen]);

  // -------------------------------------------------------------
  // D) Mobile Menu Lock & Animation
  // -------------------------------------------------------------
  useEffect(() => {
    if (isMobileOpen) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.body.style.overflow = "";
    }
    return () => {
      lenis?.start();
      document.body.style.overflow = "";
    };
  }, [isMobileOpen, lenis]);

  useGSAP(
    () => {
      const overlay = mobileMenuRef.current;
      if (!overlay) return;

      if (isMobileOpen) {
        if (prefersReducedMotion) {
          gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.2 });
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

  // Determine text and theme colors based on state & variant
  const isDarkTop = resolvedVariant === "transparent-light" && !isScrolled;

  const textColorClass = isDarkTop
    ? "text-white/90 hover:text-white"
    : "text-ink/80 hover:text-brand";

  const activeColorClass = isDarkTop ? "text-white font-semibold" : "text-brand font-semibold";

  return (
    <>
      {/* Skip to Content accessible link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 rounded-md bg-brand px-4 py-2 font-medium text-white shadow-lg outline-none ring-2 ring-brand-light transition"
      >
        Skip to main content
      </a>

      <header
        ref={navContainerRef}
        className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${isDarkTop
          ? "bg-transparent border-b border-white/10"
          : "bg-surface/90 backdrop-blur-md shadow-xs border-b border-surface-alt/80"
          }`}
        style={{ height: "var(--nav-h, 5rem)" }}
      >
        <Container>
          <div
            ref={navInnerRef}
            className="flex h-20 items-center justify-between transition-[height] duration-300"
          >
            {/* 1. Brand Logo */}
            <Link
              href="/"
              className="group flex items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg"
              aria-label="GuruOm Dental - Home"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${isDarkTop ? "bg-white text-brand" : "bg-brand text-white shadow-xs"
                  }`}
              >
                {/* Stylized Tooth/Botanical Leaf SVG Icon */}
                <svg
                  className="h-6 w-6 transition-transform duration-300 group-hover:rotate-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2C8.5 2 6 4.5 6 8c0 3.2 1.3 5.4 2.1 7.2.7 1.6 1.4 3.3 1.9 5.8.2.8.9 1 1.5.8.7-.3.9-1.1.9-1.8 0-1.8-.4-3.5-.8-5.2-.2-.8.5-1.5 1.4-1.5s1.6.7 1.4 1.5c-.4 1.7-.8 3.4-.8 5.2 0 .7.2 1.5.9 1.8.6.2 1.3 0 1.5-.8.5-2.5 1.2-4.2 1.9-5.8.8-1.8 2.1-4 2.1-7.2 0-3.5-2.5-6-6-6z" />
                </svg>
              </div>
              <span
                className={`font-league-spartan text-xl sm:text-[22px] tracking-tight font-bold leading-none translate-y-[5px] transition-colors ${isDarkTop ? "text-white" : "text-brand"
                  }`}
              >
                {siteConfig.name}
              </span>
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
                className={`pointer-events-none absolute bottom-0 h-0.5 rounded-full transition-opacity duration-200 ${isDarkTop ? "bg-accent" : "bg-brand"
                  }`}
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
                    className={`group relative px-3 py-2 text-sm font-medium transition-colors rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand ${active ? activeColorClass : textColorClass
                      }`}
                  >
                    {/* Text-roll hover animation */}
                    <span className="relative inline-flex flex-col h-5 overflow-hidden">
                      <span className="transition-transform duration-300 ease-out group-hover:-translate-y-full">
                        {link.label}
                      </span>
                      <span
                        className={`absolute top-full left-0 transition-transform duration-300 ease-out group-hover:-translate-y-full ${isDarkTop ? "text-accent" : "text-brand"
                          }`}
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
                  className={`group flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand transition-colors ${isMegaOpen
                    ? isDarkTop
                      ? "text-white"
                      : "text-brand"
                    : textColorClass
                    }`}
                >
                  <span>Pages</span>
                  <svg
                    className={`h-4 w-4 transition-transform duration-300 ${isMegaOpen ? "rotate-180" : ""
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

                {/* Mega Menu Dropdown Panel */}
                {isMegaOpen && (
                  <div
                    id="desktop-mega-menu"
                    ref={megaPanelRef}
                    className="absolute top-full -left-48 mt-3 w-[720px] rounded-2xl bg-surface p-6 shadow-xl ring-1 ring-black/5 border border-surface-alt z-50 text-ink"
                    onMouseEnter={openMegaMenu}
                    onMouseLeave={scheduleCloseMegaMenu}
                  >
                    <div className="grid grid-cols-4 gap-6">
                      {/* 3 Link Groups */}
                      {megaMenuGroups.map((group) => (
                        <div key={group.title} className="mega-group flex flex-col gap-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                            {group.title}
                          </span>
                          <ul className="flex flex-col gap-2">
                            {group.items.map((item) => (
                              <li key={item.label}>
                                <Link
                                  href={item.href}
                                  onClick={() => setIsMegaOpen(false)}
                                  className="group/item block rounded-lg p-1.5 transition-colors hover:bg-surface-alt outline-none focus-visible:ring-2 focus-visible:ring-brand"
                                >
                                  <div className="text-sm font-semibold text-ink group-hover/item:text-brand transition-colors">
                                    {item.label}
                                  </div>
                                  <div className="text-[11px] text-ink-muted line-clamp-1 leading-snug">
                                    {item.description}
                                  </div>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}

                      {/* Mega Menu Promo Card */}
                      <div className="mega-promo flex flex-col justify-between rounded-xl bg-surface-alt p-4 border border-surface-alt/70">
                        <div className="flex flex-col gap-2">
                          <div className="overflow-hidden rounded-lg">
                            <SmartImage
                              slot="navPromo"
                              alt="Book your first visit consultation"
                              aspect="4/5"
                              className="rounded-lg object-cover"
                            />
                          </div>
                          <Badge variant="outline" size="sm" className="w-fit mt-1">
                            New Patients
                          </Badge>
                          <h4 className="font-display text-sm font-bold text-ink">
                            Book your first visit
                          </h4>
                          <p className="text-xs text-ink-muted leading-relaxed">
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
                className={`flex items-center gap-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-md ${isDarkTop ? "text-white/80 hover:text-white" : "text-ink/80 hover:text-brand"
                  }`}
              >
                <svg
                  className="h-4 w-4 text-brand"
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

              <MagneticWrap strength={0.25}>
                <Button href="/appointment" variant="primary" size="sm">
                  Book Appointment
                </Button>
              </MagneticWrap>
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
                className={`relative flex h-11 w-11 items-center justify-center rounded-xl p-2.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${isDarkTop && !isMobileOpen
                  ? "bg-white/10 text-white"
                  : "bg-surface-alt text-ink"
                  }`}
              >
                <div className="relative flex flex-col justify-between w-5 h-4">
                  <span
                    className={`h-0.5 w-full rounded-full bg-current transition-all duration-300 ${isMobileOpen ? "translate-y-[7px] rotate-45" : ""
                      }`}
                  />
                  <span
                    className={`h-0.5 w-full rounded-full bg-current transition-opacity duration-200 ${isMobileOpen ? "opacity-0" : "opacity-100"
                      }`}
                  />
                  <span
                    className={`h-0.5 w-full rounded-full bg-current transition-all duration-300 ${isMobileOpen ? "-translate-y-[7px] -rotate-45" : ""
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
          className="fixed inset-0 z-30 flex flex-col justify-between bg-brand-dark px-6 pt-24 pb-8 text-white lg:hidden overflow-y-auto"
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
                      className={`font-display text-3xl font-bold tracking-tight transition-colors hover:text-accent outline-none focus-visible:underline ${active ? "text-accent" : "text-white"
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
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/10 text-surface hover:bg-white/20 transition-colors"
              >
                All Services
              </Link>
              <Link
                href="/pricing"
                onClick={() => setIsMobileOpen(false)}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/10 text-surface hover:bg-white/20 transition-colors"
              >
                Pricing & Plans
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsMobileOpen(false)}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/10 text-surface hover:bg-white/20 transition-colors"
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
              <span className="text-xs text-surface-alt/70 mt-1">{siteConfig.address.full}</span>
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
