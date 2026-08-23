"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Briefcase } from "@phosphor-icons/react/dist/csr/Briefcase";
import { InstagramLogo } from "@phosphor-icons/react/dist/csr/InstagramLogo";
import { XLogo } from "@phosphor-icons/react/dist/csr/XLogo";
import { YoutubeLogo } from "@phosphor-icons/react/dist/csr/YoutubeLogo";
import { BookingTrigger, CALENDLY_BOOKING_COMPLETE_EVENT } from "./BookingExperience";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/#services", label: "What I do" },
  { href: "/#youtube", label: "YouTube" },
];

const mobileLinks = [...links, { href: "/#contact", label: "Connect" }];

const mobileSocials = [
  { href: "https://www.instagram.com/sarthak.eai", label: "Instagram", icon: InstagramLogo },
  { href: "https://x.com/sarthakeai", label: "X", icon: XLogo },
  { href: "https://www.youtube.com/@sarthakeai", label: "YouTube", icon: YoutubeLogo },
  { href: "https://www.upwork.com/freelancers/~01a047caaf8c8ed5b6", label: "Upwork", icon: Briefcase },
];

const delhiTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

type AvailabilityState =
  | { status: "loading"; slots: null }
  | { status: "ready"; slots: number }
  | { status: "error"; slots: null };

function getAvailabilityLabel(availability: AvailabilityState) {
  if (availability.status === "loading") return "Checking availability";
  if (availability.status === "error") return "View availability";
  if (availability.slots === 0) return "Today’s slots filled";
  return `${availability.slots} ${availability.slots === 1 ? "slot" : "slots"} left today`;
}

function getVisitorTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedHref, setSelectedHref] = useState<string | null>(null);
  const [pendingMobileNavigation, setPendingMobileNavigation] = useState<{ hash: string; reducedMotion: boolean } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [delhiTime, setDelhiTime] = useState("--:--:--");
  const [availability, setAvailability] = useState<AvailabilityState>({ status: "loading", slots: null });
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const scrollTimerRef = useRef<number | null>(null);
  const navigationFrameRef = useRef<number | null>(null);
  const availabilityLabel = getAvailabilityLabel(availability);

  const refreshAvailability = useCallback(async (forceRefresh = false) => {
    setAvailability({ status: "loading", slots: null });

    try {
      const query = new URLSearchParams({ timeZone: getVisitorTimeZone() });
      if (forceRefresh) query.set("refresh", "1");
      const response = await fetch(`/api/calendly-availability?${query}`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Calendly availability request failed");

      const payload = await response.json() as { availableSlots?: unknown };
      if (!Number.isInteger(payload.availableSlots) || Number(payload.availableSlots) < 0) {
        throw new Error("Calendly availability response was invalid");
      }

      setAvailability({ status: "ready", slots: Number(payload.availableSlots) });
    } catch {
      setAvailability({ status: "error", slots: null });
    }
  }, []);

  useEffect(() => {
    const initialRequestFrame = window.requestAnimationFrame(() => void refreshAvailability());

    const handleBookingComplete = () => void refreshAvailability(true);
    window.addEventListener(CALENDLY_BOOKING_COMPLETE_EVENT, handleBookingComplete);
    return () => {
      window.cancelAnimationFrame(initialRequestFrame);
      window.removeEventListener(CALENDLY_BOOKING_COMPLETE_EVENT, handleBookingComplete);
    };
  }, [refreshAvailability]);

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

  useEffect(() => {
    if (menuOpen || !pendingMobileNavigation || pathname !== "/") return;

    navigationFrameRef.current = window.requestAnimationFrame(() => {
      navigationFrameRef.current = window.requestAnimationFrame(() => {
        const destination = document.querySelector<HTMLElement>(pendingMobileNavigation.hash);
        if (destination) {
          if (window.location.hash !== pendingMobileNavigation.hash) window.history.pushState(null, "", pendingMobileNavigation.hash);
          destination.scrollIntoView({ behavior: pendingMobileNavigation.reducedMotion ? "auto" : "smooth", block: "start" });
        }

        navigationFrameRef.current = null;
        setPendingMobileNavigation(null);
        setSelectedHref(null);
      });
    });

    return () => {
      if (navigationFrameRef.current !== null) window.cancelAnimationFrame(navigationFrameRef.current);
      navigationFrameRef.current = null;
    };
  }, [menuOpen, pathname, pendingMobileNavigation]);

  useEffect(() => () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    if (scrollTimerRef.current !== null) window.clearTimeout(scrollTimerRef.current);
    if (navigationFrameRef.current !== null) window.cancelAnimationFrame(navigationFrameRef.current);
  }, []);

  const clearNavigationTimers = () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    if (scrollTimerRef.current !== null) window.clearTimeout(scrollTimerRef.current);
    if (navigationFrameRef.current !== null) window.cancelAnimationFrame(navigationFrameRef.current);
    closeTimerRef.current = null;
    scrollTimerRef.current = null;
    navigationFrameRef.current = null;
    setPendingMobileNavigation(null);
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

  const navigateFromHeader = () => {
    closeMenu();
  };

  const navigateFromMenu = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    if (selectedHref !== null) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    clearNavigationTimers();
    setSelectedHref(href);

    if (href === "/#services") {
      setPendingMobileNavigation({ hash: "#services", reducedMotion });
      setMenuOpen(false);
      if (pathname !== "/") router.push("/#services", { scroll: false });
      return;
    }

    closeTimerRef.current = window.setTimeout(() => {
      setMenuOpen(false);
      closeTimerRef.current = null;
    }, reducedMotion ? 0 : 80);

    scrollTimerRef.current = window.setTimeout(() => {
      const isHomepageAnchor = href.startsWith("/#");
      if (!isHomepageAnchor || window.location.pathname !== "/") {
        window.location.assign(href);
        return;
      }
      const hash = href.slice(1);
      const destination = document.querySelector<HTMLElement>(hash);
      if (destination) {
        if (window.location.hash !== hash) window.history.pushState(null, "", hash);
        destination.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      }
      setSelectedHref(null);
      scrollTimerRef.current = null;
    }, reducedMotion ? 0 : 320);
  };

  return (
    <header ref={headerRef} className={`site-header${scrolled ? " is-scrolled" : ""}${menuOpen ? " menu-open" : ""}`}>
      <div className="site-header-inner">
      <Link className="brand" href="/" aria-label="Sarthak, home" onClick={closeMenu}>
        <span className="brand-signature brand-logo-only" aria-hidden="true" />
      </Link>
      <div className="header-location" aria-label={`New Delhi local time ${delhiTime}`}>
        <span>New Delhi · <time>{delhiTime}</time></span>
      </div>
      <nav className="nav nav-desktop" aria-label="Primary navigation" aria-hidden={isMobile ? true : undefined} inert={isMobile ? true : undefined}>
        {links.map((link) => <a key={link.href} href={link.href} onClick={(event) => navigateFromHeader(event, link.href)}>{link.label}</a>)}
        <BookingTrigger className="nav-cta availability-cta" aria-label={`${availabilityLabel}. Book a call with Sarthak`}>
          <i className="availability-dot" aria-hidden="true" />
          <span>{availabilityLabel}</span>
        </BookingTrigger>
      </nav>
      <nav ref={navRef} id="primary-navigation" className="mobile-nav" aria-label="Mobile navigation" aria-hidden={!isMobile || !menuOpen} inert={!isMobile || !menuOpen ? true : undefined}>
        <span className="mobile-nav-label">Menu</span>
        <div className="mobile-nav-list">
          {mobileLinks.map((link, index) => (
            <a className={`mobile-nav-item${link.href === "/#contact" ? " mobile-nav-cta" : ""}${selectedHref === link.href ? " is-selected" : ""}`} key={link.href} href={link.href} onClick={(event) => navigateFromMenu(event, link.href)}>
              <span className="mobile-nav-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="mobile-nav-text">{link.label}</span>
              <span className="mobile-nav-arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
        <div className="mobile-nav-spacer" aria-hidden="true" />
        <div className="mobile-nav-utility">
          <div className="mobile-local-time" aria-label={`New Delhi local time ${delhiTime}`}>New Delhi · <time>{delhiTime}</time></div>
          <BookingTrigger className="mobile-availability" aria-label={`${availabilityLabel}. Book a call with Sarthak`}><i aria-hidden="true" /><span>{availabilityLabel}</span></BookingTrigger>
          <div className="mobile-nav-socials">
            {mobileSocials.map((social) => {
              const SocialIcon = social.icon;
              return <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={`${social.label}, opens in a new tab`}><SocialIcon aria-hidden="true" weight="regular" /></a>;
            })}
          </div>
        </div>
      </nav>
      <div className="header-actions">
        <ThemeToggle />
        <button ref={menuButtonRef} className="menu" type="button" onClick={toggleMenu} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="primary-navigation">
          <span /><span />
        </button>
      </div>
      </div>
    </header>
  );
}
