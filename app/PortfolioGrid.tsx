"use client";

/* eslint-disable @next/next/no-img-element -- Static WebP posters are pre-sized and optimized for this project. */
/* eslint-disable jsx-a11y/media-has-caption -- Supplied portfolio previews use their source/open captions; separate timed-text files were not provided. */

import { type TransitionEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
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

function PosterImage({ media, alt, sizes, priority = false, fadeIn = false }: { media: ProjectMedia; alt: string; sizes: string; priority?: boolean; fadeIn?: boolean }) {
  const sources = [media.poster, ...(media.posterFallbacks ?? [])];
  const [sourceIndex, setSourceIndex] = useState(0);
  const [loaded, setLoaded] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;
    setLoaded(image.complete ? image.naturalWidth > 0 : false);
  }, [sourceIndex]);

  return (
    <img
      ref={imageRef}
      src={sources[sourceIndex]}
      alt={alt}
      className={fadeIn ? `poster-fade ${loaded ? "is-loaded" : "is-loading"}` : undefined}
      width={media.width}
      height={media.height}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => {
        setSourceIndex((index) => {
          if (index >= sources.length - 1) {
            setLoaded(true);
            return index;
          }
          setLoaded(false);
          return index + 1;
        });
      }}
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

const categoryHeadings: Record<string, string> = {
  "Short-form video": "Short-form video.",
  "YouTube long-form": "YouTube long-form.",
  "Brand introductions": "Brand introductions.",
  "Motion & brand animation": "Motion & brand animation.",
  "Podcasts & interviews": "Podcasts & interviews.",
};

function ShortPreviewCard({
  media,
  reveal,
  project,
  onOpen,
}: {
  media: ProjectMedia;
  reveal: boolean;
  project: Project;
  onOpen: (trigger: HTMLElement) => void;
}) {
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const onPlaybackChange = (event: Event) => {
      const { activeId } = (event as MediaPlaybackEvent).detail;
      if (activeId === media.id) return;
      videoRef.current?.pause();
    };

    window.addEventListener(MEDIA_PLAYBACK_EVENT, onPlaybackChange);
    return () => window.removeEventListener(MEDIA_PLAYBACK_EVENT, onPlaybackChange);
  }, [media.id]);

  useEffect(() => {
    if (!isPlaying || !media.videoUrl) return;
    const video = videoRef.current;
    if (!video) return;
    activateMedia(media.id, video);
    void video.play().catch(() => setIsPlaying(false));
  }, [isPlaying, media.id, media.videoUrl]);

  const togglePlayback = (trigger: HTMLButtonElement) => {
    if (!media.videoUrl) {
      onOpen(trigger);
      return;
    }
    if (isPlaying) {
      videoRef.current?.pause();
      return;
    }
    setHasStarted(true);
    setIsPlaying(true);
  };

  return (
    <div
      className={`short-card${isPlaying ? " is-playing" : ""}`}
      data-reveal={reveal ? "" : undefined}
    >
      <button className="short-card-open" type="button" onClick={(event) => onOpen(event.currentTarget)} aria-label={`View ${media.title} — ${project.client ?? project.title}`}>
        <figure>
          <PosterImage media={media} alt="" sizes="(max-width: 42rem) 45vw, (max-width: 64rem) 30vw, 18vw" />
          {hasStarted && media.videoUrl ? (
            <video ref={videoRef} playsInline preload="none" poster={media.poster} aria-hidden="true" onPlay={(event) => { activateMedia(media.id, event.currentTarget); setIsPlaying(true); }} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)}>
              <source src={media.videoUrl} type="video/mp4" />
            </video>
          ) : null}
        </figure>
      </button>
      <button className="short-card-control" type="button" aria-pressed={isPlaying} aria-label={`${isPlaying ? "Pause" : "Play"} ${media.title}`} onClick={(event) => togglePlayback(event.currentTarget)}>
        <span aria-hidden="true" />
      </button>
    </div>
  );
}

