"use client";

/* eslint-disable @next/next/no-img-element -- Static WebP posters are pre-sized and optimized for this project. */
/* eslint-disable jsx-a11y/media-has-caption -- Supplied portfolio previews use their source/open captions; separate timed-text files were not provided. */

import { useEffect, useRef, useState } from "react";
import { categories, projects, type Project, type ProjectMedia } from "./portfolio-data";

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => void;
};

function PortfolioVideo({ media, projectLabel, ratio }: { media: ProjectMedia; projectLabel: string; ratio: Project["ratio"] }) {
  const [started, setStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!started) return;
    void videoRef.current?.play().catch(() => undefined);
  }, [started]);

  if (media.externalUrl) {
    return (
      <a className={`video-modal-external video-modal-external-${ratio}`} href={media.externalUrl} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${media.title} — ${projectLabel}, opens in a new tab`}>
        <img src={media.poster} alt={`${media.title} — ${projectLabel}`} width={media.width} height={media.height} loading="lazy" decoding="async" />
        <span>Watch project <b aria-hidden="true">↗</b></span>
      </a>
    );
  }

  if (!media.videoUrl) {
    return <img className="video-modal-still" src={media.poster} alt={`${media.title} — ${projectLabel}`} width={media.width} height={media.height} loading="lazy" decoding="async" />;
  }

  if (!started) {
    return (
      <div className={`video-modal-poster video-modal-poster-${ratio}`}>
        <img src={media.poster} alt="" width={media.width} height={media.height} loading="lazy" decoding="async" />
        <button type="button" onClick={() => setStarted(true)} aria-label={`Play ${media.title} — ${projectLabel}`}>
          <span aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <video ref={videoRef} controls playsInline preload="none" poster={media.poster} aria-label={`${media.title} — ${projectLabel}`}>
      <source src={media.videoUrl} type="video/mp4" />
    </video>
  );
}

export function PortfolioGrid() {
  const [active, setActive] = useState("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const visible = active === "All" ? projects : projects.filter((project) => project.category === active);

  const selectCategory = (category: string) => {
    if (category === active) return;
    const update = () => setActive(category);
    const transition = (document as ViewTransitionDocument).startViewTransition;
    if (transition) transition.call(document, update);
    else update();
  };

  const openProject = (project: Project, trigger: HTMLElement) => {
    returnFocusRef.current = trigger;
    setSelectedProject(project);
  };

  const closeProject = () => setSelectedProject(null);

  useEffect(() => {
    if (!selectedProject) return;
    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    const focusableElements = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), video[controls], [tabindex]:not([tabindex='-1'])") ?? []);
    requestAnimationFrame(() => closeButtonRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeProject();
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
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      document.removeEventListener("keydown", onKeyDown);
      returnFocusRef.current?.focus();
    };
  }, [selectedProject]);

  return (
    <>
      <div className="filters" role="group" aria-label="Filter selected work">
        {categories.map((category) => (
          <button key={category} type="button" aria-pressed={active === category} aria-controls="project-grid" className={active === category ? "active" : ""} onClick={() => selectCategory(category)}>
            {category}
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">Showing {visible.length} {visible.length === 1 ? "project" : "projects"}.</p>
      <div className="project-grid" id="project-grid">
        {visible.map((project) => {
          const featuredMedia = project.media?.filter((media) => media.featured) ?? [];
          const previewMedia = (featuredMedia.length ? featuredMedia : project.media ?? []).slice(0, 3);
          const projectNumber = projects.findIndex((item) => item.id === project.id) + 1;

          return (
            <article className={`project ${project.ratio}${project.featured ? " featured" : ""}${project.layout ? ` layout-${project.layout}` : ""}`} key={project.id} style={{ viewTransitionName: `project-${project.id}` }}>
              <div className="project-meta-line" aria-label={`Project ${String(projectNumber).padStart(2, "0")}: ${project.category}, ${project.contentType}`}>
                <span className="project-number">{String(projectNumber).padStart(2, "0")}</span>
                <span className="project-category">{project.category}</span>
                <span className="project-meta">{project.contentType}</span>
              </div>
              <div className={`project-visual ${project.tone}${previewMedia.length ? " has-media" : ""}`}>
                {previewMedia.length ? (
                  <div className={`project-preview${previewMedia.length > 1 ? " project-preview-triptych" : " project-preview-single"}`}>
                    {previewMedia.map((media) => (
                      <figure key={media.id}>
                        <img src={media.poster} alt={`${media.title} — ${project.client ?? project.title}`} width={media.width} height={media.height} loading="lazy" decoding="async" />
                      </figure>
                    ))}
                  </div>
                ) : null}
                {!previewMedia.length ? <div className="project-art" aria-label={`${project.title} visual`}><strong>{project.artLabel}</strong></div> : null}
                <button className="project-open" type="button" onClick={(event) => openProject(project, event.currentTarget)} aria-label={`View details for ${project.title}`}>
                  <span>View project <b aria-hidden="true">↗</b></span>
                </button>
              </div>
              <div className="project-info">
                <div className="project-copy">
                  <div className="project-eyebrow">
                    {project.client ? <span>{project.client}</span> : null}
                    <span>{project.category}</span>
                    <span>{project.contentType}</span>
                  </div>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="project-role">
                    <span className="project-label">My role</span>
                    <ul aria-label={`Roles for ${project.title}`}>
                      {project.roles.map((role) => <li key={role}>{role}</li>)}
                    </ul>
                  </div>
                  {project.deliverables?.length ? <p className="project-deliverables"><span>Deliverables</span>{project.deliverables.join(" · ")}</p> : null}
                  {project.externalUrl ? <a className="project-external-link" href={project.externalUrl} target="_blank" rel="noopener noreferrer">Watch project <span aria-hidden="true">↗</span></a> : null}
                </div>
                {project.result ? <div className="project-result"><strong>{project.result.value}</strong><span>{project.result.label}</span></div> : null}
              </div>
            </article>
          );
        })}
      </div>

      {selectedProject ? (
        <div className="video-modal" role="dialog" aria-modal="true" aria-labelledby="video-modal-title" aria-describedby="video-modal-description" onPointerDown={(event) => { if (event.target === event.currentTarget) closeProject(); }}>
          <div ref={dialogRef} className="video-modal-inner">
            <div className="video-modal-head">
              <div>
                <p className="project-eyebrow">{[selectedProject.client, selectedProject.category, selectedProject.contentType].filter(Boolean).join(" / ")}</p>
                <h2 id="video-modal-title">{selectedProject.title}</h2>
                <p id="video-modal-description">{selectedProject.description}</p>
              </div>
              <button ref={closeButtonRef} type="button" onClick={closeProject} aria-label="Close project details">Close</button>
            </div>
            {selectedProject.media?.length ? (
              <div className={`video-modal-media video-modal-media-${selectedProject.ratio}`}>
                {selectedProject.media.map((media) => (
                  <figure key={media.id}>
                    <PortfolioVideo media={media} projectLabel={selectedProject.client ?? selectedProject.title} ratio={selectedProject.ratio} />
                    <figcaption>{media.title}</figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <div className={`video-modal-art ${selectedProject.tone}`} aria-hidden="true"><strong>{selectedProject.artLabel}</strong></div>
            )}
            <div className="video-modal-details">
              <div className="video-modal-role">
                <span className="project-label">My role</span>
                <ul>{selectedProject.roles.map((role) => <li key={role}>{role}</li>)}</ul>
              </div>
              {selectedProject.deliverables?.length ? <p className="project-deliverables"><span>Deliverables</span>{selectedProject.deliverables.join(" · ")}</p> : null}
              {selectedProject.result ? <div className="project-result"><strong>{selectedProject.result.value}</strong><span>{selectedProject.result.label}</span></div> : null}
            </div>
            {selectedProject.externalUrl ? <a className="text-link" href={selectedProject.externalUrl} target="_blank" rel="noopener noreferrer">Watch project <span aria-hidden="true">↗</span></a> : null}
            {selectedProject.caseStudySlug ? <a className="text-link" href={`/work/${selectedProject.caseStudySlug}`}>View case study <span aria-hidden="true">↗</span></a> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
