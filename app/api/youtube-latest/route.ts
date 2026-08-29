import {
  YOUTUBE_CACHE_TTL_MS,
  YOUTUBE_CHANNEL_ID,
  youtubeFallbackData,
  type YouTubeShowcaseData,
  type YouTubeShowcaseVideo,
} from "../../youtube-data";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const RECENT_UPLOAD_LIMIT = 25;
const LONG_FORM_MIN_SECONDS = 180;
const STALE_CACHE_TTL_SECONDS = 24 * 60 * 60;

type YouTubeChannelResponse = {
  items?: Array<{
    contentDetails?: { relatedPlaylists?: { uploads?: string } };
    statistics?: { hiddenSubscriberCount?: boolean; subscriberCount?: string };
  }>;
};

type YouTubePlaylistItemsResponse = {
  items?: Array<{ contentDetails?: { videoId?: string } }>;
};

type YouTubeVideoResponse = {
  items?: Array<{
    id?: string;
    snippet?: {
      liveBroadcastContent?: "none" | "live" | "upcoming";
      publishedAt?: string;
      title?: string;
      thumbnails?: Record<string, { url?: string; width?: number; height?: number }>;
    };
    contentDetails?: { duration?: string };
    statistics?: { viewCount?: string };
    status?: { privacyStatus?: string; uploadStatus?: string };
  }>;
};

type CachedYouTubeData = YouTubeShowcaseData & { cachedAt: string };

let memoryCache: CachedYouTubeData | null = null;
let inFlightRequest: Promise<CachedYouTubeData> | null = null;

function getServerApiKey() {
  const value = process.env.YOUTUBE_API_KEY;
  return typeof value === "string" ? value.trim() : "";
}

function parseIsoDuration(value: string | undefined) {
  if (!value) return 0;
  const match = value.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/);
  if (!match) return 0;
  const days = Number(match[1] ?? 0);
  const hours = Number(match[2] ?? 0);
  const minutes = Number(match[3] ?? 0);
  const seconds = Number(match[4] ?? 0);
  return (((days * 24) + hours) * 60 + minutes) * 60 + seconds;
}

function chooseThumbnail(thumbnails: YouTubeVideoResponse["items"] extends Array<infer Item>
  ? Item extends { snippet?: { thumbnails?: infer T } } ? T : never
  : never) {
  if (!thumbnails || typeof thumbnails !== "object") return "";
  const candidates = Object.values(thumbnails).filter((thumbnail) => Boolean(thumbnail?.url));
  candidates.sort((a, b) => ((b.width ?? 0) * (b.height ?? 0)) - ((a.width ?? 0) * (a.height ?? 0)));
  return candidates[0]?.url ?? "";
}

