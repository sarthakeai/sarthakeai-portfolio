"use client";

/* eslint-disable @next/next/no-img-element -- Existing portfolio posters are already optimized and dimensioned. */
import { useEffect, useState } from "react";
import { activateMedia, MEDIA_PLAYBACK_EVENT, type MediaPlaybackEvent } from "./media-playback";
import { NativePortfolioVideo } from "./NativePortfolioVideo";
import type { ProjectMedia } from "./portfolio-data";

function getYouTubeId(url?: string) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") return parsed.pathname.split("/").filter(Boolean)[0] ?? null;
    if (parsed.hostname.endsWith("youtube.com")) return parsed.searchParams.get("v");
  } catch {
    return null;
  }
  return null;
}

function CaseStudyMediaItem({ media, projectTitle, showCenterPlay }: { media: ProjectMedia; projectTitle: string; showCenterPlay: boolean }) {
  const youtubeId = getYouTubeId(media.externalUrl);
  const [youtubeStarted, setYoutubeStarted] = useState(false);

  useEffect(() => {
    const onPlaybackChange = (event: Event) => {
      if ((event as MediaPlaybackEvent).detail.activeId === media.id) return;
      setYoutubeStarted(false);
    };
    window.addEventListener(MEDIA_PLAYBACK_EVENT, onPlaybackChange);
    return () => window.removeEventListener(MEDIA_PLAYBACK_EVENT, onPlaybackChange);
  }, [media.id]);

  if (youtubeId && youtubeStarted) {
    return <iframe data-media-player="youtube" src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`} title={`${media.title} — ${projectTitle}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />;
  }

  if (youtubeId) {
    return (
      <button className="case-study-youtube-poster" type="button" onClick={() => { activateMedia(media.id); setYoutubeStarted(true); }} aria-label={`Play ${media.title}`}>
        <img src={media.poster} alt={`${media.title} — ${projectTitle}`} width={media.width} height={media.height} loading="lazy" decoding="async" />
        <span aria-hidden="true" />
      </button>
    );
  }

  if (media.videoUrl) {
    return (
      <NativePortfolioVideo
        id={media.id}
        title={`${media.title} — ${projectTitle}`}
        src={media.videoUrl}
        poster={media.poster}
        className={showCenterPlay ? "case-study-short-video" : undefined}
      />
    );
  }

  return <img src={media.poster} alt={`${media.title} — ${projectTitle}`} width={media.width} height={media.height} loading="lazy" decoding="async" />;
}

export function CaseStudyMedia({ media, projectTitle, portrait = false, showCenterPlay = false }: { media: ProjectMedia[]; projectTitle: string; portrait?: boolean; showCenterPlay?: boolean }) {
  return (
    <div className={`case-study-media${portrait ? " is-portrait" : ""}`} role="region" aria-label={`Selected media for ${projectTitle}`}>
      {media.map((item) => (
        <figure key={item.id}>
          <div className="case-study-media-frame"><CaseStudyMediaItem media={item} projectTitle={projectTitle} showCenterPlay={showCenterPlay} /></div>
          <figcaption>{item.title}</figcaption>
        </figure>
      ))}
    </div>
  );
}
