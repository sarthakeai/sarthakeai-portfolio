"use client";

/* eslint-disable @next/next/no-img-element -- Static WebP posters are pre-sized and optimized for this project. */
/* eslint-disable jsx-a11y/media-has-caption -- Supplied portfolio previews use their source/open captions; separate timed-text files were not provided. */

import { useEffect, useRef, useState } from "react";
import { activateMedia, MEDIA_PLAYBACK_EVENT, stopAllMedia, stopMediaWithin, type MediaPlaybackEvent } from "./media-playback";
import { categories, projects, type Project, type ProjectMedia } from "./portfolio-data";

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => void;
};

function getYouTubeId(url?: string) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") return parsed.pathname.split("/").filter(Boolean)[0] ?? null;
    if (parsed.hostname.endsWith("youtube.com")) {
      if (parsed.pathname.startsWith("/embed/")) return parsed.pathname.split("/")[2] ?? null;
      return parsed.searchParams.get("v");
    }
  } catch {
    return null;
  }
  return null;
}

function PosterImage({ media, alt, sizes, priority = false }: { media: ProjectMedia; alt: string; sizes: string; priority?: boolean }) {
  const sources = [media.poster, ...(media.posterFallbacks ?? [])];
  const [sourceIndex, setSourceIndex] = useState(0);

  return (
    <img
      src={sources[sourceIndex]}
      alt={alt}
      width={media.width}
      height={media.height}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      onError={() => setSourceIndex((index) => Math.min(index + 1, sources.length - 1))}
    />
  );
}

function PortfolioVideo({ media, projectLabel, ratio }: { media: ProjectMedia; projectLabel: string; ratio: Project["ratio"] }) {
  const [started, setStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubeId = getYouTubeId(media.externalUrl);

  useEffect(() => {
    const onPlaybackChange = (event: Event) => {
      const { activeId } = (event as MediaPlaybackEvent).detail;
      if (activeId === media.id) return;
      videoRef.current?.pause();
      if (youtubeId) setStarted(false);
    };

    window.addEventListener(MEDIA_PLAYBACK_EVENT, onPlaybackChange);
    return () => {
      window.removeEventListener(MEDIA_PLAYBACK_EVENT, onPlaybackChange);
    };
  }, [media.id, youtubeId]);

  useEffect(() => {
    if (!started || youtubeId) return;
    void videoRef.current?.play().catch(() => undefined);
  }, [started, youtubeId]);

  const startPlayback = () => {
    activateMedia(media.id);
    setStarted(true);
  };

  if (youtubeId) {
    if (!started) {
      return (
        <div className={`video-modal-poster video-modal-poster-${ratio}`}>
          <PosterImage media={media} alt="" sizes="(max-width: 50rem) calc(100vw - 3rem), 64rem" />
          <button type="button" onClick={startPlayback} aria-label={`Play ${media.title} — ${projectLabel} inside this website`}>
            <span aria-hidden="true" />
          </button>
        </div>
      );
    }

    return (
      <div className="video-modal-youtube">
        <iframe
          data-media-player="youtube"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&playsinline=1`}
          title={`${media.title} — ${projectLabel}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }

  if (media.externalUrl) {
    return (
      <a className={`video-modal-external video-modal-external-${ratio}`} href={media.externalUrl} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${media.title} — ${projectLabel}, opens in a new tab`}>
        <PosterImage media={media} alt={`${media.title} — ${projectLabel}`} sizes="(max-width: 50rem) calc(100vw - 3rem), 64rem" />
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
        <PosterImage media={media} alt="" sizes="(max-width: 42rem) min(20rem, calc(100vw - 3rem)), (max-width: 50rem) 45vw, 21rem" />
        <button type="button" onClick={startPlayback} aria-label={`Play ${media.title} — ${projectLabel}`}>
          <span aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <video ref={videoRef} controls playsInline preload="none" poster={media.poster} aria-label={`${media.title} — ${projectLabel}`} onPlay={(event) => activateMedia(media.id, event.currentTarget)}>
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
  const filterButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const filterReadyRef = useRef(false);
  const visible = active === "All" ? projects : projects.filter((project) => project.category === active);

  useEffect(() => {
    if (!filterReadyRef.current) {
      filterReadyRef.current = true;
      return;
    }
    const button = filterButtonRefs.current[active];
    if (!button) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    button.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "nearest", inline: "center" });
  }, [active]);

  const selectCategory = (category: string) => {
    if (category === active) return;
    const update = () => setActive(category);
    const transition = (document as ViewTransitionDocument).startViewTransition;
    if (transition) transition.call(document, update);
    else update();
  };

  const openProject = (project: Project, trigger: HTMLElement) => {
    stopAllMedia();
    returnFocusRef.current = trigger;
    setSelectedProject(project);
  };

  const closeProject = () => {
    stopMediaWithin(dialogRef.current);
    stopAllMedia();
    setSelectedProject(null);
  };

  useEffect(() => {
    if (!selectedProject) return;
    const dialog = dialogRef.current;
    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    const focusableElements = () => Array.from(dialog?.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), video[controls], iframe, [tabindex]:not([tabindex='-1'])") ?? []);
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
      stopMediaWithin(dialog);
      stopAllMedia();
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
          <button ref={(button) => { filterButtonRefs.current[category] = button; }} key={category} type="button" aria-pressed={active === category} aria-controls="project-grid" className={active === category ? "active" : ""} onClick={() => selectCategory(category)}>
            {category}
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">Showing {visible.length} {visible.length === 1 ? "project" : "projects"}.</p>
      <div className={`project-grid${active === "All" ? "" : " is-filtered"}`} id="project-grid">
        {visible.map((project) => {
          const featuredMedia = project.media?.filter((media) => media.featured) ?? [];
          const previewMedia = (featuredMedia.length ? featuredMedia : project.media ?? []).slice(0, 3);
          const projectNumber = projects.findIndex((item) => item.id === project.id) + 1;

          return (
            <article data-project-id={project.id} className={`project ${project.ratio}${project.featured ? " featured" : ""}${project.layout ? ` layout-${project.layout}` : ""}`} key={project.id} style={{ viewTransitionName: `project-${project.id}` }}>
              <div className="project-meta-line" aria-label={`Project ${String(projectNumber).padStart(2, "0")}: ${project.category}, ${project.contentType}`}>
                <span className="project-number">{String(projectNumber).padStart(2, "0")}</span>
                <span className="project-category">{project.category}</span>
                <span className="project-meta">{project.contentType}</span>
              </div>
              <div className={`project-visual ${project.tone}${previewMedia.length ? " has-media" : ""}`}>
                {previewMedia.length ? (
                  <div className={`project-preview preview-count-${previewMedia.length}${previewMedia.length > 1 ? " project-preview-triptych" : " project-preview-single"}`}>
                    {previewMedia.map((media) => (
                      <figure key={media.id}>
                        <PosterImage media={media} alt={`${media.title} — ${project.client ?? project.title}`} sizes="(max-width: 42rem) calc(100vw - 2.5rem), (max-width: 64rem) 48vw, (max-width: 92rem) 54vw, 48rem" priority={active === "All" && projectNumber <= 2} />
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
            {selectedProject.externalUrl ? <a className="text-link" href={selectedProject.externalUrl} target="_blank" rel="noopener noreferrer">{getYouTubeId(selectedProject.externalUrl) ? "Watch on YouTube" : "Watch project"} <span aria-hidden="true">↗</span></a> : null}
            {selectedProject.caseStudySlug ? <a className="text-link" href={`/work/${selectedProject.caseStudySlug}`}>View case study <span aria-hidden="true">↗</span></a> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
