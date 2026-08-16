"use client";

import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type TimelineStyle = CSSProperties & { "--playhead-position"?: string };

export function HeroTimeline() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState<number | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setReady(true), reducedMotion ? 0 : 1200);
    return () => window.clearTimeout(timer);
  }, []);

  const clampPosition = useCallback((value: number) => Math.min(97, Math.max(3, value)), []);

  const currentPosition = useCallback(() => {
    if (position !== null) return position;
    const timeline = timelineRef.current;
    if (!timeline) return 58;
    const computed = Number.parseFloat(getComputedStyle(timeline).getPropertyValue("--playhead-position"));
    return Number.isFinite(computed) ? computed : 58;
  }, [position]);

  const moveToPointer = useCallback((clientX: number) => {
    const timeline = timelineRef.current;
    if (!timeline) return;
    const bounds = timeline.getBoundingClientRect();
    setPosition(clampPosition(((clientX - bounds.left) / bounds.width) * 100));
  }, [clampPosition]);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!ready) return;
    draggingRef.current = true;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    moveToPointer(event.clientX);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (draggingRef.current) moveToPointer(event.clientX);
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>) {
    draggingRef.current = false;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!ready) return;
    const step = event.shiftKey ? 10 : 2;
    let next = currentPosition();
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") next -= step;
    else if (event.key === "ArrowRight" || event.key === "ArrowUp") next += step;
    else if (event.key === "Home") next = 3;
    else if (event.key === "End") next = 97;
    else return;
    event.preventDefault();
    setPosition(clampPosition(next));
  }

  const style: TimelineStyle | undefined = position === null
    ? undefined
    : { "--playhead-position": `${position}%` };

  return (
    <div
      ref={timelineRef}
      className={`hero-timeline hero-reveal${ready ? " is-interactive" : ""}${dragging ? " is-dragging" : ""}`}
      style={style}
      role="slider"
      tabIndex={ready ? 0 : -1}
      aria-label="Editing timeline playhead"
      aria-valuemin={3}
      aria-valuemax={97}
      aria-valuenow={Math.round(position ?? 58)}
      aria-valuetext={position === null ? "At the edit point" : `${Math.round(position)} percent`}
      aria-disabled={!ready}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onKeyDown={handleKeyDown}
    >
      <div className="timeline-ruler" aria-hidden="true">
        {Array.from({ length: 35 }, (_, index) => (
          <i className={index % 5 === 0 ? "major" : index % 2 === 0 ? "mid" : ""} key={index} />
        ))}
      </div>
      <span className="timeline-clip timeline-clip-a" aria-hidden="true" />
      <span className="timeline-clip timeline-clip-b" aria-hidden="true" />
      <span className="timeline-playhead" aria-hidden="true"><i /></span>
    </div>
  );
}
