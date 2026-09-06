"use client";

import { useEffect, useState } from "react";

function suppressThemeTransitions(updateTheme: () => void) {
  const style = document.createElement("style");
  style.textContent = "*,*::before,*::after{transition:none !important}";
  document.head.appendChild(style);
  updateTheme();
  void document.body.offsetHeight;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => style.remove());
  });
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDark(document.documentElement.dataset.theme === "dark"));
    return () => cancelAnimationFrame(frame);
  }, []);

  const toggleTheme = () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    suppressThemeTransitions(() => {
      document.documentElement.dataset.theme = next;
      document.documentElement.style.colorScheme = next;
      localStorage.setItem("theme", next);
      setDark(next === "dark");
    });
  };

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-checked={dark ?? false}
      title={dark ? "Use light theme" : "Use dark theme"}
    >
      <span className="theme-track" aria-hidden="true">
        <i>
          <span className="theme-icon theme-icon-sun"><SunIcon /></span>
          <span className="theme-icon theme-icon-moon"><MoonIcon /></span>
        </i>
      </span>
    </button>
  );
}
