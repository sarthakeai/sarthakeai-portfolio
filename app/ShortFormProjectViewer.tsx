"use client";

import { useEffect, useRef } from "react";
import { caseStudies } from "./case-study-data";
import { CaseStudyMedia } from "./CaseStudyMedia";
import { stopAllMedia, stopMediaWithin } from "./media-playback";
import { lockDocumentScroll } from "./document-scroll-lock";

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

    const dialog = dialogRef.current;
    const unlockDocumentScroll = lockDocumentScroll();
    if (dialog) {
      dialog.scrollTop = 0;
      dialog.scrollLeft = 0;
    }

    const focusableElements = () => Array.from(dialog?.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), video[controls], [tabindex]:not([tabindex='-1'])") ?? [])
      .filter((element) => element.getClientRects().length > 0);
    let layoutFrame = 0;
    const initialFrame = requestAnimationFrame(() => {
      layoutFrame = requestAnimationFrame(() => {
        if (!dialog) return;

        dialog.scrollLeft = 0;
        if (window.matchMedia("(max-width: 42rem)").matches) {
          dialog.scrollTop = 0;
          closeButtonRef.current?.focus({ preventScroll: true });
          return;
        }

        dialog.scrollTop = 0;
        closeButtonRef.current?.focus({ preventScroll: true });
      });
    });

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
      unlockDocumentScroll();
      cancelAnimationFrame(initialFrame);
      cancelAnimationFrame(layoutFrame);
      document.removeEventListener("keydown", onKeyDown);
      onRestoreFocus?.();
    };
  }, [onClose, onRestoreFocus, open]);

  if (!open || !shortFormStudy) return null;

  return (
    <div className="video-modal video-modal-short-form short-form-project-viewer" role="dialog" aria-modal="true" aria-label="Short-form project viewer" aria-describedby="short-form-viewer-description" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={dialogRef} className="video-modal-inner">
        <div className="video-modal-head">
          <div>
            <div className="short-form-viewer-desktop-copy">
              <h2>{shortFormStudy.title}</h2>
              <p className="short-form-viewer-description" id="short-form-viewer-description">{shortFormStudy.description}</p>
              <dl className="short-form-viewer-meta" aria-label="Short-form project details">
                <div><dt>Clients</dt><dd>{shortFormStudy.client}</dd></div>
                <div><dt>Project type</dt><dd>{shortFormStudy.category}</dd></div>
                {shortFormStudy.platforms ? <div><dt>Platforms</dt><dd>{shortFormStudy.platforms.join(" · ")}</dd></div> : null}
              </dl>
            </div>
            <div className="short-form-viewer-mobile-copy">
              <p className="project-eyebrow">Swan &amp; Roxom</p>
              <h2>Vertical edits</h2>
            </div>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close Short-form project">Close</button>
        </div>
        <div className="case-study-details">
          <div>
            <div className="case-study-role-header">
              <p className="project-label">My role</p>
            </div>
            <ul className="case-study-roles" aria-label={`Roles for ${shortFormStudy.title}`}>{shortFormStudy.roles.map((role) => <li key={role}>{role}</li>)}</ul>
          </div>
          <p className="short-form-viewer-supporting-copy">{shortFormStudy.supportingCopy}</p>
        </div>
        <CaseStudyMedia media={shortFormStudy.media} projectTitle={shortFormStudy.title} portrait showCenterPlay />
        <a className="case-study-next short-form-viewer-next" href="/work/21st-capital-introduction"><span className="project-label">Next project</span><strong>21st Capital introduction</strong><i aria-hidden="true">↗</i></a>
      </div>
    </div>
  );
}
