"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const email = "officialsarthakeai@gmail.com";

export function EmailShortcut() {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | null>(null);

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.key.toLowerCase() !== "e") return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest("input, textarea, select, [contenteditable='true']"))) return;
      event.preventDefault();
      void copyEmail();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    };
  }, [copyEmail]);

  return (
    <button className="email-shortcut" type="button" onClick={() => void copyEmail()} aria-label="Copy email address">
      <span aria-live="polite">{copied ? "Copied ✓" : <>Press <kbd>E</kbd> to copy email</>}</span>
    </button>
  );
}
