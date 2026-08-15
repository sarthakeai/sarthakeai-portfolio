type ProjectBase = {
  id: string;
  title: string;
  client?: string;
  category: string;
  contentType: string;
  description: string;
  roles: string[];
  deliverables?: string[];
  result?: { value: string; label: string };
  artLabel: string;
  tone: string;
  ratio: "portrait" | "wide" | "square";
  featured?: boolean;
  layout?: "large" | "small" | "centered";
  media?: ProjectMedia[];
  externalUrl?: string;
  caseStudySlug?: string;
};

export type ProjectMedia = {
  id: string;
  title: string;
  videoUrl?: string;
  externalUrl?: string;
  poster: string;
  posterFallbacks?: string[];
  width: number;
  height: number;
  featured?: boolean;
};

export type Project = ProjectBase;

// Real portfolio projects. Optimized website copies live under public/work;
// original masters remain outside the site project.
export const projects: Project[] = [
  {
    id: "swan-bitcoin",
    title: "Swan Bitcoin short-form",
    client: "Swan Bitcoin",
    category: "Short-form / Social",
    contentType: "10 selected edits",
    description: "Ten vertical edits cut from interviews and talks, with captions, visual cutaways and tight pacing.",
    roles: ["Editing", "Captions", "Motion Graphics", "Sound Design"],
    deliverables: ["10 vertical social edits"],
    artLabel: "Swan Bitcoin",
    tone: "ink",
    ratio: "portrait",
    featured: true,
    media: [
      { id: "swan-01", title: "China Is Laughing at America", videoUrl: "/work/swan/swan-short-01-preview.mp4", poster: "/work/swan/swan-short-01-poster.webp", width: 540, height: 960 },
      { id: "swan-02", title: "How Bitcoin Changed Property Forever", videoUrl: "/work/swan/swan-short-02-preview.mp4", poster: "/work/swan/swan-short-02-poster.webp", width: 540, height: 960 },
      { id: "swan-03", title: "Is Bitcoin Playing the Long Game?", videoUrl: "/work/swan/swan-short-03-preview.mp4", poster: "/work/swan/swan-short-03-poster.webp", width: 540, height: 960 },
      { id: "swan-04", title: "Bitcoin Is Economic Armor", videoUrl: "/work/swan/swan-short-04-preview.mp4", poster: "/work/swan/swan-short-04-poster.webp", width: 540, height: 960, featured: true },
      { id: "swan-05", title: "The Only Money They Cannot Take", videoUrl: "/work/swan/swan-short-05-preview.mp4", poster: "/work/swan/swan-short-05-poster.webp", width: 540, height: 960 },
      { id: "swan-06", title: "The Bitcoin Journey", videoUrl: "/work/swan/swan-short-06-preview.mp4", poster: "/work/swan/swan-short-06-poster.webp", width: 540, height: 960 },
      { id: "swan-07", title: "The $999 iPhone vs. $2,250 Bitcoin", videoUrl: "/work/swan/swan-short-07-preview.mp4", poster: "/work/swan/swan-short-07-poster.webp", width: 540, height: 960, featured: true },
      { id: "swan-08", title: "The Pattern Behind Bitcoin Growth", videoUrl: "/work/swan/swan-short-08-preview.mp4", poster: "/work/swan/swan-short-08-poster.webp", width: 540, height: 960, featured: true },
      { id: "swan-09", title: "When Bitcoin Moves", videoUrl: "/work/swan/swan-short-09-preview.mp4", poster: "/work/swan/swan-short-09-poster.webp", width: 540, height: 960 },
      { id: "swan-10", title: "Why I Am Still Buying Bitcoin", videoUrl: "/work/swan/swan-short-10-preview.mp4", poster: "/work/swan/swan-short-10-poster.webp", width: 540, height: 960 },
    ],
  },
  {
    id: "roxom",
    title: "Roxom social edits",
    client: "Roxom",
    category: "Short-form / Social",
    contentType: "4 selected edits",
    description: "Four vertical clips built from interviews and event footage, using captions, structured layouts and Bitcoin imagery.",
    roles: ["Editing", "Captions", "Motion Graphics", "Sound Design"],
    deliverables: ["4 vertical social edits"],
    artLabel: "Roxom",
    tone: "cobalt",
    ratio: "portrait",
    layout: "large",
    media: [
      { id: "roxom-01", title: "Can Bitcoin Monetize Peace?", videoUrl: "/work/roxom/roxom-short-01-preview.mp4", poster: "/work/roxom/roxom-short-01-poster.webp", width: 540, height: 960, featured: true },
      { id: "roxom-02", title: "Bitcoin Will Only Get Rarer", videoUrl: "/work/roxom/roxom-short-02-preview.mp4", poster: "/work/roxom/roxom-short-02-poster.webp", width: 540, height: 960 },
      { id: "roxom-03", title: "Bitcoin Is Perfect Money", videoUrl: "/work/roxom/roxom-short-03-preview.mp4", poster: "/work/roxom/roxom-short-03-poster.webp", width: 540, height: 960, featured: true },
      { id: "roxom-04", title: "Tether Data Unveiled", videoUrl: "/work/roxom/roxom-short-04-preview.mp4", poster: "/work/roxom/roxom-short-04-poster.webp", width: 540, height: 960, featured: true },
    ],
  },
  {
    id: "youtube-long-form",
    title: "Xiaomi 13 Pro review",
    client: "Sarthak EAI",
    category: "YouTube Long-Form",
    contentType: "Long-form review",
    description: "A hands-on Xiaomi 13 Pro review edited for my own technology channel.",
    roles: ["Editing", "Story Structure", "Motion Graphics", "Sound Design"],
    deliverables: ["1 long-form YouTube review"],
    artLabel: "Xiaomi 13 Pro",
    tone: "clay",
    ratio: "wide",
    layout: "small",
    externalUrl: "https://youtu.be/5MWtToYnA00?si=C8LS743wbJXIkAWy",
    media: [
      {
        id: "youtube-xiaomi-13-pro",
        title: "Xiaomi 13 Pro Review: Just Wow! (Hindi)",
        externalUrl: "https://youtu.be/5MWtToYnA00?si=C8LS743wbJXIkAWy",
        poster: "/work/youtube/xiaomi-13-pro-poster.webp",
        posterFallbacks: [
          "https://i.ytimg.com/vi/5MWtToYnA00/sddefault.jpg",
          "https://i.ytimg.com/vi/5MWtToYnA00/hqdefault.jpg",
        ],
        width: 1280,
        height: 720,
        featured: true,
      },
    ],
  },
  {
    id: "21st-capital-introduction",
    title: "21st Capital introduction",
    client: "21st Capital",
    category: "Brand Introduction",
    contentType: "Company introduction",
    description: "A one-minute company introduction explaining 21st Capital through presenter-led editing, diagrams and supporting motion.",
    roles: ["Editing", "Motion Graphics", "Layout Design", "Sound Design"],
    deliverables: ["1 brand introduction"],
    artLabel: "21st Capital",
    tone: "acid",
    ratio: "wide",
    layout: "small",
    media: [
      { id: "21st-capital-01", title: "Unlock Bitcoin's Potential", videoUrl: "/work/21st-capital/21st-capital-intro-preview.mp4", poster: "/work/21st-capital/21st-capital-intro-poster.webp", width: 1280, height: 720, featured: true },
    ],
  },
  {
    id: "motion-brand-animation",
    title: "Motion & Brand Animation",
    category: "Motion Graphics / Brand Animation",
    contentType: "3 brand animations",
    description: "Three short brand animations for Bitcoin Treasuries, HashrateUp × Swan and Swan.",
    roles: ["Motion Graphics", "2D Animation", "Logo Animation", "Editing", "Sound Design"],
    deliverables: ["3 brand animations"],
    artLabel: "Motion & Brand Animation",
    tone: "sand",
    ratio: "wide",
    layout: "large",
    media: [
      {
        id: "motion-bitcoin-treasuries",
        title: "Bitcoin Treasuries intro",
        videoUrl: "/work/motion/motion-bitcoin-treasuries-preview.mp4",
        poster: "/work/motion/motion-bitcoin-treasuries-poster.webp",
        width: 1280,
        height: 720,
        featured: true,
      },
      {
        id: "motion-hashrateup-swan",
        title: "HashrateUp × Swan animation",
        videoUrl: "/work/motion/motion-hashrateup-swan-preview.mp4",
        poster: "/work/motion/motion-hashrateup-swan-poster.webp",
        width: 1280,
        height: 720,
      },
      {
        id: "motion-swan-logo",
        title: "Swan logo animation",
        videoUrl: "/work/motion/motion-swan-logo-preview.mp4",
        poster: "/work/motion/motion-swan-logo-poster.webp",
        width: 1280,
        height: 720,
      },
    ],
  },
  {
    id: "podcast-interview",
    title: "21st Capital interview",
    client: "21st Capital",
    category: "Podcast / Interview",
    contentType: "Interview episode",
    description: "A 21st Capital interview edit built around a direct, conversation-led presentation.",
    roles: ["Editing", "Motion Graphics", "Layout Design", "Captions"],
    deliverables: ["1 interview episode"],
    artLabel: "21st Capital interview",
    tone: "ink",
    ratio: "wide",
    layout: "centered",
    externalUrl: "https://youtu.be/X5Z5VLdJxC4?si=xjztMcaGd1S-CfQH",
    media: [
      {
        id: "podcast-21st-capital",
        title: "21st Capital Panic is Coming",
        externalUrl: "https://youtu.be/X5Z5VLdJxC4?si=xjztMcaGd1S-CfQH",
        poster: "/work/youtube/21st-capital-interview-poster.webp",
        posterFallbacks: [
          "https://i.ytimg.com/vi/X5Z5VLdJxC4/sddefault.jpg",
          "https://i.ytimg.com/vi/X5Z5VLdJxC4/hqdefault.jpg",
        ],
        width: 1280,
        height: 720,
        featured: true,
      },
    ],
  },
];

