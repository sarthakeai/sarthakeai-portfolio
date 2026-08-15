const dateFormatters = new Map();

export function resolveValidTimeZone(value) {
  if (typeof value !== "string" || value.length === 0 || value.length > 100) return null;

  try {
    return new Intl.DateTimeFormat("en-US", { timeZone: value }).resolvedOptions().timeZone;
  } catch {
    return null;
  }
}

export function getLocalDateKey(date, timeZone) {
  let formatter = dateFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    dateFormatters.set(timeZone, formatter);
  }

  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function countSlotsForLocalToday(startTimes, timeZone, nowMs = Date.now()) {
  const today = getLocalDateKey(new Date(nowMs), timeZone);

  return startTimes.reduce((count, startTime) => {
    const startMs = Date.parse(startTime);
    if (!Number.isFinite(startMs) || startMs <= nowMs) return count;
    return getLocalDateKey(new Date(startMs), timeZone) === today ? count + 1 : count;
  }, 0);
}
