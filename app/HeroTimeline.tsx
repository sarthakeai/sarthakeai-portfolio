"use client";

import { useLayoutEffect, useRef } from "react";

const rulerSubdivisions = 36;
const subdivisionsPerMajor = 6;
const introDuration = 1100;
const introEasing = "cubic-bezier(0.22, 1, 0.36, 1)";

function getTickLevel(index: number) {
  if (index % subdivisionsPerMajor === 0) return "major";
  if (index % 2 === 0) return "medium";
  return "minor";
}

type RulerBounds = { left: number; right: number };

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function HeroTimeline() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<SVGSVGElement>(null);
  const clipARef = useRef<HTMLSpanElement>(null);
  const clipBRef = useRef<HTMLSpanElement>(null);
  const playheadRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const timeline = timelineRef.current;
    const ruler = rulerRef.current;
    const clipA = clipARef.current;
    const clipB = clipBRef.current;
    const playhead = playheadRef.current;
    if (!timeline || !ruler || !clipA || !clipB || !playhead) return;
    const visibleTimeline = timeline.closest<HTMLElement>(".hero") ?? timeline;

    let bounds: RulerBounds = { left: 0, right: 0 };
    let normalizedPosition = 0;
    let pointerId: number | null = null;
    let pointerOffset = 0;
    let pendingPosition: number | null = null;
    let positionFrame: number | null = null;
    let introAnimation: Animation | null = null;
    let introComplete = false;
    let manualMode = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const xForPosition = (position: number) => bounds.left + clamp(position) * Math.max(0, bounds.right - bounds.left);

    const setPosition = (position: number) => {
      normalizedPosition = clamp(position);
      timeline.style.setProperty("--playhead-x", `${xForPosition(normalizedPosition)}px`);
    };

    const readBounds = () => {
      const timelineRect = timeline.getBoundingClientRect();
      const rulerRect = ruler.getBoundingClientRect();
      const visibleTimelineRect = visibleTimeline.getBoundingClientRect();
      const visibleLeft = Math.max(rulerRect.left, visibleTimelineRect.left, 0);
      const visibleRight = Math.min(rulerRect.right, visibleTimelineRect.right, document.documentElement.clientWidth);
      const triangleWidth = Number.parseFloat(getComputedStyle(playhead, "::before").width) || 0;
      const halfTriangle = triangleWidth / 2;
      return {
        left: visibleLeft - timelineRect.left + halfTriangle,
        right: visibleRight - timelineRect.left - halfTriangle,
      };
    };

    const positionAtClipSeam = () => {
      const clipAStyle = getComputedStyle(clipA);
      const clipBStyle = getComputedStyle(clipB);
      const clipARight = Number.parseFloat(clipAStyle.left) + Number.parseFloat(clipAStyle.width);
      const clipBLeft = Number.parseFloat(clipBStyle.left);
      const seamX = (clipARight + clipBLeft) / 2;
      const range = Math.max(1, bounds.right - bounds.left);
      return clamp((seamX - bounds.left) / range);
    };

    const stopIntroAtCurrentPosition = () => {
      if (!introAnimation) return;
      const timelineRect = timeline.getBoundingClientRect();
      const playheadRect = playhead.getBoundingClientRect();
      const currentX = playheadRect.left + playheadRect.width / 2 - timelineRect.left;
      const range = Math.max(1, bounds.right - bounds.left);
      const currentPosition = clamp((currentX - bounds.left) / range);
      introAnimation.cancel();
      introAnimation = null;
      setPosition(currentPosition);
    };

    const startIntro = (fromPosition = 0) => {
      const targetPosition = positionAtClipSeam();
      if (reducedMotion) {
        setPosition(targetPosition);
        playhead.classList.add("is-initialized");
        introComplete = true;
        return;
      }
      const fromX = xForPosition(fromPosition);
      const toX = xForPosition(targetPosition);
      setPosition(fromPosition);
      const animation = playhead.animate(
        [
          { transform: `translate3d(${fromX}px, 0, 0)` },
          { transform: `translate3d(${toX}px, 0, 0)` },
        ],
        { duration: introDuration * Math.max(.2, Math.abs(targetPosition - fromPosition) / Math.max(targetPosition, .01)), easing: introEasing, fill: "forwards" },
      );
      introAnimation = animation;
      playhead.classList.add("is-initialized");
      animation.finished.then(() => {
        if (introAnimation !== animation) return;
        setPosition(targetPosition);
        animation.cancel();
        introAnimation = null;
        introComplete = true;
      }).catch(() => undefined);
    };

    const renderPendingPosition = () => {
      positionFrame = null;
      if (pendingPosition !== null) setPosition(pendingPosition);
    };

    const queuePointerPosition = (clientX: number) => {
      const timelineRect = timeline.getBoundingClientRect();
      const pointerX = clientX - timelineRect.left - pointerOffset;
      const range = Math.max(1, bounds.right - bounds.left);
      pendingPosition = clamp((pointerX - bounds.left) / range);
      if (positionFrame === null) positionFrame = requestAnimationFrame(renderPendingPosition);
    };

    const finishDrag = (event: globalThis.PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      queuePointerPosition(event.clientX);
      if (positionFrame !== null) {
        cancelAnimationFrame(positionFrame);
        renderPendingPosition();
      }
      if (playhead.hasPointerCapture(event.pointerId)) playhead.releasePointerCapture(event.pointerId);
      playhead.classList.remove("is-dragging");
      pointerId = null;
    };

    const handlePointerDown = (event: globalThis.PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      stopIntroAtCurrentPosition();
      manualMode = true;
      const playheadRect = playhead.getBoundingClientRect();
      pointerId = event.pointerId;
      pointerOffset = event.clientX - (playheadRect.left + playheadRect.width / 2);
      playhead.classList.add("is-dragging");
      playhead.setPointerCapture(event.pointerId);
      queuePointerPosition(event.clientX);
    };

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      if (event.pointerId === pointerId) queuePointerPosition(event.clientX);
    };

    const handleResize = () => {
      const nextBounds = readBounds();
      const boundsChanged = Math.abs(nextBounds.left - bounds.left) > .5 || Math.abs(nextBounds.right - bounds.right) > .5;
      if (!boundsChanged) return;
      const wasAnimating = Boolean(introAnimation);
      if (wasAnimating) stopIntroAtCurrentPosition();
      bounds = nextBounds;
      if (manualMode) {
        setPosition(normalizedPosition);
      } else if (introComplete) {
        setPosition(positionAtClipSeam());
      } else {
        setPosition(normalizedPosition);
        if (wasAnimating) startIntro(normalizedPosition);
      }
    };

    bounds = readBounds();
    setPosition(0);
    startIntro(0);

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(ruler);
    resizeObserver.observe(visibleTimeline);
    playhead.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      resizeObserver.disconnect();
      playhead.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
      window.removeEventListener("orientationchange", handleResize);
      if (positionFrame !== null) cancelAnimationFrame(positionFrame);
      introAnimation?.cancel();
      playhead.classList.remove("is-initialized", "is-dragging");
    };
  }, []);

  return (
    <div ref={timelineRef} className="hero-timeline hero-reveal" aria-hidden="true">
      <svg ref={rulerRef} className="timeline-ruler" viewBox={`0 0 ${rulerSubdivisions} 100`} preserveAspectRatio="none" focusable="false">
        {Array.from({ length: rulerSubdivisions }, (_, index) => {
          const level = getTickLevel(index);
          const top = level === "major" ? 19 : level === "medium" ? 52 : 69;
          const x = index + .5;
          return <line className={`timeline-tick ${level}`} x1={x} x2={x} y1={top} y2="100" key={index} />;
        })}
      </svg>
      <span ref={clipARef} className="timeline-clip timeline-clip-a" />
      <span ref={clipBRef} className="timeline-clip timeline-clip-b" />
      <span ref={playheadRef} className="timeline-playhead"><i /></span>
    </div>
  );
}
