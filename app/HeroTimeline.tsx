"use client";

import { type KeyboardEvent, type PointerEvent, useCallback, useEffect, useRef, useState } from "react";

const timelineDestinations = [
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "services", label: "What I do" },
  { id: "youtube", label: "YouTube" },
  { id: "contact", label: "Contact" },
] as const;

const rulerStart = 5;
const rulerStep = 2.5;
const rulerTickCount = 37;
const destinationTickInterval = 9;
const timelineSections = timelineDestinations.map((destination, index) => ({
  ...destination,
  marker: rulerStart + index * destinationTickInterval * rulerStep,
}));
const timelineRulerTicks = Array.from({ length: rulerTickCount }, (_, index) => ({
  position: rulerStart + index * rulerStep,
  major: index % 3 === 0,
}));

const minimumProgress = timelineSections[0].marker;
const maximumProgress = timelineSections[timelineSections.length - 1].marker;
export const TIMELINE_NAVIGATE_EVENT = "sarthak:timeline-navigate";

type InteractionPhase = "idle" | "dragging" | "navigating";
type TimelineMeasurements = {
  left: number;
  width: number;
  headerOffset: number;
  timelineHeight: number;
  stickyStartY: number;
  stickyEndY: number;
  sectionScrollY: number[];
};
type PointerStart = { id: number; x: number; y: number };

const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value));

function getLayoutTop(element: HTMLElement) {
  let top = 0;
  let current: HTMLElement | null = element;
  while (current) {
    top += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }
  return top;
}

function premiumEase(progress: number) {
  const x1 = 0.22;
  const y1 = 1;
  const x2 = 0.36;
  const y2 = 1;
  let parameter = progress;

  for (let index = 0; index < 5; index += 1) {
    const inverse = 1 - parameter;
    const x = 3 * inverse * inverse * parameter * x1 + 3 * inverse * parameter * parameter * x2 + parameter ** 3;
    const slope = 3 * inverse * inverse * x1 + 6 * inverse * parameter * (x2 - x1) + 3 * parameter * parameter * (1 - x2);
    if (Math.abs(slope) < 0.0001) break;
    parameter = clamp(parameter - (x - progress) / slope, 0, 1);
  }

  const inverse = 1 - parameter;
  return 3 * inverse * inverse * parameter * y1 + 3 * inverse * parameter * parameter * y2 + parameter ** 3;
}

