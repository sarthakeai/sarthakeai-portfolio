"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setDark(root.dataset.theme === "dark");
    const followSystem = () => {
      if (!localStorage.getItem("theme")) {
        root.dataset.theme = media.matches ? "dark" : "light";
        sync();
      }
    };
    sync();
    media.addEventListener("change", followSystem);
    return () => media.removeEventListener("change", followSystem);
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
      aria-label="Change colour theme"
      aria-pressed={dark ?? undefined}
      title={dark ? "Use light theme" : "Use dark theme"}
    >
      <span className="theme-track" aria-hidden="true"><i /></span>
    </button>
  );
}
