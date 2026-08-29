export const YOUTUBE_CHANNEL_ID = "UCFA48GH6QpjejK8xcIdMz_g";
export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@sarthakeai";
export const YOUTUBE_CACHE_TTL_MS = 60 * 60 * 1000;

export type YouTubeShowcaseVideo = {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  durationSeconds: number;
  viewCount: number;
};

export type YouTubeShowcaseData = {
  channelId: string;
  subscriberCount: number | null;
  videos: YouTubeShowcaseVideo[];
  cachedAt: string;
};

// Most recently verified public channel snapshot. This keeps the section useful
// before the API secret is configured and if YouTube is temporarily unavailable.
export const youtubeFallbackData: YouTubeShowcaseData = {
  channelId: YOUTUBE_CHANNEL_ID,
  subscriberCount: 24_500,
  cachedAt: "2026-08-24T00:00:00.000Z",
  videos: [
    {
      id: "LBFTXoNNu_Q",
      title: "Redmi 12 5G Review: Worth It? (Hindi)",
      publishedAt: "2023-09-18T03:37:00+00:00",
      thumbnail: "https://i.ytimg.com/vi/LBFTXoNNu_Q/maxresdefault.jpg",
      durationSeconds: 334,
      viewCount: 1_700,
    },
    {
      id: "5MWtToYnA00",
      title: "Xiaomi 13 Pro Review: Just Wow! (Hindi)",
      publishedAt: "2023-06-04T04:30:02+00:00",
      thumbnail: "https://i.ytimg.com/vi/5MWtToYnA00/hqdefault.jpg",
      durationSeconds: 759,
      viewCount: 10_000,
    },
    {
      id: "2MW4freUkg8",
      title: "Xiaomi 13 Pro: The Best Value Flagship? Unboxing & Impressions",
      publishedAt: "2023-04-07T06:51:31+00:00",
      thumbnail: "https://i.ytimg.com/vi/2MW4freUkg8/maxresdefault.jpg",
      durationSeconds: 404,
      viewCount: 899,
    },
  ],
};
