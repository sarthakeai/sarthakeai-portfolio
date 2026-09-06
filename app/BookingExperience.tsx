"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

export const CALENDLY_URL = "https://calendly.com/officialsarthakeai/30min";

const CALENDLY_ORIGIN = new URL(CALENDLY_URL).origin;
const CALENDLY_PRECONNECT_ORIGINS = [CALENDLY_ORIGIN, "https://assets.calendly.com"] as const;

function getCalendlyEmbedUrl() {
  const url = new URL(CALENDLY_URL);
  url.searchParams.set("hide_event_type_details", "1");
  url.searchParams.set("hide_gdpr_banner", "1");
  url.searchParams.set("embed_domain", typeof window === "undefined" ? "sarthakeai.com" : window.location.host);
  url.searchParams.set("embed_type", "Inline");
  return url.toString();
}

function ensureCalendlyPreconnects() {
  CALENDLY_PRECONNECT_ORIGINS.forEach((origin, index) => {
    const id = `calendly-preconnect-${index}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "preconnect";
    link.href = origin;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  });
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

type BookingPhase = "closed" | "open" | "closing";
type CalendarFlow = "calendar" | "details" | "confirmation";

type BookingContextValue = {
  availabilityLabel: string;
  openBooking: (trigger?: HTMLElement | null) => void;
  prepareCalendar: () => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

function useBookingContext() {
  const context = useContext(BookingContext);
  if (!context) throw new Error("Booking controls must be used within BookingProvider");
  return context;
}

export function useBookingAvailability() {
  return useBookingContext().availabilityLabel;
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<BookingPhase>("closed");
  const [calendarPrepared, setCalendarPrepared] = useState(false);
  const [calendarLoaded, setCalendarLoaded] = useState(false);
  const [calendarSlow, setCalendarSlow] = useState(false);
  const [calendarFlow, setCalendarFlow] = useState<CalendarFlow>("calendar");
  const [calendarHeight, setCalendarHeight] = useState<number | null>(null);
  const [calendarSession, setCalendarSession] = useState(0);
  const [availability, setAvailability] = useState<AvailabilityState>({ status: "loading", slots: null });
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const calendarFrameRef = useRef<HTMLIFrameElement>(null);
  const calendarNeedsResetRef = useRef(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const bookingActive = phase !== "closed";
  const availabilityLabel = getAvailabilityLabel(availability);
  const embedUrl = useMemo(() => getCalendlyEmbedUrl(), []);

  const prepareCalendar = useCallback(() => {
    ensureCalendlyPreconnects();
    setCalendarPrepared(true);
  }, []);

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
    returnFocusRef.current = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setCalendarSlow(false);
    setCalendarFlow("calendar");
    setCalendarHeight(null);
    if (calendarNeedsResetRef.current) {
      calendarNeedsResetRef.current = false;
      setCalendarLoaded(false);
      setCalendarSession((current) => current + 1);
    }
    prepareCalendar();
    setPhase("open");
    void refreshAvailability();
  }, [prepareCalendar, refreshAvailability]);

  const closeBooking = useCallback(() => {
    calendarNeedsResetRef.current = true;
    setPhase((current) => {
      if (current === "closed" || current === "closing") return current;
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "closed" : "closing";
    });
  }, []);

  useEffect(() => {
    const initialRequestFrame = window.requestAnimationFrame(() => void refreshAvailability());
    return () => window.cancelAnimationFrame(initialRequestFrame);
  }, [refreshAvailability]);

  useEffect(() => {
    type IdleWindow = Window & typeof globalThis & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    const idleWindow = window as IdleWindow;
    let idleHandle: number | null = null;
    let fallbackTimer: number | null = null;
    let scheduled = false;

    const schedulePreparation = () => {
      if (scheduled) return;
      scheduled = true;
      if (idleWindow.requestIdleCallback) {
        idleHandle = idleWindow.requestIdleCallback(prepareCalendar, { timeout: 3000 });
        return;
      }
      fallbackTimer = window.setTimeout(prepareCalendar, 1400);
    };

    if (document.readyState === "complete") schedulePreparation();
    else window.addEventListener("load", schedulePreparation, { once: true });

    return () => {
      window.removeEventListener("load", schedulePreparation);
      if (idleHandle !== null) idleWindow.cancelIdleCallback?.(idleHandle);
      if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
    };
  }, [prepareCalendar]);

  useEffect(() => {
    if (!bookingActive) return;

    const root = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const scrollbarGap = Math.max(0, window.innerWidth - root.clientWidth);
    const previousRootOverflow = root.style.overflow;
    const previousRootScrollBehavior = root.style.scrollBehavior;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyWidth = body.style.width;
    const previousBodyPaddingRight = body.style.paddingRight;
    const returnFocus = returnFocusRef.current;

    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
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
      document.removeEventListener("keydown", onKeyDown);
      root.style.overflow = previousRootOverflow;
      root.style.scrollBehavior = "auto";
      body.style.overflow = previousBodyOverflow;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.width = previousBodyWidth;
      body.style.paddingRight = previousBodyPaddingRight;
      window.scrollTo(0, scrollY);
      root.style.scrollBehavior = previousRootScrollBehavior;
      returnFocus?.focus({ preventScroll: true });
    };
  }, [bookingActive, closeBooking]);

  useEffect(() => {
    if (phase !== "open" || calendarLoaded) return;
    const fallbackTimer = window.setTimeout(() => setCalendarSlow(true), 8000);
    return () => window.clearTimeout(fallbackTimer);
  }, [calendarLoaded, phase]);

  useEffect(() => {
    const handleCalendlyMessage = (event: MessageEvent) => {
      if (
        event.origin !== CALENDLY_ORIGIN
        || event.source !== calendarFrameRef.current?.contentWindow
        || !event.data
        || typeof event.data !== "object"
      ) return;
      const message = event.data as { event?: unknown; payload?: { height?: unknown } };
      const calendlyEvent = message.event;
      if (calendlyEvent === "calendly.page_height") {
        const nextHeight = Number(message.payload?.height);
        if (Number.isFinite(nextHeight) && nextHeight >= 320 && nextHeight <= 2400) {
          setCalendarHeight(Math.ceil(nextHeight));
        }
        return;
      }
      if (calendlyEvent === "calendly.event_type_viewed") setCalendarFlow("calendar");
      if (calendlyEvent === "calendly.date_and_time_selected") setCalendarFlow("details");
      if (calendlyEvent === "calendly.event_scheduled") {
        setCalendarFlow("confirmation");
        void refreshAvailability(true);
      }
    };

    window.addEventListener("message", handleCalendlyMessage);
    return () => window.removeEventListener("message", handleCalendlyMessage);
  }, [refreshAvailability]);

  const contextValue = useMemo<BookingContextValue>(() => ({
    availabilityLabel,
    openBooking,
    prepareCalendar,
  }), [availabilityLabel, openBooking, prepareCalendar]);

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
      <div
        className="booking-overlay editorial-overlay"
        data-state={phase}
        role="presentation"
        aria-hidden={phase !== "open"}
        inert={phase !== "open" ? true : undefined}
        onTransitionEnd={(event) => {
          if (event.target === event.currentTarget && event.propertyName === "opacity" && phase === "closing") setPhase("closed");
        }}
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) closeBooking();
        }}
      >
        <div
          ref={dialogRef}
          className="booking-dialog editorial-panel"
          role="dialog"
          aria-modal={phase === "open" ? "true" : undefined}
          aria-labelledby="booking-title"
        >
          <span
            className="overlay-focus-sentinel"
            tabIndex={phase === "open" ? 0 : -1}
            onFocus={() => {
              if (calendarFrameRef.current) calendarFrameRef.current.focus();
              else closeButtonRef.current?.focus();
            }}
          />
          <h2 id="booking-title" className="sr-only">Book a 30-minute call with Sarthak</h2>
          <div className="booking-topbar">
            <p className="booking-availability" aria-live="polite">
              <i aria-hidden="true" />
              <span>{availabilityLabel}</span>
            </p>
            <button ref={closeButtonRef} className="booking-close editorial-close" type="button" onClick={closeBooking} aria-label="Close booking calendar">
              <span>Close</span><i aria-hidden="true">[X]</i>
            </button>
          </div>
          <div className="booking-wordmark" aria-hidden="true">Let&rsquo;s connect</div>
          <div className="booking-calendar" data-flow={calendarFlow} data-ready={calendarLoaded ? "true" : "false"} aria-busy={!calendarLoaded}>
            {!calendarLoaded ? <p className="booking-loading" aria-live={phase === "open" ? "polite" : "off"}>Loading calendar&hellip;</p> : null}
            {calendarSlow && phase === "open" ? <p className="booking-fallback">Calendar taking longer than expected. <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">Open Calendly <span aria-hidden="true">↗</span></a></p> : null}
            {calendarPrepared ? (
              <iframe
                key={calendarSession}
                ref={calendarFrameRef}
                src={embedUrl}
                title="Book a 30-minute call with Sarthak"
                loading="eager"
                tabIndex={phase === "open" ? 0 : -1}
                style={calendarHeight ? { "--booking-calendar-height": `${calendarHeight}px` } as CSSProperties : undefined}
                onLoad={() => { setCalendarLoaded(true); setCalendarSlow(false); }}
              />
            ) : null}
          </div>
          <span
            className="overlay-focus-sentinel"
            tabIndex={phase === "open" ? 0 : -1}
            onFocus={() => closeButtonRef.current?.focus()}
          />
        </div>
      </div>
    </BookingContext.Provider>
  );
}

export function BookingTrigger({
  children,
  onClick,
  onFocus,
  onPointerDown,
  onPointerEnter,
  ...props
}: ComponentPropsWithoutRef<"button">) {
  const context = useBookingContext();

  return (
    <button
      type="button"
      {...props}
      onFocus={(event) => {
        onFocus?.(event);
        if (!event.defaultPrevented) context.prepareCalendar();
      }}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (!event.defaultPrevented) context.prepareCalendar();
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (!event.defaultPrevented) context.prepareCalendar();
      }}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.openBooking(event.currentTarget);
      }}
    >
      {children}
    </button>
  );
}
