const CALENDLY_API_BASE = "https://api.calendly.com";
const CALENDLY_SCHEDULING_URL = "https://calendly.com/officialsarthakeai/30min";
const CACHE_TTL_MS = 5 * 60 * 1000;
const AVAILABILITY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

type CalendlyUserResponse = {
  resource?: { uri?: string };
};

type CalendlyEventType = {
  active?: boolean;
  name?: string;
  scheduling_url?: string;
  slug?: string;
  uri?: string;
};

type CalendlyEventTypesResponse = {
  collection?: CalendlyEventType[];
};

type CalendlyAvailableTimesResponse = {
  collection?: Array<{ start_time?: string; status?: string }>;
};

type AvailabilityCache = {
  availableSlots: number;
  expiresAt: number;
};

let availabilityCache: AvailabilityCache | null = null;
let cachedEventTypeUri: string | null = null;
let inFlightAvailability: Promise<number> | null = null;

function getServerEnvironment(name: string) {
  return typeof process !== "undefined" ? process.env[name]?.trim() : undefined;
}

async function calendlyGet<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${CALENDLY_API_BASE}${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Calendly ${path.split("?")[0]} returned ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function normalizeSchedulingUrl(value: string | undefined) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname.replace(/\/+$/, "")}`.toLowerCase();
  } catch {
    return value.replace(/\/+$/, "").toLowerCase();
  }
}

async function resolveEventTypeUri(token: string) {
  const configuredUri = getServerEnvironment("CALENDLY_EVENT_TYPE_URI");
  if (configuredUri) return configuredUri;
  if (cachedEventTypeUri) return cachedEventTypeUri;

  const user = await calendlyGet<CalendlyUserResponse>("/users/me", token);
  const userUri = user.resource?.uri;
  if (!userUri) throw new Error("Calendly current user did not include a URI");

  const query = new URLSearchParams({ user: userUri, active: "true", count: "100" });
  const eventTypes = await calendlyGet<CalendlyEventTypesResponse>(`/event_types?${query}`, token);
  const targetUrl = normalizeSchedulingUrl(CALENDLY_SCHEDULING_URL);
  const activeEventTypes = eventTypes.collection?.filter((eventType) => eventType.active !== false) ?? [];
  const match = activeEventTypes.find((eventType) => normalizeSchedulingUrl(eventType.scheduling_url) === targetUrl)
    ?? activeEventTypes.find((eventType) => eventType.slug === "30min");

  if (!match?.uri) {
    throw new Error("Calendly 30-minute event type could not be resolved");
  }

  cachedEventTypeUri = match.uri;
  return match.uri;
}

async function requestAvailableSlotCount(token: string) {
  const eventTypeUri = await resolveEventTypeUri(token);
  const startTime = new Date(Date.now() + 60_000);
  const endTime = new Date(startTime.getTime() + AVAILABILITY_WINDOW_MS);
  const query = new URLSearchParams({
    event_type: eventTypeUri,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
  });
  const availableTimes = await calendlyGet<CalendlyAvailableTimesResponse>(`/event_type_available_times?${query}`, token);
  if (!Array.isArray(availableTimes.collection)) {
    throw new Error("Calendly availability response did not include a collection");
  }
  return availableTimes.collection.length;
}

async function getAvailableSlotCount(token: string, forceRefresh: boolean) {
  const now = Date.now();
  if (!forceRefresh && availabilityCache && availabilityCache.expiresAt > now) {
    return availabilityCache.availableSlots;
  }
  if (!forceRefresh && inFlightAvailability) return inFlightAvailability;

  inFlightAvailability = requestAvailableSlotCount(token)
    .then((availableSlots) => {
      availabilityCache = { availableSlots, expiresAt: Date.now() + CACHE_TTL_MS };
      return availableSlots;
    })
    .finally(() => {
      inFlightAvailability = null;
    });

  return inFlightAvailability;
}

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = getServerEnvironment("CALENDLY_ACCESS_TOKEN");
  if (!token) {
    console.error("[calendly-availability] CALENDLY_ACCESS_TOKEN is not configured");
    return Response.json(
      { availableSlots: null },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const forceRefresh = new URL(request.url).searchParams.get("refresh") === "1";

  try {
    const availableSlots = await getAvailableSlotCount(token, forceRefresh);
    return Response.json(
      { availableSlots },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Calendly availability error";
    console.error(`[calendly-availability] ${message}`);
    return Response.json(
      { availableSlots: null },
      { status: 502, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
