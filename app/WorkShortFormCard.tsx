"use client";

/* eslint-disable @next/next/no-img-element -- Reuses optimized portfolio poster assets. */

import { useCallback, useRef, useState } from "react";
import type { CaseStudy } from "./case-study-data";
import { ShortFormProjectViewer } from "./ShortFormProjectViewer";
import { shortFormProjectCopy } from "./portfolio-data";

export function WorkShortFormCard({ study }: { study: CaseStudy }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const closeViewer = useCallback(() => setViewerOpen(false), []);
  const displayTitle = shortFormProjectCopy.title;
  const displayDescription = shortFormProjectCopy.description;

  return (
    <>
      <article className="work-index-card">
        <a className="work-index-media" href={`/work/${study.slug}`} aria-label={`View ${displayTitle}`} onClick={(event) => { event.preventDefault(); triggerRef.current = event.currentTarget; setViewerOpen(true); }}>
          <div className="project-preview project-preview-triptych work-index-short-form-preview" aria-hidden="true">
            {study.media.slice(0, 3).map((item) => (
              <figure key={item.id}>
                <img src={item.poster} alt="" width={item.width} height={item.height} loading="lazy" decoding="async" />
              </figure>
            ))}
          </div>
          <span>View project <b aria-hidden="true">↗</b></span>
        </a>
        <div className="project-info">
          <div className="project-copy">
            <h2><a href={`/work/${study.slug}`} onClick={(event) => { event.preventDefault(); triggerRef.current = event.currentTarget; setViewerOpen(true); }}>{displayTitle}</a></h2>
            <p>{displayDescription}</p>
          </div>
        </div>
      </article>
      <ShortFormProjectViewer open={viewerOpen} onClose={closeViewer} onRestoreFocus={() => triggerRef.current?.focus()} />
    </>
  );
}
