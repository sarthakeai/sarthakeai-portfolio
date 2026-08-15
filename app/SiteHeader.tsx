"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { BookingTrigger } from "./BookingExperience";
import { availability } from "./portfolio-data";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#services", label: "What I do" },
  { href: "#youtube", label: "YouTube" },
];

const mobileLinks = [...links, { href: "#contact", label: "Let’s talk" }];

const mobileSocials = [
  { href: "https://www.instagram.com/sarthak.eai", label: "Instagram" },
  { href: "https://x.com/sarthakeai", label: "X / Twitter" },
  { href: "https://www.youtube.com/@sarthakeai", label: "YouTube" },
];

const delhiTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function getAvailabilityLabel(slots: number) {
  return `${slots} ${slots === 1 ? "slot" : "slots"} available`;
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedHref, setSelectedHref] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [delhiTime, setDelhiTime] = useState("--:--:--");
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const scrollTimerRef = useRef<number | null>(null);
  const availabilityLabel = getAvailabilityLabel(availability.slots);

  useEffect(() => {
    const updateClock = () => setDelhiTime(delhiTimeFormatter.format(new Date()));
    updateClock();
    const interval = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 50rem)");
    const sync = () => {
      setIsMobile(media.matches);
      if (!media.matches) setMenuOpen(false);
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > 20));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen || !isMobile) return;
    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousTouchAction = body.style.touchAction;
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";

    const focusables = () => Array.from(headerRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []).filter((element) => element.offsetParent !== null);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      const first = items[0];
      const last = items.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.touchAction = previousTouchAction;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMobile, menuOpen]);

  useEffect(() => () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    if (scrollTimerRef.current !== null) window.clearTimeout(scrollTimerRef.current);
  }, []);

  const clearNavigationTimers = () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    if (scrollTimerRef.current !== null) window.clearTimeout(scrollTimerRef.current);
    closeTimerRef.current = null;
    scrollTimerRef.current = null;
  };

  const closeMenu = () => {
    clearNavigationTimers();
    setSelectedHref(null);
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    clearNavigationTimers();
    setSelectedHref(null);
    setMenuOpen((open) => !open);
  };

  const navigateFromMenu = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    if (selectedHref !== null) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setSelectedHref(href);

    closeTimerRef.current = window.setTimeout(() => {
      setMenuOpen(false);
      closeTimerRef.current = null;
    }, reducedMotion ? 0 : 80);

    scrollTimerRef.current = window.setTimeout(() => {
      const destination = document.querySelector<HTMLElement>(href);
      if (destination) {
        if (window.location.hash !== href) window.history.pushState(null, "", href);
        destination.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      }
      setSelectedHref(null);
      scrollTimerRef.current = null;
    }, reducedMotion ? 0 : 320);
  };

  return (
    <header ref={headerRef} className={`site-header${scrolled ? " is-scrolled" : ""}${menuOpen ? " menu-open" : ""}`}>
      <a className="brand" href="#top" aria-label="Sarthak, home" onClick={closeMenu}>
        <span className="brand-signature brand-logo-only" aria-hidden="true" />
      </a>
      <div className="header-location" aria-label={`New Delhi local time ${delhiTime}`}>
        <span>New Delhi</span><i aria-hidden="true">──</i><time>{delhiTime}</time>
      </div>
      <nav className="nav nav-desktop" aria-label="Primary navigation" aria-hidden={isMobile ? true : undefined} inert={isMobile ? true : undefined}>
        {links.map((link) => <a key={link.href} href={link.href} onClick={closeMenu}>{link.label}</a>)}
        <BookingTrigger className="nav-cta availability-cta" aria-label={`${availabilityLabel}. Book a call with Sarthak`}>
          <i className="availability-dot" aria-hidden="true" />
          <span>{availabilityLabel}</span>
        </BookingTrigger>
      </nav>
      <nav ref={navRef} id="primary-navigation" className="mobile-nav" aria-label="Mobile navigation" aria-hidden={!isMobile || !menuOpen} inert={!isMobile || !menuOpen ? true : undefined}>
        <span className="mobile-nav-label">Menu</span>
        <div className="mobile-nav-list">
          {mobileLinks.map((link, index) => (
            <a className={`mobile-nav-item${link.href === "#contact" ? " mobile-nav-cta" : ""}${selectedHref === link.href ? " is-selected" : ""}`} key={link.href} href={link.href} onClick={(event) => navigateFromMenu(event, link.href)}>
              <span className="mobile-nav-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="mobile-nav-text">{link.label}</span>
              <span className="mobile-nav-arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
        <div className="mobile-nav-spacer" aria-hidden="true" />
        <div className="mobile-nav-utility">
          <div className="mobile-nav-utility-head">
            <span>Elsewhere</span>
            <BookingTrigger className="mobile-availability" aria-label={`${availabilityLabel}. Book a call with Sarthak`}><i aria-hidden="true" />{availabilityLabel}</BookingTrigger>
          </div>
          <div className="mobile-local-time" aria-label={`New Delhi local time ${delhiTime}`}><span>New Delhi</span><span>Local time <time>{delhiTime}</time></span></div>
          <div className="mobile-nav-socials">
            {mobileSocials.map((social) => <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer">{social.label}<span aria-hidden="true">↗</span></a>)}
          </div>
        </div>
      </nav>
      <div className="header-actions">
        <ThemeToggle />
        <button ref={menuButtonRef} className="menu" type="button" onClick={toggleMenu} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="primary-navigation">
          <span /><span />
        </button>
      </div>
    </header>
  );
}
