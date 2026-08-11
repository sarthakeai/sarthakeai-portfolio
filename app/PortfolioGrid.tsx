"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { categories, projects, type Project } from "./portfolio-data";

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => void;
};

export function PortfolioGrid() {
  const [active, setActive] = useState("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const visible = active === "All" ? projects : projects.filter((project) => project.category === active);

  const selectCategory = (category: string) => {
    if (category === active) return;
    const update = () => setActive(category);
    const transition = (document as ViewTransitionDocument).startViewTransition;
    if (transition) transition.call(document, update);
    else update();
  };

  const openVideo = (project: Project, trigger: HTMLElement) => {
    returnFocusRef.current = trigger;
    setSelectedProject(project);
  };

  const closeVideo = () => setSelectedProject(null);

  useEffect(() => {
    if (!selectedProject) return;
    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    requestAnimationFrame(() => closeButtonRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeVideo();
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
        {visible.map((project, index) => (
          <article className={`project ${project.ratio}`} key={project.id} style={{ viewTransitionName: `project-${project.id}` }}>
            <div className={`project-visual ${project.tone}`}>
              {project.thumbnail ? <Image src={project.thumbnail} alt="" fill sizes="(max-width: 800px) 100vw, 55vw" /> : null}
              <div className="project-art" aria-label={`${project.title} visual`}>
                <span className="project-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="project-category">{project.category}</span>
                <strong>{project.artLabel}</strong>
                <span className="project-meta">{project.contentType}</span>
              </div>
              {project.videoUrl ? (
                <button className="project-action" type="button" onClick={(event) => openVideo(project, event.currentTarget)} aria-label={`Play ${project.title}`}>Play <span aria-hidden="true">▶</span></button>
              ) : project.externalUrl ? (
                <a className="project-action" href={project.externalUrl} target="_blank" rel="noopener noreferrer" aria-label={`View ${project.title} in a new tab`}>View <span aria-hidden="true">↗</span></a>
              ) : null}
            </div>
            <div className="project-info">
              <div><h3>{project.title}</h3><p>{project.description}</p></div>
              <div className="project-details"><span>{project.contentType}</span>{project.client ? <span>{project.client}</span> : null}</div>
            </div>
          </article>
        ))}
      </div>

      {selectedProject?.videoUrl ? (
        <div className="video-modal" role="dialog" aria-modal="true" aria-labelledby="video-modal-title" aria-describedby="video-modal-description" onPointerDown={(event) => { if (event.target === event.currentTarget) closeVideo(); }}>
          <div className="video-modal-inner">
            <div className="video-modal-head">
              <div><h2 id="video-modal-title">{selectedProject.title}</h2><p id="video-modal-description">{selectedProject.description}</p></div>
              <button ref={closeButtonRef} type="button" onClick={closeVideo} aria-label="Close video">Close</button>
            </div>
            <video src={selectedProject.videoUrl} poster={selectedProject.thumbnail} controls autoPlay playsInline preload="metadata" aria-label={selectedProject.title}>
              <track kind="captions" src={selectedProject.captionsUrl} srcLang="en" label="English" default />
            </video>
            {selectedProject.externalUrl ? <a className="text-link" href={selectedProject.externalUrl} target="_blank" rel="noopener noreferrer">View original <span aria-hidden="true">↗</span></a> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
