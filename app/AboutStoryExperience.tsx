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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const open = phase !== "closed";
  const closeStory = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("closed");
      return;
    }
    setPhase((current) => current === "closed" ? current : "closing");
  }, []);

  useEffect(() => {
    if (!open) return;

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
        closeStory();
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
  }, [closeStory, open]);

  const storyDialog = open ? (
    <div
      className="about-story-overlay"
      data-state={phase}
      role="presentation"
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget && phase === "closing") setPhase("closed");
      }}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) closeStory();
      }}
    >
      <div
        ref={dialogRef}
        className="about-story-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-story-title"
        aria-describedby="about-story-description"
      >
        <header className="about-story-head">
          <h2 id="about-story-title">My story</h2>
          <button ref={closeButtonRef} type="button" onClick={closeStory} aria-label="Close my story">
            Close <span aria-hidden="true">[X]</span>
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
  ) : null;

  return (
    <>
      <button ref={triggerRef} className="button button-primary about-story-trigger" type="button" onClick={() => setPhase("open")}>
        Read my story <span aria-hidden="true">↗</span>
      </button>
      {storyDialog && typeof document !== "undefined" ? createPortal(storyDialog, document.body) : null}
    </>
  );
}
