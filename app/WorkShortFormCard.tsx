"use client";

/* eslint-disable @next/next/no-img-element -- Reuses optimized portfolio poster assets. */

import { useCallback, useRef, useState } from "react";
import type { CaseStudy } from "./case-study-data";
import { ShortFormProjectViewer } from "./ShortFormProjectViewer";

export function WorkShortFormCard({ study }: { study: CaseStudy }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const closeViewer = useCallback(() => setViewerOpen(false), []);

  return (
    <>
      <article className="work-index-card">
        <a ref={triggerRef} className="work-index-media" href={`/work/${study.slug}`} aria-label={`View ${study.title}`} onClick={(event) => { event.preventDefault(); setViewerOpen(true); }}>
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
            <div className="project-eyebrow"><span>{study.eyebrow}</span></div>
            <h2><a href={`/work/${study.slug}`}>{study.title}</a></h2>
            <p>{study.description}</p>
          </div>
        </div>
      </article>
      <ShortFormProjectViewer open={viewerOpen} onClose={closeViewer} onRestoreFocus={() => triggerRef.current?.focus()} />
    </>
  );
}
