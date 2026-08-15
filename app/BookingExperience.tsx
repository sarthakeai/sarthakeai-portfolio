"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

export const CALENDLY_URL = "https://calendly.com/officialsarthakeai/30min";
export const CALENDLY_BOOKING_COMPLETE_EVENT = "calendly:booking-complete";

function getCalendlyEmbedUrl(dark: boolean) {
  const colors = dark
    ? "background_color=161614&text_color=f2efe7&primary_color=ff0000"
    : "background_color=ffffff&text_color=191917&primary_color=ec3d2f";
  return `${CALENDLY_URL}?hide_gdpr_banner=1&${colors}`;
}

type BookingContextValue = {
  openBooking: (trigger?: HTMLElement | null) => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [calendarLoaded, setCalendarLoaded] = useState(false);
  const [calendarSlow, setCalendarSlow] = useState(false);
  const [darkCalendar, setDarkCalendar] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const openBooking = useCallback((trigger?: HTMLElement | null) => {
    returnFocusRef.current = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setCalendarLoaded(false);
    setCalendarSlow(false);
    setDarkCalendar(document.documentElement.dataset.theme === "dark");
    setOpen(true);
  }, []);

  const closeBooking = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousTouchAction = body.style.touchAction;
    const returnFocus = returnFocusRef.current;

    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";

    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeBooking();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], iframe, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.touchAction = previousTouchAction;
      document.removeEventListener("keydown", onKeyDown);
      returnFocus?.focus({ preventScroll: true });
    };
  }, [closeBooking, open]);

  useEffect(() => {
    if (!open || calendarLoaded) return;
    const fallbackTimer = window.setTimeout(() => setCalendarSlow(true), 8000);
    return () => window.clearTimeout(fallbackTimer);
  }, [calendarLoaded, open]);

  useEffect(() => {
    const handleCalendlyMessage = (event: MessageEvent) => {
      if (event.origin !== new URL(CALENDLY_URL).origin) return;
      if (!event.data || typeof event.data !== "object") return;
      if ((event.data as { event?: unknown }).event !== "calendly.event_scheduled") return;
      window.dispatchEvent(new Event(CALENDLY_BOOKING_COMPLETE_EVENT));
    };

    window.addEventListener("message", handleCalendlyMessage);
    return () => window.removeEventListener("message", handleCalendlyMessage);
  }, []);

  return (
    <BookingContext.Provider value={{ openBooking }}>
      {children}
      {open ? (
        <div
          className="booking-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeBooking();
          }}
        >
          <div
            ref={dialogRef}
            className="booking-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
          >
            <div className="booking-head">
              <div>
                <p className="kicker">Book a call</p>
                <h2 id="booking-title">Let&rsquo;s connect.</h2>
              </div>
              <button ref={closeButtonRef} className="booking-close" type="button" onClick={closeBooking} aria-label="Close booking calendar">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="booking-calendar" aria-busy={!calendarLoaded}>
              {!calendarLoaded ? <p className="booking-loading" aria-live="polite">Loading calendar&hellip;</p> : null}
              {calendarSlow ? <p className="booking-fallback">Calendar taking longer than expected. <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">Open Calendly <span aria-hidden="true">↗</span></a></p> : null}
              <iframe
                src={getCalendlyEmbedUrl(darkCalendar)}
                title="Book a 30-minute call with Sarthak"
                loading="eager"
                onLoad={() => { setCalendarLoaded(true); setCalendarSlow(false); }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </BookingContext.Provider>
  );
}

export function BookingTrigger({ children, onClick, ...props }: ComponentPropsWithoutRef<"button">) {
  const context = useContext(BookingContext);
  if (!context) throw new Error("BookingTrigger must be used within BookingProvider");

  return (
    <button
      type="button"
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.openBooking(event.currentTarget);
      }}
    >
      {children}
    </button>
  );
}
