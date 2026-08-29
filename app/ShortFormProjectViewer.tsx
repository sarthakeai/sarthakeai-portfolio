"use client";

import { useEffect, useRef } from "react";
import { caseStudies } from "./case-study-data";
import { CaseStudyMedia } from "./CaseStudyMedia";
import { stopAllMedia, stopMediaWithin } from "./media-playback";

const shortFormStudy = caseStudies.find((study) => study.slug === "short-form-video");

export function ShortFormProjectViewer({
  open,
  onClose,
  onRestoreFocus,
}: {
  open: boolean;
  onClose: () => void;
  onRestoreFocus?: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const dialog = dialogRef.current;
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";

    const focusableElements = () => Array.from(dialog?.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), video[controls], [tabindex]:not([tabindex='-1'])") ?? []);
    requestAnimationFrame(() => closeButtonRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusableElements();
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
      stopMediaWithin(dialog);
      stopAllMedia();
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      document.removeEventListener("keydown", onKeyDown);
      onRestoreFocus?.();
    };
  }, [onClose, onRestoreFocus, open]);

  if (!open || !shortFormStudy) return null;

  return (
    <div className="video-modal video-modal-short-form short-form-project-viewer" role="dialog" aria-modal="true" aria-labelledby="short-form-viewer-title" aria-describedby="short-form-viewer-description" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={dialogRef} className="video-modal-inner">
        <div className="video-modal-head">
          <div>
            <h2 id="short-form-viewer-title">{shortFormStudy.title}</h2>
            <p className="short-form-viewer-description" id="short-form-viewer-description">{shortFormStudy.description}</p>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close Short-form project">Close</button>
        </div>
        <div className="case-study-details">
          <div>
            <p className="project-label">My role</p>
            <ul className="case-study-roles" aria-label={`Roles for ${shortFormStudy.title}`}>{shortFormStudy.roles.map((role) => <li key={role}>{role}</li>)}</ul>
          </div>
        </div>
        <CaseStudyMedia media={shortFormStudy.media} projectTitle={shortFormStudy.title} portrait showCenterPlay />
      </div>
    </div>
  );
}
