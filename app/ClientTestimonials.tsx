"use client";

/* eslint-disable @next/next/no-img-element -- The testimonial portrait is pre-compressed and served responsively without the Next image runtime. */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex -- The carousel region is deliberately focusable for scoped arrow-key navigation. */

import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { clientTestimonials, type ClientTestimonial } from "./testimonials-data";

type Direction = 1 | -1;

function TestimonialSlide({
  testimonial,
  className = "",
  slideRef,
  onAnimationEnd,
  controls,
  ariaHidden = false,
}: {
  testimonial: ClientTestimonial;
  className?: string;
  slideRef?: React.Ref<HTMLElement>;
  onAnimationEnd?: React.AnimationEventHandler<HTMLElement>;
  controls: ReactNode;
  ariaHidden?: boolean;
}) {
  return (
    <article
      ref={slideRef}
      className={`testimonial-slide${testimonial.image ? " has-image" : " is-text-only"}${className}`}
      onAnimationEnd={onAnimationEnd}
      aria-label={`${testimonial.name} testimonial`}
      aria-hidden={ariaHidden}
    >
      {testimonial.image ? (
        <figure className="testimonial-portrait">
          <img
            src={testimonial.image.src}
            alt={testimonial.image.alt}
            width={testimonial.image.width}
            height={testimonial.image.height}
            sizes="(max-width: 50rem) calc(100vw - 2.5rem), (max-width: 74rem) 38vw, 30rem"
            loading="lazy"
            decoding="async"
          />
        </figure>
      ) : null}

      <div className="testimonial-copy">
        <blockquote>
          <p className="testimonial-pull">“{testimonial.pullQuote}”</p>
          <p className="testimonial-body">{testimonial.fullQuote}</p>
        </blockquote>

        <footer className="testimonial-footer">
          <div className="testimonial-attribution">
            <cite>{testimonial.name}</cite>
            <span>{testimonial.role}</span>
          </div>
          {controls}
        </footer>
      </div>
    </article>
  );
}

export function ClientTestimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<Direction>(1);
  const [stageHeight, setStageHeight] = useState<number | null>(null);
  const activeSlideRef = useRef<HTMLElement>(null);
  const nextSlideRef = useRef<HTMLElement>(null);
  const resizeFrameRef = useRef<number | null>(null);

  const move = useCallback((nextDirection: Direction) => {
    if (nextIndex !== null) return;
    setStageHeight(activeSlideRef.current?.offsetHeight ?? null);
    setDirection(nextDirection);
    setNextIndex((activeIndex + nextDirection + clientTestimonials.length) % clientTestimonials.length);
  }, [activeIndex, nextIndex]);

  useLayoutEffect(() => {
    if (nextIndex === null || !nextSlideRef.current) return;
    const nextHeight = nextSlideRef.current.scrollHeight;
    resizeFrameRef.current = window.requestAnimationFrame(() => setStageHeight(nextHeight));
    return () => {
      if (resizeFrameRef.current !== null) window.cancelAnimationFrame(resizeFrameRef.current);
    };
  }, [nextIndex]);

  const finishTransition = () => {
    if (nextIndex === null) return;
    setActiveIndex(nextIndex);
    setNextIndex(null);
    window.requestAnimationFrame(() => setStageHeight(null));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
  };

  const activeTestimonial = clientTestimonials[activeIndex];
  const pendingTestimonial = nextIndex === null ? null : clientTestimonials[nextIndex];
  const controls = (interactive: boolean) => (
    <div className="testimonial-controls" aria-label={interactive ? "Testimonial navigation" : undefined} aria-hidden={!interactive}>
      <button type="button" onClick={() => move(-1)} aria-label="Previous testimonial" disabled={!interactive || nextIndex !== null} tabIndex={interactive ? 0 : -1}>
        <span aria-hidden="true">←</span>
      </button>
      <button type="button" onClick={() => move(1)} aria-label="Next testimonial" disabled={!interactive || nextIndex !== null} tabIndex={interactive ? 0 : -1}>
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );

  return (
    <section className="section client-testimonials" aria-labelledby="client-testimonials-title" data-reveal>
      <header className="testimonials-intro">
        <p className="kicker">Client testimonials</p>
        <h2 id="client-testimonials-title">What clients say.</h2>
      </header>

      {/* The focused carousel region owns left/right navigation without stealing ordinary page keys. */}
      <div
        className="testimonials-carousel"
        role="region"
        aria-roledescription="carousel"
        aria-label="Client testimonials"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div
          className={`testimonials-stage${nextIndex !== null ? " is-transitioning" : ""}`}
          style={stageHeight === null ? undefined : { height: `${stageHeight}px` }}
          aria-live="polite"
        >
          <TestimonialSlide
            testimonial={activeTestimonial}
            slideRef={activeSlideRef}
            className={nextIndex === null ? " is-active" : direction === 1 ? " is-exiting-left" : " is-exiting-right"}
            controls={controls(nextIndex === null)}
          />
          {pendingTestimonial ? (
            <TestimonialSlide
              testimonial={pendingTestimonial}
              slideRef={nextSlideRef}
              className={direction === 1 ? " is-entering-right" : " is-entering-left"}
              onAnimationEnd={finishTransition}
              controls={controls(false)}
              ariaHidden
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
