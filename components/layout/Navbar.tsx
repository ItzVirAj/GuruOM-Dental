"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDown, Menu, Phone, X } from "lucide-react";
import { siteConfig, navLinks, megaMenuGroups } from "@/data/site";

export interface NavbarProps {
  variant?: "transparent-light" | "solid";
}

const phoneHref = `tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`;
const primaryLinks = navLinks.filter(link => link.href !== "/contact");

function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" className="clinic-nav-brand" aria-label="GuruOm Dental home" onClick={onClick}>
      <span>{siteConfig.name}</span>
    </Link>
  );
}

function DirectoryLinks({ onNavigate }: { onNavigate: () => void }) {
  return megaMenuGroups.map(group => (
    <div className="clinic-nav-group" key={group.title}>
      <h3>{group.title === "Main" ? "Clinic" : group.title === "Utility" ? "Site information" : group.title}</h3>
      <ul>{group.items.map(item => (
        <li key={item.href}><Link href={item.href} onClick={onNavigate}>{item.label}</Link></li>
      ))}</ul>
    </div>
  ));
}

export function Navbar(props: NavbarProps) {
  const pathname = usePathname();
  // Remount the navigation state on route changes, including browser back and forward.
  return <Navigation key={pathname} pathname={pathname} variant={props.variant} />;
}

function Navigation({ pathname, variant }: NavbarProps & { pathname: string }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const moreRef = useRef<HTMLButtonElement>(null);
  const directoryRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mobileButton = useRef<HTMLButtonElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function closeMore() {
    clearTimeout(hoverTimer.current);
    setMoreOpen(false);
  }
  function closeMobile() {
    dialogRef.current?.close();
  }
  function current(href: string) {
    return pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
  }

  useEffect(() => {
    const breakpoint = window.matchMedia("(min-width: 1024px)");
    const reset = () => { closeMore(); closeMobile(); };
    breakpoint.addEventListener("change", reset);
    return () => { breakpoint.removeEventListener("change", reset); clearTimeout(hoverTimer.current); };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [mobileOpen]);

  useEffect(() => {
    if (!moreOpen) return;
    function dismiss(event: PointerEvent | FocusEvent) {
      if (event.target instanceof Node && !directoryRef.current?.contains(event.target)) closeMore();
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") { closeMore(); moreRef.current?.focus(); }
    }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("focusin", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("focusin", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [moreOpen]);

  return (
    <>
      <a href="#main-content" className="clinic-nav-skip">Skip to main content</a>
      <header className="clinic-nav" data-variant={variant}>
        <div className="clinic-nav-inner">
          <Brand onClick={closeMore} />
          <nav className="clinic-nav-links" aria-label="Primary navigation">
            {primaryLinks.map(link => (
              <Link key={link.href} href={link.href} aria-current={current(link.href) ? "page" : undefined}>{link.label}</Link>
            ))}
            <div ref={directoryRef} className="clinic-nav-disclosure"
              onPointerEnter={event => {
                clearTimeout(hoverTimer.current);
                if (event.pointerType === "mouse") hoverTimer.current = setTimeout(() => setMoreOpen(true), 180);
              }}
              onPointerLeave={() => {
                clearTimeout(hoverTimer.current);
                if (!directoryRef.current?.contains(document.activeElement)) hoverTimer.current = setTimeout(closeMore, 180);
              }}>
              <button ref={moreRef} type="button" aria-expanded={moreOpen} aria-controls="desktop-site-directory"
                onClick={() => { clearTimeout(hoverTimer.current); setMoreOpen(value => !value); }}>
                More <ChevronDown size={15} aria-hidden="true" />
              </button>
              <div id="desktop-site-directory" hidden={!moreOpen} className="clinic-nav-directory" data-lenis-prevent>
                <div className="clinic-nav-directory-inner"><DirectoryLinks onNavigate={closeMore} /></div>
              </div>
            </div>
          </nav>
          <div className="clinic-nav-actions">
            <a className="clinic-nav-phone" href={phoneHref} aria-label={`Call the front desk at ${siteConfig.phone}`}>
              <Phone size={17} aria-hidden="true" /><span>{siteConfig.phone}</span>
            </a>
            <Link className="clinic-nav-contact" href="/contact" aria-current={current("/contact") ? "page" : undefined}>
              Contact the clinic <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
            <button ref={mobileButton} type="button" className="clinic-nav-menu" aria-haspopup="dialog"
              aria-expanded={mobileOpen} aria-controls="mobile-navigation-menu"
              onClick={() => { dialogRef.current?.showModal(); setMobileOpen(true); }}>
              <Menu size={21} aria-hidden="true" /> Menu
            </button>
          </div>
        </div>
      </header>
      <dialog ref={dialogRef} id="mobile-navigation-menu" className="clinic-nav-sheet" aria-label="Site navigation" data-lenis-prevent
        onClose={() => { setMobileOpen(false); mobileButton.current?.focus(); }}>
        {mobileOpen && <>
          <div className="clinic-nav-sheet-head">
            <Brand onClick={closeMobile} />
            <button type="button" className="clinic-nav-menu" onClick={closeMobile}>Close <X size={20} aria-hidden="true" /></button>
          </div>
          <nav aria-label="Mobile navigation" className="clinic-nav-sheet-body">
            {primaryLinks.map(link => <Link key={link.href} href={link.href} onClick={closeMobile}
              aria-current={current(link.href) ? "page" : undefined}>{link.label}</Link>)}
            <details>
              <summary>More pages <ChevronDown size={20} aria-hidden="true" /></summary>
              <div className="clinic-nav-sheet-directory"><DirectoryLinks onNavigate={closeMobile} /></div>
            </details>
          </nav>
          <div className="clinic-nav-desk">
            <h2>Front desk</h2>
            <a href={phoneHref}><Phone size={17} aria-hidden="true" /> {siteConfig.phone}</a>
            <p>{siteConfig.address.full}</p>
            <Link href="/contact" onClick={closeMobile} className="clinic-nav-contact">Contact the clinic <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>
        </>}
      </dialog>
    </>
  );
}

export default Navbar;
