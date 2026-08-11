"use client";

import { useEffect } from "react";

export function MotionController() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!elements.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const pending = elements.filter((element) => {
      if (element.getBoundingClientRect().top <= window.innerHeight * .9) {
        element.classList.add("is-visible");
        return false;
      }
      element.classList.add("reveal-pending");
      return true;
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10%", threshold: 0.08 });
    pending.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return null;
}
