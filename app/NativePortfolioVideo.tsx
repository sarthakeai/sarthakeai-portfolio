"use client";

/* eslint-disable @next/next/no-img-element -- The supplied portfolio posters are the exact approved local thumbnails. */
/* eslint-disable jsx-a11y/media-has-caption -- Timed-text files were not supplied for the portfolio preview edits. */

import { useCallback, useEffect, useRef, useState } from "react";
import { activateMedia, MEDIA_PLAYBACK_EVENT, type MediaPlaybackEvent } from "./media-playback";

export function NativePortfolioVideo({
  id,
  title,
  src,
  poster,
  className,
}: {
  id: string;
  title: string;
  src: string;
  poster: string;
  className?: string;
}) {
  const [active, setActive] = useState(false);
  const [hasActivated, setHasActivated] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [showNativeControls, setShowNativeControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const activationRequestedRef = useRef(false);
  const controlsFrameRef = useRef<number | null>(null);

  const cancelControlsFrame = useCallback(() => {
    if (controlsFrameRef.current === null) return;
    cancelAnimationFrame(controlsFrameRef.current);
    controlsFrameRef.current = null;
  }, []);

  useEffect(() => {
    const onPlaybackChange = (event: Event) => {
      if ((event as MediaPlaybackEvent).detail.activeVideo === videoRef.current) return;
      activationRequestedRef.current = false;
      const video = videoRef.current;
      if (video) {
        video.pause();
        video.controls = false;
      }
      cancelControlsFrame();
      setShowNativeControls(false);
      setActive(false);
    };

    window.addEventListener(MEDIA_PLAYBACK_EVENT, onPlaybackChange);
    return () => {
      cancelControlsFrame();
      window.removeEventListener(MEDIA_PLAYBACK_EVENT, onPlaybackChange);
    };
  }, [cancelControlsFrame, id]);

  const activateAndPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    activationRequestedRef.current = true;
    video.preload = "auto";
    setHasActivated(true);
    setShowNativeControls(false);
    activateMedia(id, video);
    void video.play().catch(() => {
      if (!activationRequestedRef.current || videoRef.current !== video) return;
      activationRequestedRef.current = false;
      video.controls = false;
      setShowNativeControls(false);
      setActive(false);
    });
  };

  return (
    <div className={`portfolio-native-video-shell${active ? " is-active" : ""}`}>
      <video
        ref={videoRef}
        className={`portfolio-native-video${className ? ` ${className}` : ""}`}
        controls={showNativeControls}
        playsInline
        preload={hasActivated ? "auto" : "none"}
        poster={hasPlayed ? undefined : poster}
        aria-label={title}
        onPlay={(event) => {
          if (!activationRequestedRef.current) {
            event.currentTarget.pause();
            event.currentTarget.controls = false;
            return;
          }
          event.currentTarget.preload = "auto";
          setHasActivated(true);
          setActive(true);
        }}
        onPlaying={(event) => {
          if (!activationRequestedRef.current) return;
          const video = event.currentTarget;
          setHasPlayed(true);
          cancelControlsFrame();
          controlsFrameRef.current = requestAnimationFrame(() => {
            controlsFrameRef.current = null;
            if (!activationRequestedRef.current || videoRef.current !== video || video.paused) return;
            setShowNativeControls(true);
          });
        }}
      >
        <source src={src} type="video/mp4" />
      </video>
      {!active ? (
        <div className={`video-modal-poster portfolio-native-video-idle${hasPlayed ? " is-resume" : ""}`}>
          {!hasPlayed ? <img src={poster} alt="" draggable={false} /> : null}
          <button type="button" onClick={activateAndPlay} aria-label={`Play ${title}`}>
            <span aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