export function HeroTimeline() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLSpanElement>(null);
  const playheadControlRef = useRef<HTMLSpanElement>(null);
  const phaseRef = useRef<InteractionPhase>("idle");
  const progressRef = useRef(minimumProgress);
  const activeIndexRef = useRef(0);
  const headerHiddenRef = useRef(false);
  const measurementsRef = useRef<TimelineMeasurements | null>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const pointerFrameRef = useRef<number | null>(null);
  const navigationFrameRef = useRef<number | null>(null);
  const latestPointerXRef = useRef(0);
  const pointerStartRef = useRef<PointerStart | null>(null);
  const resizeTimerRef = useRef<number | null>(null);
  const previousScrollBehaviorRef = useRef("");
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const setVisualProgress = useCallback((value: number) => {
    const progress = clamp(value, minimumProgress, maximumProgress);
    progressRef.current = progress;
    if (playheadRef.current) {
      const timelineWidth = measurementsRef.current?.width;
      if (timelineWidth) {
        const pixelOffset = timelineWidth * progress / 100;
        playheadRef.current.style.left = "0px";
        playheadRef.current.style.transform = `translate3d(${pixelOffset}px, 0, 0)`;
      } else {
        playheadRef.current.style.left = `${progress}%`;
        playheadRef.current.style.transform = "translate3d(0, 0, 0)";
      }
    }
    if (playheadControlRef.current) {
      playheadControlRef.current.setAttribute("aria-valuenow", String(Math.round(progress)));
      playheadControlRef.current.setAttribute("aria-valuetext", `${timelineSections[activeIndexRef.current].label}, ${Math.round(progress)} percent`);
    }
  }, []);

  const updateActiveIndex = useCallback((index: number) => {
    if (index === activeIndexRef.current) return;
    activeIndexRef.current = index;
    setActiveIndex(index);
  }, []);

  const progressForScroll = useCallback((scrollY: number, measurements: TimelineMeasurements) => {
    const positions = measurements.sectionScrollY;
    if (scrollY <= positions[0]) return minimumProgress;

    const lastIndex = positions.length - 1;
    if (scrollY >= positions[lastIndex]) return maximumProgress;

    let segment = 0;
    while (segment < positions.length - 2 && scrollY > positions[segment + 1]) segment += 1;
    const local = clamp((scrollY - positions[segment]) / Math.max(1, positions[segment + 1] - positions[segment]), 0, 1);
    return timelineSections[segment].marker + (timelineSections[segment + 1].marker - timelineSections[segment].marker) * local;
  }, []);

  const nearestSectionForProgress = useCallback((progress: number) => timelineSections.reduce(
    (best, section, index) => Math.abs(section.marker - progress) < Math.abs(timelineSections[best].marker - progress) ? index : best,
    0,
  ), []);

  const measure = useCallback(() => {
    const timeline = timelineRef.current;
    const track = timeline?.closest<HTMLElement>(".timeline-sticky-track");
    if (!timeline || !track) return;

    const timelineBounds = timeline.getBoundingClientRect();
    const header = document.querySelector<HTMLElement>(".site-header");
    const headerOffset = Math.round(header?.getBoundingClientRect().height ?? 0);
    const timelineHeight = Math.round(timelineBounds.height);
    const breathingSpace = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--timeline-sticky-gap")) || 12;
    const stickyTop = 0;
    const scrollOffset = stickyTop + timelineHeight + breathingSpace;
    const maximumScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const sectionScrollY = timelineSections.map(({ id }) => {
      const section = document.getElementById(id);
      if (!section) return 0;
      const documentTop = getLayoutTop(section);
      return clamp(documentTop - scrollOffset, 0, maximumScroll);
    });
    const trackTop = getLayoutTop(track);
    const trackBottom = trackTop + track.offsetHeight;

    measurementsRef.current = {
      left: timelineBounds.left,
      width: Math.max(1, timelineBounds.width),
      headerOffset,
      timelineHeight,
      stickyStartY: Math.max(0, trackTop - headerOffset),
      stickyEndY: Math.max(0, trackBottom - stickyTop - timelineHeight),
      sectionScrollY,
    };

    const rootStyle = document.documentElement.style;
    rootStyle.setProperty("--timeline-header-offset", `${headerOffset}px`);
    rootStyle.setProperty("--timeline-scroll-offset", `${scrollOffset}px`);
    setVisualProgress(progressRef.current);
  }, [setVisualProgress]);

  const updateStickyState = useCallback((scrollY: number) => {
    const measurements = measurementsRef.current;
    const timeline = timelineRef.current;
    if (!measurements || !timeline) return;

    const stuck = scrollY >= measurements.stickyStartY && scrollY <= measurements.stickyEndY;
    const hideHeader = stuck;
    timeline.classList.toggle("is-stuck", stuck);

    if (hideHeader === headerHiddenRef.current) return;
    headerHiddenRef.current = hideHeader;
    document.documentElement.classList.toggle("timeline-navigation-active", hideHeader);
    const header = document.querySelector<HTMLElement>(".site-header");
    if (hideHeader) header?.setAttribute("inert", "");
    else header?.removeAttribute("inert");
  }, []);

  const updateFromScroll = useCallback(() => {
    scrollFrameRef.current = null;
    if (phaseRef.current === "dragging" || navigationFrameRef.current !== null) return;
    const measurements = measurementsRef.current;
    if (!measurements || measurements.sectionScrollY.some((value, index) => index > 0 && value === 0)) return;

    const scrollY = window.scrollY;
    const progress = progressForScroll(scrollY, measurements);
    const candidate = nearestSectionForProgress(progress);
    const current = activeIndexRef.current;
    const midpoint = current < candidate
      ? (timelineSections[current].marker + timelineSections[Math.min(current + 1, timelineSections.length - 1)].marker) / 2 + 0.45
      : (timelineSections[current].marker + timelineSections[Math.max(current - 1, 0)].marker) / 2 - 0.45;
    const nextIndex = candidate > current && progress < midpoint || candidate < current && progress > midpoint ? current : candidate;

    updateActiveIndex(nextIndex);
    setVisualProgress(progress);
    updateStickyState(scrollY);
  }, [nearestSectionForProgress, progressForScroll, setVisualProgress, updateActiveIndex, updateStickyState]);

  const scheduleScrollUpdate = useCallback(() => {
    if (scrollFrameRef.current !== null || navigationFrameRef.current !== null) return;
    scrollFrameRef.current = window.requestAnimationFrame(updateFromScroll);
  }, [updateFromScroll]);

  const restoreScrollBehavior = useCallback(() => {
    document.documentElement.style.scrollBehavior = previousScrollBehaviorRef.current;
  }, []);

  const cancelNavigation = useCallback(() => {
    if (navigationFrameRef.current !== null) {
      window.cancelAnimationFrame(navigationFrameRef.current);
      navigationFrameRef.current = null;
      restoreScrollBehavior();
    }
    timelineRef.current?.classList.remove("is-navigating");
    if (phaseRef.current === "navigating") phaseRef.current = "idle";
  }, [restoreScrollBehavior]);

  const navigateToSection = useCallback((index: number, duration?: number) => {
    const section = document.getElementById(timelineSections[index].id);
    if (!section) return;
    measure();
    const measurements = measurementsRef.current;
    if (!measurements) return;

    cancelNavigation();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startY = window.scrollY;
    const targetY = measurements.sectionScrollY[index];
    const startProgress = progressRef.current;
    const targetProgress = timelineSections[index].marker;
    const animationDuration = reducedMotion ? 0 : duration ?? clamp(Math.abs(targetY - startY) * 0.12, 420, 850);
    const startTime = performance.now();

    phaseRef.current = "navigating";
    updateActiveIndex(index);
    timelineRef.current?.classList.add("is-navigating");
    previousScrollBehaviorRef.current = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";

    const animate = (now: number) => {
      const elapsed = animationDuration === 0 ? 1 : clamp((now - startTime) / animationDuration, 0, 1);
      const eased = premiumEase(elapsed);
      const nextScrollY = startY + (targetY - startY) * eased;
      window.scrollTo(0, nextScrollY);
      setVisualProgress(startProgress + (targetProgress - startProgress) * eased);
      updateStickyState(nextScrollY);

      if (elapsed < 1) {
        navigationFrameRef.current = window.requestAnimationFrame(animate);
        return;
      }

      navigationFrameRef.current = null;
      restoreScrollBehavior();
      timelineRef.current?.classList.remove("is-navigating");
      phaseRef.current = "idle";
      if (window.location.hash !== `#${timelineSections[index].id}`) window.history.replaceState(null, "", `#${timelineSections[index].id}`);
      scheduleScrollUpdate();
    };

    navigationFrameRef.current = window.requestAnimationFrame(animate);
  }, [cancelNavigation, measure, restoreScrollBehavior, scheduleScrollUpdate, setVisualProgress, updateActiveIndex, updateStickyState]);

  useEffect(() => {
    const handleExternalNavigation = (event: Event) => {
      const targetId = (event as CustomEvent<{ id?: string }>).detail?.id;
      const targetIndex = timelineSections.findIndex(({ id }) => id === targetId);
      if (targetIndex >= 0) navigateToSection(targetIndex);
    };

    window.addEventListener(TIMELINE_NAVIGATE_EVENT, handleExternalNavigation);
    return () => window.removeEventListener(TIMELINE_NAVIGATE_EVENT, handleExternalNavigation);
  }, [navigateToSection]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const readyTimer = window.setTimeout(() => setReady(true), reducedMotion ? 0 : 900);
    const scheduleMeasurement = () => {
      if (resizeTimerRef.current !== null) window.clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = window.setTimeout(() => {
        measure();
        scheduleScrollUpdate();
        resizeTimerRef.current = null;
      }, 120);
    };
    const interruptNavigation = () => cancelNavigation();

    measure();
    scheduleScrollUpdate();
    window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
    window.addEventListener("resize", scheduleMeasurement, { passive: true });
    window.addEventListener("orientationchange", scheduleMeasurement, { passive: true });
    window.addEventListener("wheel", interruptNavigation, { passive: true });
    window.addEventListener("touchstart", interruptNavigation, { passive: true });
    window.addEventListener("load", scheduleMeasurement, { once: true });
    document.fonts?.ready.then(scheduleMeasurement).catch(() => undefined);

    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(scheduleMeasurement);
    const content = document.getElementById("content");
    const header = document.querySelector<HTMLElement>(".site-header");
    if (content) resizeObserver?.observe(content);
    if (header) resizeObserver?.observe(header);

    return () => {
      window.clearTimeout(readyTimer);
      window.removeEventListener("scroll", scheduleScrollUpdate);
      window.removeEventListener("resize", scheduleMeasurement);
      window.removeEventListener("orientationchange", scheduleMeasurement);
      window.removeEventListener("wheel", interruptNavigation);
      window.removeEventListener("touchstart", interruptNavigation);
      window.removeEventListener("load", scheduleMeasurement);
      resizeObserver?.disconnect();
      cancelNavigation();
      if (scrollFrameRef.current !== null) window.cancelAnimationFrame(scrollFrameRef.current);
      if (pointerFrameRef.current !== null) window.cancelAnimationFrame(pointerFrameRef.current);
      if (resizeTimerRef.current !== null) window.clearTimeout(resizeTimerRef.current);
      const rootStyle = document.documentElement.style;
      rootStyle.removeProperty("--timeline-header-offset");
      rootStyle.removeProperty("--timeline-scroll-offset");
      document.documentElement.classList.remove("timeline-navigation-active");
      document.querySelector<HTMLElement>(".site-header")?.removeAttribute("inert");
    };
  }, [cancelNavigation, measure, scheduleScrollUpdate]);

  const progressFromPointer = useCallback((clientX: number) => {
    const measurements = measurementsRef.current;
    if (!measurements) return progressRef.current;
    return clamp(((clientX - measurements.left) / measurements.width) * 100, minimumProgress, maximumProgress);
  }, []);

  const schedulePointerUpdate = useCallback((clientX: number) => {
    latestPointerXRef.current = clientX;
    if (pointerFrameRef.current !== null) return;
    pointerFrameRef.current = window.requestAnimationFrame(() => {
      pointerFrameRef.current = null;
      const progress = progressFromPointer(latestPointerXRef.current);
      updateActiveIndex(nearestSectionForProgress(progress));
      setVisualProgress(progress);
    });
  }, [nearestSectionForProgress, progressFromPointer, setVisualProgress, updateActiveIndex]);

  const beginDrag = useCallback((element: HTMLElement, pointerId: number, clientX: number) => {
    cancelNavigation();
    measure();
    phaseRef.current = "dragging";
    setDragging(true);
    element.setPointerCapture(pointerId);
    schedulePointerUpdate(clientX);
  }, [cancelNavigation, measure, schedulePointerUpdate]);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!ready || event.button !== 0 || !(event.target as HTMLElement).closest(".timeline-playhead-hit")) return;
    pointerStartRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    if (event.pointerType !== "touch") beginDrag(event.currentTarget, event.pointerId, event.clientX);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const pointerStart = pointerStartRef.current;
    if (!pointerStart || pointerStart.id !== event.pointerId) return;

    if (phaseRef.current !== "dragging") {
      const horizontalDistance = Math.abs(event.clientX - pointerStart.x);
      const verticalDistance = Math.abs(event.clientY - pointerStart.y);
      if (verticalDistance > 8 && verticalDistance > horizontalDistance) {
        pointerStartRef.current = null;
        return;
      }
      if (horizontalDistance > 6 && horizontalDistance > verticalDistance * 1.15) beginDrag(event.currentTarget, event.pointerId, event.clientX);
      return;
    }

    if (event.cancelable) event.preventDefault();
    schedulePointerUpdate(event.clientX);
  }

  function finishPointer(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    const wasDragging = phaseRef.current === "dragging";
    pointerStartRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!wasDragging) return;
    setDragging(false);

    if (pointerFrameRef.current !== null) {
      window.cancelAnimationFrame(pointerFrameRef.current);
      pointerFrameRef.current = null;
      const progress = progressFromPointer(event.clientX);
      updateActiveIndex(nearestSectionForProgress(progress));
      setVisualProgress(progress);
    }

    if (cancelled) {
      phaseRef.current = "idle";
      scheduleScrollUpdate();
      return;
    }

    const targetIndex = nearestSectionForProgress(progressRef.current);
    navigateToSection(targetIndex, 320);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
    if (!ready) return;
    const step = event.shiftKey ? 10 : 2;
    let next = progressRef.current;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") next -= step;
    else if (event.key === "ArrowRight" || event.key === "ArrowUp") next += step;
    else if (event.key === "Home") next = minimumProgress;
    else if (event.key === "End") next = maximumProgress;
    else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigateToSection(nearestSectionForProgress(progressRef.current), 320);
      return;
    } else return;

    event.preventDefault();
    phaseRef.current = "dragging";
    setVisualProgress(next);
    updateActiveIndex(nearestSectionForProgress(next));
    phaseRef.current = "idle";
  }

  return (
    <div
      ref={timelineRef}
      className={`hero-timeline hero-reveal${ready ? " is-interactive" : ""}${dragging ? " is-dragging" : ""}`}
      aria-label="Section timeline"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => finishPointer(event)}
      onPointerCancel={(event) => finishPointer(event, true)}
    >
      <div className="timeline-ruler" aria-hidden="true">{timelineRulerTicks.map((tick, index) => <i className={tick.major ? "major" : ""} style={{ left: `${tick.position}%` }} key={index} />)}</div>
      <span className="timeline-clip timeline-clip-a" aria-hidden="true" />
      <span className="timeline-clip timeline-clip-b" aria-hidden="true" />
      <nav className="timeline-section-markers" aria-label="Page sections">
        {timelineSections.map((section, index) => (
          <button className={index === activeIndex ? "is-active" : ""} style={{ left: `${section.marker}%` }} type="button" key={section.id} onClick={() => navigateToSection(index)} aria-label={`Go to ${section.label}`} aria-current={index === activeIndex ? "location" : undefined}>
            <span className="timeline-marker-label">{section.label}</span>
            <span className="timeline-marker-notch" aria-hidden="true" />
          </button>
        ))}
      </nav>
      <span className="timeline-mobile-label" style={{ left: `${timelineSections[activeIndex].marker}%` }} aria-live="polite">{timelineSections[activeIndex].label}</span>
      <span ref={playheadRef} className="timeline-playhead">
        <i aria-hidden="true" />
        <span
          ref={playheadControlRef}
          className="timeline-playhead-hit"
          role="slider"
          tabIndex={ready ? 0 : -1}
          aria-label="Timeline playhead"
          aria-valuemin={minimumProgress}
          aria-valuemax={maximumProgress}
          aria-valuenow={minimumProgress}
          aria-valuetext={`Work, ${minimumProgress} percent`}
          aria-disabled={!ready}
          onKeyDown={handleKeyDown}
        />
      </span>
    </div>
  );
}