function EditorialProjectCard({
  project,
  priority,
  onOpen,
  previewCount = 1,
  mediaOnly = false,
  eyebrowText,
  className,
}: {
  project: Project;
  priority: boolean;
  onOpen: (trigger: HTMLElement) => void;
  previewCount?: number;
  mediaOnly?: boolean;
  eyebrowText?: string;
  className?: string;
}) {
  const previewMedia = (project.media ?? []).slice(0, previewCount);
  const hasPreviewMedia = previewMedia.length > 0;
  const isXiaomiProject = project.id === "youtube-long-form";
  const showMobileProjectCta = project.id === "short-form-video" || isXiaomiProject;
  const hideCardProjectLink = project.id === "youtube-long-form" || project.id === "podcast-interview";
  const hideProjectOverlay = mediaOnly && !showMobileProjectCta;

  return (
    <article data-project-id={project.id} className={`project editorial-project-card${className ? ` ${className}` : ""}`} style={{ viewTransitionName: `project-${project.id}` }}>
      <div className={`project-visual ${project.tone}${hasPreviewMedia ? " has-media" : ""}`}>
        {hasPreviewMedia ? (
          <div className={`project-preview ${previewMedia.length > 1 ? "project-preview-triptych" : "project-preview-single"}`}>
            {previewMedia.map((media) => (
              <figure className={isXiaomiProject ? "xiaomi-thumbnail-shell" : undefined} key={media.id}>
                <PosterImage media={media} alt={`${media.title} — ${project.client ?? project.title}`} sizes={previewMedia.length > 1 ? "(max-width: 42rem) calc((100vw - 3rem) / 3), 14rem" : "(max-width: 50rem) calc(100vw - 2.5rem), (max-width: 92rem) 45vw, 42rem"} priority={priority} fadeIn={isXiaomiProject} />
              </figure>
            ))}
          </div>
        ) : <div className="project-art" aria-label={`${project.title} visual`}><strong>{project.artLabel}</strong></div>}
        <button className={`project-open${showMobileProjectCta ? " project-open-mobile-cta" : ""}${hideProjectOverlay ? " project-open-media-only" : ""}`} type="button" onClick={(event) => onOpen(event.currentTarget)} aria-label={`View details for ${project.title}`}>
          {!hideProjectOverlay ? <span>View project <b aria-hidden="true">↗</b></span> : null}
        </button>
      </div>
      <div className="project-info">
        <div className="project-copy">
          {eyebrowText ? <div className="project-eyebrow"><span>{eyebrowText}</span></div> : project.client || project.contentType ? <div className="project-eyebrow">{project.client ? <span>{project.client}</span> : null}{project.contentType ? <span>{project.contentType}</span> : null}</div> : null}
          <h3>{project.caseStudySlug ? <a href={`/work/${project.caseStudySlug}`}>{project.title}</a> : project.title}</h3>
          <p>{project.description}</p>
          <div className="project-role">
            <span className="project-label">My role</span>
            <ul aria-label={`Roles for ${project.title}`}>{project.roles.map((role) => <li key={role}>{role}</li>)}</ul>
          </div>
          {!hideCardProjectLink && project.externalUrl ? <a className="project-external-link" href={project.externalUrl} target="_blank" rel="noopener noreferrer">Watch project <span aria-hidden="true">↗</span></a> : null}
        </div>
        {project.result ? <div className="project-result"><strong>{project.result.value}</strong><span>{project.result.label}</span></div> : null}
      </div>
    </article>
  );
}

