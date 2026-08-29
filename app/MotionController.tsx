"use client";

import { useEffect } from "react";

export function MotionController() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!elements.length) return;
    const revealPendingClass = (element: HTMLElement) => element.tagName === "SECTION" ? "reveal-pending-section-content" : "reveal-pending";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const initialRevealThreshold = window.innerHeight * .9;
    const initiallyVisible: HTMLElement[] = [];
    const pending: HTMLElement[] = [];

    elements.forEach((element) => {
      const group = element.getBoundingClientRect().top <= initialRevealThreshold
        ? initiallyVisible
        : pending;
      group.push(element);
    });

    initiallyVisible.forEach((element) => element.classList.add("is-visible"));
    pending.forEach((element) => element.classList.add(revealPendingClass(element)));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -5%", threshold: 0.04 });
    pending.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return null;
}