export const categories = [
  "All",
  "Short-form / Social",
  "YouTube Long-Form",
  "Brand Introduction",
  "Motion Graphics / Brand Animation",
  "Podcast / Interview",
];

export const services = [
  { number: "01", title: "YouTube & long-form", copy: "YouTube videos, explainers and longer edits with clear structure, clean pacing and sound." },
  { number: "02", title: "Short-form & social", copy: "Shorts, Reels and X clips that get to the point quickly and fit the platform." },
  { number: "03", title: "Podcasts & conversations", copy: "Full episodes and short clips, with the pauses, repeats and rough edges cleaned up." },
  { number: "04", title: "Motion & finishing", copy: "Titles, captions, transitions, light motion graphics, colour and final polish." },
];

export const stats = [
  { value: "4–5", label: "years editing professionally" },
  { value: "350+", label: "long-form videos" },
  { value: "700+", label: "short-form videos" },
  { value: "24K+", label: "YouTube subscribers" },
];

export type Client = {
  name: string;
  logo: string;
  width: number;
  height: number;
  url?: string;
  type?: "brand" | "creator";
  theme?: "invert" | "native";
  size?: "standard" | "wide" | "tall" | "padded";
  presence?: "balanced" | "strong";
};

// Add, remove or reorder collaborators here. Links remain optional.
export const clients: Client[] = [
  { name: "Swan Bitcoin", logo: "/collaborators/swan-bitcoin.svg", width: 719, height: 204, type: "brand", theme: "invert", presence: "strong" },
  { name: "Bitcoin Treasuries", logo: "/collaborators/bitcoin-treasuries.svg", width: 509, height: 53, type: "brand", theme: "invert", size: "wide", presence: "strong" },
  { name: "Simply Bitcoin", logo: "/collaborators/simply-bitcoin.svg", width: 785, height: 504, type: "creator", theme: "invert", size: "tall", presence: "strong" },
  { name: "Roxom", logo: "/collaborators/roxom-tv.png", width: 757, height: 177, type: "brand", theme: "native" },
  { name: "21st Capital", logo: "/collaborators/21st-capital.svg", width: 80, height: 30, type: "brand", theme: "invert", presence: "strong" },
  { name: "BTC Sessions", logo: "/collaborators/btc-sessions.webp", width: 1200, height: 800, type: "creator", theme: "native", size: "padded", presence: "strong" },
  { name: "Zimo Media", logo: "/collaborators/zimo-media.svg", width: 382, height: 105, type: "brand", theme: "invert" },
];

export const socials = [
  { platform: "instagram", label: "Instagram", href: "https://www.instagram.com/sarthak.eai" },
  { platform: "x", label: "X / Twitter", href: "https://x.com/sarthakeai" },
  { platform: "youtube", label: "YouTube", href: "https://www.youtube.com/@sarthakeai" },
];

export const youtubeStats = [
  { value: "24K+", label: "subscribers" },
  { value: "350+", label: "long-form videos" },
];

export type YouTubeVideo = {
  title: string;
  thumbnail: string;
  url: string;
  date?: string;
  views?: string;
  duration?: string;
};
export const youtubeVideos: YouTubeVideo[] = [];

export type Testimonial = {
  quote: string;
  name: string;
  role?: string;
  company?: string;
  image?: string;
  logo?: string;
};
export const testimonials: Testimonial[] = [];
