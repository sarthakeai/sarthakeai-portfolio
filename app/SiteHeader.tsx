"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#services", label: "What I do" },
  { href: "#youtube", label: "YouTube" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 50rem)");
    const sync = () => setIsMobile(media.matches);
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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isMobile, menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header ref={headerRef} className={`site-header${scrolled ? " is-scrolled" : ""}${menuOpen ? " menu-open" : ""}`}>
      <a className="brand" href="#top" aria-label="Sarthak Sharma, home" onClick={closeMenu}>
        <span className="brand-mark"><Image src="/eai-mark.png" alt="" width={256} height={256} priority /></span>
        <span>Sarthak Sharma</span>
      </a>
      <nav id="primary-navigation" className="nav" aria-label="Primary navigation" aria-hidden={isMobile && !menuOpen} inert={isMobile && !menuOpen ? true : undefined}>
        {links.map((link) => <a key={link.href} href={link.href} onClick={closeMenu}>{link.label}</a>)}
        <a className="nav-cta" href="#contact" onClick={closeMenu}>Let’s talk <span aria-hidden="true">↗</span></a>
      </nav>
      <div className="header-actions">
        <ThemeToggle />
        <button ref={menuButtonRef} className="menu" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="primary-navigation">
          <span /><span />
        </button>
      </div>
    </header>
  );
}