export function PortfolioGrid() {
  const [active, setActive] = useState("All");
  const [shortExpansionPhase, setShortExpansionPhase] = useState<"collapsed" | "opening" | "expanded" | "collapsing">("collapsed");
  const [shortExtrasHeight, setShortExtrasHeight] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const filterButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const filterReadyRef = useRef(false);
  const shortExtrasRef = useRef<HTMLDivElement>(null);
  const shortExpansionFrameRef = useRef<number | null>(null);
  const shortProjects = projects.filter((project) => project.category === "Short-form video");
  const shortBase = shortProjects[0];
  const shortMedia = shortProjects.flatMap((project) => project.media ?? []);
  const shortFormProject: Project | null = shortBase ? {
    ...shortBase,
    id: "short-form-video",
    title: "Short-form video",
    client: "Swan Bitcoin + Roxom",
    category: "Short-form video",
    contentType: "Short-form social video",
    description: shortProjects.map((project) => project.description).join(" "),
    roles: [...new Set(shortProjects.flatMap((project) => project.roles))],
    media: shortMedia,
    caseStudySlug: "short-form-video",
  } : null;
  const mobileShortMedia = shortMedia;
  const mobileShortFormProject: Project | null = shortFormProject ? {
    ...shortFormProject,
    description: "A selection of short-form edits across Swan Bitcoin and Roxom, cut from interviews and talks with captions, visual cutaways, motion graphics and tight pacing.",
    roles: ["Editing", "Captions", "Motion Graphics", "Sound Design"],
    media: mobileShortMedia,
  } : null;
  const nonShortProjects = projects.filter((project) => project.category !== "Short-form video");
  const visibleNonShort = active === "All" ? nonShortProjects : nonShortProjects.filter((project) => project.category === active);
  const showShortForm = active === "All" || active === "Short-form video";
  const visibleCategoryCount = (showShortForm ? 1 : 0) + visibleNonShort.length;
  const shortInitialCount = 5;
  const shortExpanded = shortExpansionPhase !== "collapsed";

  useEffect(() => {
    if (!filterReadyRef.current) {
      filterReadyRef.current = true;
      return;
    }
    const button = filterButtonRefs.current[active];
    const filters = filtersRef.current;
    if (!button || !filters) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const left = button.offsetLeft - (filters.clientWidth - button.offsetWidth) / 2;
    filters.scrollTo({ left: Math.max(0, left), behavior: reducedMotion ? "auto" : "smooth" });
  }, [active]);

  useEffect(() => () => {
    if (shortExpansionFrameRef.current !== null) window.cancelAnimationFrame(shortExpansionFrameRef.current);
  }, []);

  useLayoutEffect(() => {
    if (shortExpansionPhase !== "opening") return;
    const extras = shortExtrasRef.current;
    if (!extras) return;
    extras.style.height = "auto";
    const expandedHeight = extras.scrollHeight;
    extras.style.height = "0px";
    void extras.offsetHeight;
    shortExpansionFrameRef.current = window.requestAnimationFrame(() => {
      setShortExtrasHeight(expandedHeight);
      setShortExpansionPhase("expanded");
      shortExpansionFrameRef.current = null;
    });
    return () => {
      if (shortExpansionFrameRef.current !== null) window.cancelAnimationFrame(shortExpansionFrameRef.current);
    };
  }, [shortExpansionPhase, shortInitialCount]);

  const expandShorts = () => {
    if (shortExpansionPhase !== "collapsed") return;
    stopAllMedia();
    setShortExtrasHeight(0);
    setShortExpansionPhase("opening");
  };

  const collapseShorts = () => {
    if (shortExpansionPhase !== "opening" && shortExpansionPhase !== "expanded") return;
    stopAllMedia();
    const extras = shortExtrasRef.current;
    if (!extras) {
      setShortExpansionPhase("collapsed");
      return;
    }
    const measuredHeight = Math.ceil(shortExpansionPhase === "opening" ? extras.getBoundingClientRect().height : extras.scrollHeight);
    extras.style.height = `${measuredHeight}px`;
    void extras.offsetHeight;
    setShortExtrasHeight(measuredHeight);
    setShortExpansionPhase("collapsing");
    shortExpansionFrameRef.current = window.requestAnimationFrame(() => {
      setShortExtrasHeight(0);
      shortExpansionFrameRef.current = null;
    });
  };

  const toggleShorts = () => {
    if (shortExpansionPhase === "opening" || shortExpansionPhase === "expanded") {
      collapseShorts();
      return;
    }
    expandShorts();
  };

  const onShortExtrasTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== "height") return;
    if (shortExpansionPhase === "expanded") {
      setShortExtrasHeight(null);
      return;
    }
    if (shortExpansionPhase === "collapsing") {
      setShortExtrasHeight(null);
      setShortExpansionPhase("collapsed");
    }
  };

  const selectCategory = (category: string) => {
    if (category === active) return;
    stopAllMedia();
    const update = () => {
      if (shortExpansionFrameRef.current !== null) window.cancelAnimationFrame(shortExpansionFrameRef.current);
      setShortExtrasHeight(null);
      setShortExpansionPhase("collapsed");
      setActive(category);
    };
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
      <div ref={filtersRef} className="filters" role="group" aria-label="Filter selected work">
        {categories.map((category) => (
          <button ref={(button) => { filterButtonRefs.current[category] = button; }} key={category} type="button" aria-pressed={active === category} aria-controls="project-grid" className={active === category ? "active" : ""} onClick={() => selectCategory(category)}>
            {category}
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">Showing {visibleCategoryCount} portfolio {visibleCategoryCount === 1 ? "category" : "categories"}.</p>
      <div className="portfolio-sections" id="project-grid">
        {showShortForm && shortFormProject ? (
          <section className="portfolio-category-section short-form-section" id="short-form-section" aria-labelledby="short-form-heading">
            <h3 className="portfolio-category-heading" id="short-form-heading"><a href="/work/short-form-video">{categoryHeadings["Short-form video"]}</a></h3>
            {mobileShortFormProject ? (
              <div className="short-form-mobile-content">
                <EditorialProjectCard
                  project={mobileShortFormProject}
                  priority
                  previewCount={3}
                  mediaOnly
                  eyebrowText="Swan Bitcoin + Roxom · Short-form social video"
                  className="mobile-short-project-card"
                  onOpen={(trigger) => openProject(mobileShortFormProject, trigger)}
                />
              </div>
            ) : null}
            <div className="short-form-desktop-content">
                <div className="shorts-grid" id="short-form-grid" aria-label="Short-form video gallery">
                  {shortMedia.slice(0, shortInitialCount).map((media) => (
                    <ShortPreviewCard key={media.id} media={media} reveal project={shortFormProject} onOpen={(trigger) => openProject(shortFormProject, trigger)} />
                  ))}
                </div>
                {shortExpanded ? (
                  <div ref={shortExtrasRef} className={`shorts-expanded-wrapper is-${shortExpansionPhase}`} id="short-form-expanded" style={{ height: shortExtrasHeight ?? undefined }} onTransitionEnd={onShortExtrasTransitionEnd} aria-hidden={shortExpansionPhase === "collapsing"}>
                    <div className="shorts-expanded-grid">
                      {shortMedia.slice(shortInitialCount, 14).map((media) => (
                        <ShortPreviewCard key={media.id} media={media} reveal={false} project={shortFormProject} onOpen={(trigger) => openProject(shortFormProject, trigger)} />
                      ))}
                    </div>
                  </div>
                ) : null}
                {shortMedia.length > 10 ? (
                  <button className="button button-secondary shorts-see-more" type="button" aria-expanded={shortExpanded} aria-controls="short-form-expanded" onClick={toggleShorts}>
                    {shortExpanded ? "See less" : "See more"}
                  </button>
                ) : null}
            </div>
          </section>
        ) : null}
        {visibleNonShort.length ? (
          <div className={`nonshort-category-grid${visibleNonShort.length === 1 ? " is-single" : ""}`}>
            {visibleNonShort.map((project, index) => (
              <section className={`portfolio-category-section nonshort-category-section nonshort-category-${project.id}`} key={project.id} aria-labelledby={`${project.id}-heading`}>
                <h3 className="portfolio-category-heading" id={`${project.id}-heading`}>{categoryHeadings[project.category]}</h3>
                <EditorialProjectCard project={project} priority={active === "All" && index < 2} onOpen={(trigger) => openProject(project, trigger)} />
              </section>
            ))}
          </div>
        ) : null}
      </div>

      {selectedProject ? (
        <div className={`video-modal${selectedProject.id === "short-form-video" ? " video-modal-short-form" : ""}`} role="dialog" aria-modal="true" aria-labelledby="video-modal-title" aria-describedby="video-modal-description" onPointerDown={(event) => { if (event.target === event.currentTarget) closeProject(); }}>
          <div ref={dialogRef} className="video-modal-inner">
            <div className="video-modal-head">
              <div>
                {selectedProject.client || selectedProject.contentType ? <div className="project-eyebrow">{selectedProject.client ? <span>{selectedProject.client}</span> : null}{selectedProject.client && selectedProject.contentType ? <span className="project-eyebrow-separator" aria-hidden="true">·</span> : null}{selectedProject.contentType ? <span>{selectedProject.contentType}</span> : null}</div> : null}
                <h2 id="video-modal-title">{selectedProject.title}</h2>
                <p id="video-modal-description">{selectedProject.description}</p>
              </div>
              <button ref={closeButtonRef} type="button" onClick={closeProject} aria-label="Close project details">Close</button>
            </div>
            {selectedProject.media?.length ? (
              <div className={`video-modal-media video-modal-media-${selectedProject.ratio}${selectedProject.id === "short-form-video" ? " video-modal-short-grid" : ""}`}>
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
              <div className="project-role video-modal-role">
                <span className="project-label">My role</span>
                <ul>{selectedProject.roles.map((role) => <li key={role}>{role}</li>)}</ul>
              </div>
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