async function youtubeGet<T>(path: string, params: Record<string, string>, apiKey: string): Promise<T> {
  const query = new URLSearchParams({ ...params, key: apiKey });
  const response = await fetch(`${YOUTUBE_API_BASE}/${path}?${query}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`YouTube ${path} returned ${response.status}`);
  return response.json() as Promise<T>;
}

async function requestLatestYouTubeData(apiKey: string): Promise<CachedYouTubeData> {
  const channel = await youtubeGet<YouTubeChannelResponse>("channels", {
    part: "contentDetails,statistics",
    id: YOUTUBE_CHANNEL_ID,
  }, apiKey);
  const channelItem = channel.items?.[0];
  const uploadsPlaylistId = channelItem?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) throw new Error("YouTube channel uploads playlist was unavailable");

  const uploads = await youtubeGet<YouTubePlaylistItemsResponse>("playlistItems", {
    part: "contentDetails",
    playlistId: uploadsPlaylistId,
    maxResults: String(RECENT_UPLOAD_LIMIT),
  }, apiKey);
  const videoIds = (uploads.items ?? [])
    .map((item) => item.contentDetails?.videoId)
    .filter((videoId): videoId is string => Boolean(videoId));
  if (videoIds.length === 0) throw new Error("YouTube uploads playlist did not contain videos");

  const metadata = await youtubeGet<YouTubeVideoResponse>("videos", {
    part: "snippet,contentDetails,statistics,status",
    id: videoIds.join(","),
  }, apiKey);
  const metadataById = new Map((metadata.items ?? []).map((video) => [video.id, video] as const));

  const videos = videoIds.flatMap((id): YouTubeShowcaseVideo[] => {
    const video = metadataById.get(id);
    const durationSeconds = parseIsoDuration(video?.contentDetails?.duration);
    const thumbnail = chooseThumbnail(video?.snippet?.thumbnails);
    if (
      !video?.snippet?.title
      || !video.snippet.publishedAt
      || !thumbnail
      || durationSeconds <= LONG_FORM_MIN_SECONDS
      || video.snippet.liveBroadcastContent !== "none"
      || video.status?.privacyStatus !== "public"
      || (video.status.uploadStatus && video.status.uploadStatus !== "processed")
    ) return [];

    return [{
      id,
      title: video.snippet.title,
      publishedAt: video.snippet.publishedAt,
      thumbnail,
      durationSeconds,
      viewCount: Number(video.statistics?.viewCount ?? 0),
    }];
  }).slice(0, 3);

  if (videos.length < 3) throw new Error("YouTube did not return three qualifying long-form uploads");

  const subscriberCount = channelItem?.statistics?.hiddenSubscriberCount
    ? null
    : Number(channelItem?.statistics?.subscriberCount ?? 0) || null;

  return {
    channelId: YOUTUBE_CHANNEL_ID,
    subscriberCount,
    videos,
    cachedAt: new Date().toISOString(),
  };
}

function getEdgeCache() {
  if (typeof caches === "undefined" || !("default" in caches)) return null;
  return (caches as CacheStorage & { default: Cache }).default;
}

type YouTubeDataSource = "api" | "cache" | "stale" | "fallback";

function getPublicResponse(data: YouTubeShowcaseData, source: YouTubeDataSource) {
  return Response.json(data, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      "X-YouTube-Data-Source": source,
    },
  });
}

async function updateData(apiKey: string) {
  if (inFlightRequest) return inFlightRequest;
  inFlightRequest = requestLatestYouTubeData(apiKey)
    .then((data) => {
      memoryCache = data;
      return data;
    })
    .finally(() => {
      inFlightRequest = null;
    });
  return inFlightRequest;
}

export const dynamic = "force-dynamic";

export async function loadYouTubeShowcaseData(): Promise<{ data: YouTubeShowcaseData; source: YouTubeDataSource }> {
  const apiKey = getServerApiKey();
  if (!apiKey) return { data: youtubeFallbackData, source: "fallback" };

  const now = Date.now();
  if (memoryCache && now - Date.parse(memoryCache.cachedAt) < YOUTUBE_CACHE_TTL_MS) {
    return { data: memoryCache, source: "cache" };
  }

  const edgeCache = getEdgeCache();
  const cacheKey = new Request("https://sarthakeai.com/api/youtube-latest", { method: "GET" });
  let staleData: CachedYouTubeData | null = memoryCache;

  if (edgeCache) {
    try {
      const cachedResponse = await edgeCache.match(cacheKey);
      if (cachedResponse) {
        const cachedData = await cachedResponse.json() as CachedYouTubeData;
        staleData = cachedData;
        if (now - Date.parse(cachedData.cachedAt) < YOUTUBE_CACHE_TTL_MS) {
          memoryCache = cachedData;
          return { data: cachedData, source: "cache" };
        }
      }
    } catch (error) {
      console.error("[youtube-latest] Edge cache read failed", error);
    }
  }

  try {
    const data = await updateData(apiKey);
    if (edgeCache) {
      const cacheResponse = Response.json(data, {
        headers: { "Cache-Control": `public, max-age=${STALE_CACHE_TTL_SECONDS}` },
      });
      try {
        await edgeCache.put(cacheKey, cacheResponse);
      } catch (error) {
        console.error("[youtube-latest] Edge cache write failed", error);
      }
    }
    return { data, source: "api" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown YouTube data error";
    console.error(`[youtube-latest] ${message}`);
    if (staleData) return { data: staleData, source: "stale" };
    return { data: youtubeFallbackData, source: "fallback" };
  }
}

export async function GET() {
  const { data, source } = await loadYouTubeShowcaseData();
  return getPublicResponse(data, source);
}
