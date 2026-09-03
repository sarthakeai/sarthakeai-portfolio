"use client";

/* eslint-disable @next/next/no-img-element -- The supplied portfolio posters are the exact approved local thumbnails. */
/* eslint-disable jsx-a11y/media-has-caption -- Timed-text files were not supplied for the portfolio preview edits. */

import { CornersIn } from "@phosphor-icons/react/dist/csr/CornersIn";
import { CornersOut } from "@phosphor-icons/react/dist/csr/CornersOut";
import { SpeakerHigh } from "@phosphor-icons/react/dist/csr/SpeakerHigh";
import { SpeakerSlash } from "@phosphor-icons/react/dist/csr/SpeakerSlash";
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { activateMedia, MEDIA_PLAYBACK_EVENT, type MediaPlaybackEvent } from "./media-playback";

type WebkitFullscreenVideo = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
};

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasActivated, setHasActivated] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [touchControlsVisible, setTouchControlsVisible] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const activationRequestedRef = useRef(false);
  const touchControlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTouchPointerRef = useRef(false);
  const touchControlsVisibleRef = useRef(false);
  const revealingTouchControlsRef = useRef(false);

  const setTouchControls = useCallback((visible: boolean) => {
    touchControlsVisibleRef.current = visible;
    setTouchControlsVisible(visible);
  }, []);

  const clearTouchControlsTimer = useCallback(() => {
    if (touchControlsTimerRef.current === null) return;
    clearTimeout(touchControlsTimerRef.current);
    touchControlsTimerRef.current = null;
  }, []);

  const scheduleTouchControlsHide = useCallback(() => {
    clearTouchControlsTimer();
    if (!isTouchPointerRef.current) return;
    touchControlsTimerRef.current = setTimeout(() => {
      touchControlsTimerRef.current = null;
      setTouchControls(false);
    }, 1000);
  }, [clearTouchControlsTimer, setTouchControls]);

  useEffect(() => {
    const onPlaybackChange = (event: Event) => {
      if ((event as MediaPlaybackEvent).detail.activeVideo === videoRef.current) return;
      activationRequestedRef.current = false;
      clearTouchControlsTimer();
      videoRef.current?.pause();
      setIsPlaying(false);
    };

    window.addEventListener(MEDIA_PLAYBACK_EVENT, onPlaybackChange);
    return () => window.removeEventListener(MEDIA_PLAYBACK_EVENT, onPlaybackChange);
  }, [clearTouchControlsTimer]);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(document.fullscreenElement === shellRef.current);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const pointerQuery = window.matchMedia("(hover: none), (pointer: coarse), (max-width: 50rem)");
    const updatePointerMode = () => { isTouchPointerRef.current = pointerQuery.matches; };
    updatePointerMode();
    pointerQuery.addEventListener("change", updatePointerMode);
    return () => {
      clearTouchControlsTimer();
      pointerQuery.removeEventListener("change", updatePointerMode);
    };
  }, [clearTouchControlsTimer]);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!isPlaying || (event.pointerType === "mouse" && !isTouchPointerRef.current)) return;
      isTouchPointerRef.current = true;
      if (!touchControlsVisibleRef.current) revealingTouchControlsRef.current = true;
      setTouchControls(true);
      scheduleTouchControlsHide();
    };
    const onClick = (event: MouseEvent) => {
      if (event.target === videoRef.current) revealingTouchControlsRef.current = false;
    };
    shell.addEventListener("pointerdown", onPointerDown);
    shell.addEventListener("click", onClick);
    return () => {
      shell.removeEventListener("pointerdown", onPointerDown);
      shell.removeEventListener("click", onClick);
    };
  }, [isPlaying, scheduleTouchControlsHide, setTouchControls]);

  const play = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    activationRequestedRef.current = true;
    video.preload = "auto";
    setHasActivated(true);
    activateMedia(id, video);
    void video.play().catch(() => {
      if (!activationRequestedRef.current || videoRef.current !== video) return;
      activationRequestedRef.current = false;
      setIsPlaying(false);
    });
  }, [id]);

  const togglePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) play();
    else video.pause();
  }, [play]);

  const seek = useCallback((value: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(value)) return;
    video.currentTime = value;
    setCurrentTime(value);
    if (isTouchPointerRef.current && !video.paused) {
      setTouchControls(true);
      scheduleTouchControlsHide();
    }
  }, [scheduleTouchControlsHide, setTouchControls]);

  const toggleFullscreen = useCallback(async () => {
    const shell = shellRef.current;
    const video = videoRef.current as WebkitFullscreenVideo | null;
    if (!shell || !video) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    if (shell.requestFullscreen) {
      await shell.requestFullscreen();
      scheduleTouchControlsHide();
      return;
    }

    video.webkitEnterFullscreen?.();
    scheduleTouchControlsHide();
  }, [scheduleTouchControlsHide]);

  return (
    <div
      ref={shellRef}
      className={`portfolio-native-video-shell${isPlaying ? " is-active" : ""}${hasPlayed ? " has-played" : ""}${touchControlsVisible ? " is-touch-controls-visible" : ""}`}
    >
      <video
        ref={videoRef}
        className={`portfolio-native-video${className ? ` ${className}` : ""}`}
        controls={false}
        playsInline
        preload={hasActivated ? "auto" : "metadata"}
        poster={hasPlayed ? undefined : poster}
        aria-label={title}
        onLoadedMetadata={(event) => {
          setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0);
          setCurrentTime(event.currentTarget.currentTime);
        }}
        onDurationChange={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
        onPlay={(event) => {
          if (!activationRequestedRef.current) {
            event.currentTarget.pause();
            return;
          }
          event.currentTarget.preload = "auto";
          setHasActivated(true);
          setHasPlayed(true);
          setIsPlaying(true);
          if (isTouchPointerRef.current) {
            setTouchControls(true);
            scheduleTouchControlsHide();
          } else {
            setTouchControls(false);
          }
        }}
        onPause={(event) => {
          clearTouchControlsTimer();
          setCurrentTime(event.currentTarget.currentTime);
          setIsPlaying(false);
          setTouchControls(false);
        }}
        onEnded={(event) => {
          clearTouchControlsTimer();
          setCurrentTime(event.currentTarget.currentTime);
          setIsPlaying(false);
          setTouchControls(false);
        }}
      >
        <source src={src} type="video/mp4" />
      </video>

      <div className={`video-modal-poster portfolio-native-video-idle${hasPlayed ? " is-resume" : ""}`}>
        {!hasPlayed ? <img src={poster} alt="" draggable={false} /> : null}
        <button className={`portfolio-native-center-control${isPlaying ? " is-playing" : ""}`} type="button" onClick={(event) => { if (revealingTouchControlsRef.current) revealingTouchControlsRef.current = false; else togglePlayback(); if (event.detail > 0) event.currentTarget.blur(); }} aria-label={`${isPlaying ? "Pause" : "Play"} ${title}`}>
          <span aria-hidden="true" />
        </button>
      </div>

      {hasPlayed ? (
        <div className="portfolio-native-controls" onPointerDown={clearTouchControlsTimer} onPointerUp={scheduleTouchControlsHide}>
          <button
            className="portfolio-native-volume"
            type="button"
            onClick={() => {
              const video = videoRef.current;
              if (!video) return;
              video.muted = !video.muted;
              setMuted(video.muted);
              scheduleTouchControlsHide();
            }}
            aria-label={`${muted ? "Unmute" : "Mute"} ${title}`}
          >
            {muted ? <SpeakerSlash aria-hidden="true" weight="fill" /> : <SpeakerHigh aria-hidden="true" weight="fill" />}
          </button>
          <input
            className="portfolio-native-progress"
            type="range"
            min="0"
            max={duration || 1}
            step="0.01"
            value={Math.min(currentTime, duration || 1)}
            onChange={(event) => seek(Number(event.currentTarget.value))}
            style={{ "--video-progress": `${duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0}%` } as CSSProperties}
            aria-label={`Seek ${title}`}
          />
          <button className="portfolio-native-fullscreen" type="button" onClick={() => void toggleFullscreen()} aria-label={`${isFullscreen ? "Exit" : "Enter"} fullscreen for ${title}`}>
            {isFullscreen ? <CornersIn aria-hidden="true" weight="bold" /> : <CornersOut aria-hidden="true" weight="bold" />}
          </button>
        </div>
      ) : null}
    </div>
  );
}
