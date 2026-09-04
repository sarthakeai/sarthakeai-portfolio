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
const BOOKING_EXIT_MS = 280;

function getCalendlyEmbedUrl() {
  const url = new URL(CALENDLY_URL);
  url.searchParams.set("hide_event_type_details", "1");
  url.searchParams.set("hide_gdpr_banner", "1");
  return url.toString();
}

type AvailabilityState =
  | { status: "loading"; slots: null }
  | { status: "ready"; slots: number }
  | { status: "error"; slots: null };

function getAvailabilityLabel(availability: AvailabilityState) {
  if (availability.status === "loading") return "Checking availability";
  if (availability.status === "error") return "View availability";
  if (availability.slots === 0) return "Today’s slots filled";
  return `${availability.slots} ${availability.slots === 1 ? "slot" : "slots"} left today`;
}

function getVisitorTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

type BookingContextValue = {
  openBooking: (trigger?: HTMLElement | null) => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [present, setPresent] = useState(false);
  const [calendarLoaded, setCalendarLoaded] = useState(false);
  const [calendarSlow, setCalendarSlow] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityState>({ status: "loading", slots: null });
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const availabilityLabel = getAvailabilityLabel(availability);

  const refreshAvailability = useCallback(async (forceRefresh = false) => {
    setAvailability({ status: "loading", slots: null });

    try {
      const query = new URLSearchParams({ timeZone: getVisitorTimeZone() });
      if (forceRefresh) query.set("refresh", "1");
      const response = await fetch(`/api/calendly-availability?${query}`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Calendly availability request failed");

      const payload = await response.json() as { availableSlots?: unknown };
      if (!Number.isInteger(payload.availableSlots) || Number(payload.availableSlots) < 0) {
        throw new Error("Calendly availability response was invalid");
      }
      setAvailability({ status: "ready", slots: Number(payload.availableSlots) });
    } catch {
      setAvailability({ status: "error", slots: null });
    }
  }, []);

  const openBooking = useCallback((trigger?: HTMLElement | null) => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    returnFocusRef.current = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setCalendarLoaded(false);
    setCalendarSlow(false);
    setPresent(true);
    setOpen(true);
    void refreshAvailability();
  }, [refreshAvailability]);

  const closeBooking = useCallback(() => {
    setOpen(false);
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setPresent(false);
      return;
    }
    closeTimerRef.current = window.setTimeout(() => {
      setPresent(false);
      closeTimerRef.current = null;
    }, BOOKING_EXIT_MS);
  }, []);

  useEffect(() => () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
  }, []);

  useEffect(() => {
    if (!present) return;

    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPaddingRight = body.style.paddingRight;
    const returnFocus = returnFocusRef.current;
    const scrollbarGap = Math.max(0, window.innerWidth - root.clientWidth);

    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbarGap > 0) body.style.paddingRight = `${scrollbarGap}px`;

    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus({ preventScroll: true }));
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
      body.style.paddingRight = previousBodyPaddingRight;
      document.removeEventListener("keydown", onKeyDown);
      returnFocus?.focus({ preventScroll: true });
    };
  }, [closeBooking, present]);

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
      void refreshAvailability(true);
    };

    window.addEventListener("message", handleCalendlyMessage);
    return () => window.removeEventListener("message", handleCalendlyMessage);
  }, [refreshAvailability]);

  return (
    <BookingContext.Provider value={{ openBooking }}>
      {children}
      {present ? (
        <div
          className="booking-overlay"
          data-state={open ? "open" : "closed"}
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
            <h2 id="booking-title" className="sr-only">Book a 30-minute call with Sarthak</h2>
            <div className="booking-topbar">
              <p className="booking-availability" aria-live="polite">
                <i aria-hidden="true" />
                <span>{availabilityLabel}</span>
              </p>
              <button ref={closeButtonRef} className="booking-close" type="button" onClick={closeBooking} aria-label="Close booking calendar">
                <span>Close</span> <i aria-hidden="true">[X]</i>
              </button>
            </div>
            <div className="booking-wordmark" aria-hidden="true"><span>Let&rsquo;s</span><span>Connect</span></div>
            <div className="booking-calendar" aria-busy={!calendarLoaded}>
              {!calendarLoaded ? <p className="booking-loading" aria-live="polite">Loading calendar&hellip;</p> : null}
              {calendarSlow ? <p className="booking-fallback">Calendar taking longer than expected. <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">Open Calendly <span aria-hidden="true">↗</span></a></p> : null}
              <iframe
                src={getCalendlyEmbedUrl()}
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
