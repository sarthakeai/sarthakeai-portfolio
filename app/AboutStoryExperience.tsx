/* eslint-disable @next/next/no-img-element -- Reuses the site's approved, hand-optimized responsive About image assets. */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { aboutStoryBio, aboutStoryParagraphs } from "./about-content";

const storyColumns = [
  aboutStoryParagraphs.slice(0, 3),
  aboutStoryParagraphs.slice(3, 7),
  aboutStoryParagraphs.slice(7),
] as const;

export function AboutStoryExperience() {
  const [phase, setPhase] = useState<"closed" | "open" | "closing">("closed");
  const [mobilePhase, setMobilePhase] = useState<"closed" | "open" | "closing">("closed");
  const [mobileViewport, setMobileViewport] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const mobileStoryRef = useRef<HTMLElement>(null);
  const mobileCloseButtonRef = useRef<HTMLButtonElement>(null);

  const desktopOpen = phase !== "closed";
  const mobileOpen = mobilePhase !== "closed";
  const closeDesktopStory = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("closed");
      return;
    }
    setPhase((current) => current === "closed" ? current : "closing");
  }, []);

  const finishMobileClose = useCallback(() => {
    setMobilePhase("closed");
  }, []);

  const closeMobileStory = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finishMobileClose();
      return;
    }
    setMobilePhase((current) => current === "closed" ? current : "closing");
  }, [finishMobileClose]);

  const openStory = () => {
    if (window.matchMedia("(max-width: 47.9375rem)").matches) {
      setMobilePhase("open");
      return;
    }
    setPhase("open");
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setPortalReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 47.9375rem)");
    const syncViewport = (matches: boolean) => {
      setMobileViewport(matches);
      if (!matches) setMobilePhase("closed");
      if (matches) setPhase("closed");
    };
    syncViewport(query.matches);
    const onChange = (event: MediaQueryListEvent) => syncViewport(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const root = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - root.clientWidth;
    const previousRootOverflow = root.style.overflow;
    const previousRootScrollBehavior = root.style.scrollBehavior;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyWidth = body.style.width;
    const previousBodyPaddingRight = body.style.paddingRight;
    const returnFocus = triggerRef.current;

    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    const layoutFrame = window.requestAnimationFrame(() => {
      mobileStoryRef.current?.scrollTo({ top: 0, behavior: "auto" });
      mobileCloseButtonRef.current?.focus({ preventScroll: true });
    });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMobileStory();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = Array.from(
        mobileStoryRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      const first = focusable[0] ?? mobileCloseButtonRef.current;
      const last = focusable.at(-1) ?? mobileCloseButtonRef.current;
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
      window.cancelAnimationFrame(layoutFrame);
      document.removeEventListener("keydown", onKeyDown);
      root.style.overflow = previousRootOverflow;
      root.style.scrollBehavior = "auto";
      body.style.overflow = previousBodyOverflow;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.width = previousBodyWidth;
      body.style.paddingRight = previousBodyPaddingRight;
      window.scrollTo(0, scrollY);
      root.style.scrollBehavior = previousRootScrollBehavior;
      returnFocus?.focus({ preventScroll: true });
    };
  }, [closeMobileStory, mobileOpen]);

  useEffect(() => {
    if (!desktopOpen) return;

    const root = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - root.clientWidth;
    const previousRootOverflow = root.style.overflow;
    const previousRootScrollBehavior = root.style.scrollBehavior;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyWidth = body.style.width;
    const previousBodyPaddingRight = body.style.paddingRight;
    const returnFocus = triggerRef.current;

    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDesktopStory();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      const first = focusable[0];
      const last = focusable.at(-1);
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
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown);
      root.style.overflow = previousRootOverflow;
      root.style.scrollBehavior = "auto";
      body.style.overflow = previousBodyOverflow;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.width = previousBodyWidth;
      body.style.paddingRight = previousBodyPaddingRight;
      window.scrollTo(0, scrollY);
      root.style.scrollBehavior = previousRootScrollBehavior;
      returnFocus?.focus({ preventScroll: true });
    };
  }, [closeDesktopStory, desktopOpen]);

  const storyDialog = (
    <div
      className="about-story-overlay editorial-overlay"
      data-state={phase}
      role="presentation"
      aria-hidden={phase !== "open"}
      inert={phase !== "open" ? true : undefined}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && event.propertyName === "opacity" && phase === "closing") setPhase("closed");
      }}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) closeDesktopStory();
      }}
    >
      <div
        ref={dialogRef}
        className="about-story-dialog editorial-panel"
        id="about-story-dialog"
        role="dialog"
        aria-modal={phase === "open" ? "true" : undefined}
        aria-labelledby="about-story-title"
        aria-describedby="about-story-description"
      >
        <header className="about-story-head">
          <h2 id="about-story-title">My story</h2>
          <button ref={closeButtonRef} className="editorial-close" type="button" onClick={closeDesktopStory} aria-label="Close my story">
            <span>Close</span><i aria-hidden="true">[X]</i>
          </button>
        </header>
        <div className="about-story-body">
          <figure className="about-story-portrait">
            <img
              src="/sarthak-about-960.webp"
              srcSet="/sarthak-about-960.webp 960w, /sarthak-about-1600.webp 1600w"
              sizes="(max-width: 50rem) calc(100vw - 3rem), 24vw"
              alt="Sarthak beside his motorcycle in the mountains"
              width="1600"
              height="2132"
              loading="eager"
              decoding="async"
            />
          </figure>
          <div className="about-story-columns" id="about-story-description">
            {storyColumns.map((paragraphs, columnIndex) => (
              <div key={columnIndex}>
                {columnIndex === 0 ? <p className="about-story-intro"><strong>{aboutStoryBio.name}</strong>{aboutStoryBio.details}</p> : null}
                {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const mobileStory = (
    <div
      className="about-story-mobile-overlay editorial-overlay"
      data-state={mobilePhase}
      role="presentation"
      aria-hidden={mobilePhase !== "open"}
      inert={mobilePhase !== "open" ? true : undefined}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && event.propertyName === "opacity" && mobilePhase === "closing") finishMobileClose();
      }}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) closeMobileStory();
      }}
    >
      <section ref={mobileStoryRef} className="about-story-mobile editorial-panel" id="about-story-mobile" role="dialog" aria-modal={mobilePhase === "open" ? "true" : undefined} aria-labelledby="about-story-mobile-title">
        <header className="about-story-mobile-head">
          <h2 id="about-story-mobile-title">My story</h2>
          <button ref={mobileCloseButtonRef} className="editorial-close" type="button" onClick={closeMobileStory} aria-label="Close my story">
            <span>Close</span><i aria-hidden="true">[X]</i>
          </button>
        </header>
        <div className="about-story-mobile-body">
          <figure className="about-story-mobile-portrait">
            <img
              src="/sarthak-about-960.webp"
              srcSet="/sarthak-about-960.webp 960w, /sarthak-about-1600.webp 1600w"
              sizes="calc(100vw - (2 * var(--page-gutter)))"
              alt="Sarthak beside his motorcycle in the mountains"
              width="1600"
              height="2132"
              loading="eager"
              decoding="async"
            />
          </figure>
          <article className="about-story-mobile-copy">
            <p className="about-story-mobile-intro"><strong>{aboutStoryBio.name}</strong>{aboutStoryBio.details}</p>
            {aboutStoryParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </article>
        </div>
      </section>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        className="about-story-trigger"
        type="button"
        aria-expanded={desktopOpen || mobileOpen}
        aria-controls={mobileViewport ? "about-story-mobile" : "about-story-dialog"}
        onClick={openStory}
      >
        Read my story <span aria-hidden="true">↗</span>
      </button>
      {portalReady ? createPortal(mobileStory, document.body) : null}
      {portalReady ? createPortal(storyDialog, document.body) : null}
    </>
  );
}
