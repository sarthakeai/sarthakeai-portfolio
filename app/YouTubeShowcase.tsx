"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  YOUTUBE_CHANNEL_URL,
  type YouTubeShowcaseData,
  type YouTubeShowcaseVideo,
} from "./youtube-data";

const START_TIME_BY_VIDEO_ID: Readonly<Record<string, number>> = {
  LBFTXoNNu_Q: 23,
  "5MWtToYnA00": 59,
  "2MW4freUkg8": 76,
};

const YOUTUBE_RESOURCE_ORIGINS = [
  "https://www.youtube-nocookie.com",
  "https://www.youtube.com",
  "https://i.ytimg.com",
  "https://s.ytimg.com",
] as const;

function formatSubscriberCount(value: number | null) {
  if (!value) return "24K+";
  return `${Math.floor(value / 1_000)}K+`;
}

function getStartTime(videoId: string) {
  return START_TIME_BY_VIDEO_ID[videoId] ?? 0;
}

function ensurePreconnect(href: string) {
  if (document.head.querySelector(`link[rel="preconnect"][href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "preconnect";
  link.href = href;
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
}

function prewarmYouTubeResources() {
  YOUTUBE_RESOURCE_ORIGINS.forEach(ensurePreconnect);
}

function getEmbedUrl(videoId: string) {
  const origin = typeof window === "undefined" ? "https://sarthakeai.com" : window.location.origin;
  const params = new URLSearchParams({
    autoplay: "0",
    controls: "1",
    enablejsapi: "1",
    origin,
    playsinline: "1",
  });
  const startTime = getStartTime(videoId);
  if (startTime > 0) params.set("start", String(startTime));
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
}

function CarouselArrow({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d={direction === "previous" ? "M19 12H5m6-6-6 6 6 6" : "M5 12h14m-6-6 6 6-6 6"} fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type YouTubeApiPlayer = {
  destroy: () => void;
  pauseVideo: () => void;
};

type YouTubeApiEvent<T = undefined> = {
  data: T;
  target: YouTubeApiPlayer;
};

type YouTubeApiNamespace = {
  Player: new (element: HTMLIFrameElement, options: {
    events: {
      onError?: (event: YouTubeApiEvent<number>) => void;
      onReady?: (event: YouTubeApiEvent) => void;
      onStateChange?: (event: YouTubeApiEvent<number>) => void;
    };
  }) => YouTubeApiPlayer;
};

declare global {
  interface Window {
    YT?: YouTubeApiNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeIframeApiPromise: Promise<YouTubeApiNamespace> | null = null;

function loadYouTubeIframeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeIframeApiPromise) return youtubeIframeApiPromise;

  youtubeIframeApiPromise = new Promise<YouTubeApiNamespace>((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error("YouTube IFrame Player API loaded without a Player constructor"));
    };

    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');
    if (existingScript) return;

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.addEventListener("error", () => {
      youtubeIframeApiPromise = null;
      reject(new Error("YouTube IFrame Player API failed to load"));
    }, { once: true });
    document.head.appendChild(script);
  });

  return youtubeIframeApiPromise;
}

function NativeYouTubePlayer({ video, onPlayerReady, onPlayerStateChange, onPlayerDispose }: {
  video: YouTubeShowcaseVideo;
  onPlayerReady: (videoId: string, player: YouTubeApiPlayer) => void;
  onPlayerStateChange: (videoId: string, state: number) => void;
  onPlayerDispose: (videoId: string, player: YouTubeApiPlayer | null) => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;
    let cancelled = false;
    let player: YouTubeApiPlayer | null = null;

    void loadYouTubeIframeApi()
      .then((api) => {
        if (cancelled || !iframeRef.current) return;
        player = new api.Player(iframeRef.current, {
          events: {
            onError: (event) => {
              console.error(`[youtube-showcase] Native player ${video.id} returned error ${event.data}`);
            },
            onReady: (event) => {
              if (!cancelled) onPlayerReady(video.id, event.target);
            },
            onStateChange: (event) => {
              if (!cancelled) onPlayerStateChange(video.id, event.data);
            },
          },
        });
      })
      .catch((error: unknown) => {
        console.error("[youtube-showcase] Native player initialization failed", error);
      });

    return () => {
      cancelled = true;
      onPlayerDispose(video.id, player);
      try {
        player?.destroy();
      } catch {
        // The iframe may already be gone during page navigation.
      }
    };
  }, [onPlayerDispose, onPlayerReady, onPlayerStateChange, video.id]);

  return (
    <article className="youtube-video-card" data-youtube-video-id={video.id}>
      <div className="youtube-video-frame">
        <iframe
          ref={iframeRef}
          className="youtube-native-player"
          data-media-player="youtube"
          src={getEmbedUrl(video.id)}
          title={video.title}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </article>
  );
}

export function YouTubeShowcase({ initialData }: { initialData: YouTubeShowcaseData }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const playerRefs = useRef(new Map<string, YouTubeApiPlayer>());
  const activePlayerIdRef = useRef<string | null>(null);
  const data = initialData;
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [playersMounted, setPlayersMounted] = useState(false);
  const [trackOffset, setTrackOffset] = useState(0);

  const pausePlayersExcept = useCallback((activeVideoId?: string) => {
    playerRefs.current.forEach((player, videoId) => {
      if (videoId === activeVideoId) return;
      try {
        player.pauseVideo();
      } catch {
        // A player can be disposed while a rapid interaction is settling.
      }
    });
  }, []);

  const handlePlayerReady = useCallback((videoId: string, player: YouTubeApiPlayer) => {
    playerRefs.current.set(videoId, player);
  }, []);

  const handlePlayerStateChange = useCallback((videoId: string, state: number) => {
    if (state === 1) {
      activePlayerIdRef.current = videoId;
      pausePlayersExcept(videoId);
      return;
    }

    if ((state === 0 || state === 2) && activePlayerIdRef.current === videoId) {
      activePlayerIdRef.current = null;
    }
  }, [pausePlayersExcept]);

  const handlePlayerDispose = useCallback((videoId: string, player: YouTubeApiPlayer | null) => {
    if (!player || playerRefs.current.get(videoId) === player) playerRefs.current.delete(videoId);
    if (activePlayerIdRef.current === videoId) activePlayerIdRef.current = null;
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (!("IntersectionObserver" in window)) {
      queueMicrotask(prewarmYouTubeResources);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      prewarmYouTubeResources();
      observer.disconnect();
    }, { rootMargin: "800px 0px" });

    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || playersMounted) return;
    if (!("IntersectionObserver" in window)) {
      queueMicrotask(() => setPlayersMounted(true));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      setPlayersMounted(true);
      observer.disconnect();
    }, { rootMargin: "400px 0px" });

    observer.observe(stage);
    return () => observer.disconnect();
  }, [playersMounted]);

  useEffect(() => {
    const stage = stageRef.current;
    const row = rowRef.current;
    if (!stage || !row) return;

    const updateTrackOffset = () => {
      const cards = Array.from(row.children) as HTMLElement[];
      const selectedCard = cards[carouselIndex];
      if (!selectedCard) return;
      const maxOffset = Math.max(0, row.scrollWidth - stage.clientWidth);
      setTrackOffset(-Math.min(selectedCard.offsetLeft, maxOffset));
    };

    updateTrackOffset();
    const observer = new ResizeObserver(updateTrackOffset);
    observer.observe(stage);
    observer.observe(row);
    return () => observer.disconnect();
  }, [carouselIndex, data.videos]);

  const pausePlayerIfHiddenAfterNavigation = (nextIndex: number) => {
    const activeVideoId = activePlayerIdRef.current;
    const stage = stageRef.current;
    const row = rowRef.current;
    if (!activeVideoId || !stage || !row) return;

    const cards = Array.from(row.children) as HTMLElement[];
    const selectedCard = cards[nextIndex];
    const activeCard = cards[data.videos.findIndex((video) => video.id === activeVideoId)];
    if (!selectedCard || !activeCard) return;

    const maxOffset = Math.max(0, row.scrollWidth - stage.clientWidth);
    const nextTrackOffset = -Math.min(selectedCard.offsetLeft, maxOffset);
    const activeCardLeft = activeCard.offsetLeft + nextTrackOffset;
    const activeCardRight = activeCardLeft + activeCard.offsetWidth;
    if (activeCardRight > 0 && activeCardLeft < stage.clientWidth) return;

    try {
      playerRefs.current.get(activeVideoId)?.pauseVideo();
    } catch {
      // The iframe can finish disposing during rapid navigation.
    }
    activePlayerIdRef.current = null;
  };

  const selectVideo = (nextIndex: number) => {
    const boundedIndex = Math.min(Math.max(nextIndex, 0), data.videos.length - 1);
    pausePlayerIfHiddenAfterNavigation(boundedIndex);
    setCarouselIndex(boundedIndex);
  };

  const rowStyle = { "--youtube-track-offset": `${trackOffset}px` } as CSSProperties;

  return (
    <section className="section youtube" id="youtube" data-reveal>
      <div className="youtube-intro">
        <div className="youtube-copy">
          <p className="kicker">Personal project / YouTube</p>
          <h2>I make videos too.</h2>
          <p>I run my own technology channel, creating reviews, hands-on videos and other tech content.</p>
        </div>
        <div className="youtube-channel-meta">
          <div className="youtube-subscriber-stat" aria-label={`${formatSubscriberCount(data.subscriberCount)} YouTube subscribers`}>
            <strong>{formatSubscriberCount(data.subscriberCount)}</strong>
            <span>Subscribers</span>
          </div>
          <a className="text-link youtube-cta" href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer" aria-label="Visit my YouTube channel, opens in a new tab">Visit my YouTube channel <span aria-hidden="true">↗</span></a>
        </div>
      </div>

      <div ref={stageRef} className="youtube-video-stage">
        <div ref={rowRef} className="youtube-video-row" style={rowStyle} aria-label="Latest long-form YouTube videos">
          {data.videos.map((video) => playersMounted ? (
            <NativeYouTubePlayer
              key={video.id}
              video={video}
              onPlayerReady={handlePlayerReady}
              onPlayerStateChange={handlePlayerStateChange}
              onPlayerDispose={handlePlayerDispose}
            />
          ) : (
            <article key={video.id} className="youtube-video-card" data-youtube-video-id={video.id} aria-hidden="true">
              <div className="youtube-video-frame" />
            </article>
          ))}
        </div>
      </div>

      <div className="youtube-navigation" aria-label="YouTube showcase navigation">
        <div className="youtube-pagination" role="status" aria-live="polite" aria-label={`Video ${carouselIndex + 1} of ${data.videos.length}`}>
          {data.videos.map((video, index) => (
            <span key={video.id} className={carouselIndex === index ? "is-active" : ""} aria-hidden="true" />
          ))}
        </div>
        <div className="youtube-arrows">
          <button type="button" onClick={() => selectVideo(carouselIndex - 1)} disabled={carouselIndex === 0} aria-label="Previous YouTube video"><CarouselArrow direction="previous" /></button>
          <button type="button" onClick={() => selectVideo(carouselIndex + 1)} disabled={carouselIndex === data.videos.length - 1} aria-label="Next YouTube video"><CarouselArrow direction="next" /></button>
        </div>
      </div>
    </section>
  );
}
