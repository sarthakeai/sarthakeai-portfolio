"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDark(document.documentElement.dataset.theme === "dark"));
    return () => cancelAnimationFrame(frame);
  }, []);

  const toggleTheme = () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    localStorage.setItem("theme", next);
    setDark(next === "dark");
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
        <span className="theme-icon theme-icon-sun">☀</span>
        <span className="theme-icon theme-icon-moon">☾</span>
        <i />
      </span>
    </button>
  );
}
