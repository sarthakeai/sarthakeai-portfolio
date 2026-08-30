export const MEDIA_PLAYBACK_EVENT = "portfolio:media-playback";

type PlaybackDetail = {
  activeId: string | null;
  activeVideo: HTMLVideoElement | null;
};

export function activateMedia(activeId: string, activeVideo?: HTMLVideoElement | null) {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  document.querySelectorAll<HTMLVideoElement>("video").forEach((video) => {
    if (video !== activeVideo && !video.paused) video.pause();
  });

  window.dispatchEvent(new CustomEvent<PlaybackDetail>(MEDIA_PLAYBACK_EVENT, { detail: { activeId, activeVideo: activeVideo ?? null } }));
}

export function stopAllMedia() {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  document.querySelectorAll<HTMLVideoElement>("video").forEach((video) => video.pause());
  window.dispatchEvent(new CustomEvent<PlaybackDetail>(MEDIA_PLAYBACK_EVENT, { detail: { activeId: null, activeVideo: null } }));
}

export function stopMediaWithin(container: HTMLElement | null) {
  if (!container) return;
  container.querySelectorAll<HTMLVideoElement>("video").forEach((video) => video.pause());
  container.querySelectorAll<HTMLIFrameElement>('iframe[data-media-player="youtube"]').forEach((iframe) => {
    iframe.src = "about:blank";
  });
}

export type MediaPlaybackEvent = CustomEvent<PlaybackDetail>;
