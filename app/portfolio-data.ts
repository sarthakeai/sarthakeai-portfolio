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
  thumbnail?: string;
  thumbnailAlt?: string;
  externalUrl?: string;
  caseStudySlug?: string;
};

type ProjectMedia =
  | { videoUrl: string; captionsUrl: string }
  | { videoUrl?: never; captionsUrl?: never };

export type Project = ProjectBase & ProjectMedia;

// Add approved client names, thumbnails, videos, links and verified results here.
// Empty optional fields stay hidden in the interface.
export const projects: Project[] = [
  {
    id: "shorts",
    title: "Short-form edits",
    category: "Short-form",
    contentType: "Shorts / Reels / X",
    description: "Fast-paced cuts, captions, motion and platform-ready versions for regular publishing.",
    roles: ["Editing", "Motion", "Captions", "Sound design"],
    deliverables: ["Shorts", "Reels", "X clips"],
    artLabel: "Short-form",
    tone: "coral",
    ratio: "portrait",
    featured: true,
  },
  {
    id: "long-form",
    title: "YouTube & long-form",
    category: "Long-form",
    contentType: "YouTube / Long-form",
    description: "Structure, pacing, sound and clean visual details across longer edits.",
    roles: ["Editing", "Story structure", "Sound design"],
    deliverables: ["YouTube videos", "Explainers"],
    artLabel: "Long-form",
    tone: "cobalt",
    ratio: "wide",
  },
  {
    id: "podcasts",
    title: "Podcasts & clips",
    category: "Podcasts",
    contentType: "Episodes / Cutdowns",
    description: "Full conversations and focused clips built from the strongest moments.",
    roles: ["Editing", "Audio cleanup", "Cutdowns"],
    deliverables: ["Full episodes", "Social clips"],
    artLabel: "Podcasts",
    tone: "clay",
    ratio: "square",
  },
  {
    id: "bitcoin-tech",
    title: "Bitcoin, finance & tech",
    category: "Social",
    contentType: "Explainers / Social",
    description: "Clear edits for detailed topics, from full videos to quick social clips.",
    roles: ["Editing", "Motion", "Captions"],
    deliverables: ["Explainers", "Social cutdowns"],
    artLabel: "Tech / Finance",
    tone: "acid",
    ratio: "wide",
    featured: true,
  },
  {
    id: "motion",
    title: "Motion & design",
    category: "Motion",
    contentType: "Motion graphics",
    description: "Titles, captions, transitions and light motion systems for recurring content.",
    roles: ["Motion", "Titles", "Captions"],
    deliverables: ["Title systems", "Transitions", "Captions"],
    artLabel: "Motion",
    tone: "ink",
    ratio: "portrait",
  },
  {
    id: "social",
    title: "Social content",
    category: "Social",
    contentType: "Multi-platform",
    description: "Repeatable edits and versions made for regular publishing across platforms.",
    roles: ["Editing", "Versioning", "Finishing"],
    deliverables: ["Platform versions", "Social exports"],
    artLabel: "Social",
    tone: "sand",
    ratio: "square",
  },
];

export const categories = ["All", "Short-form", "Long-form", "Podcasts", "Motion", "Social"];

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
  size?: "standard" | "wide" | "tall";
  presence?: "balanced" | "strong";
};

// Add, remove or reorder collaborators here. Links remain optional.
export const clients: Client[] = [
  { name: "Swan Bitcoin", logo: "/collaborators/swan-bitcoin.svg", width: 719, height: 204, type: "brand", theme: "invert", presence: "strong" },
  { name: "Bitcoin Treasuries", logo: "/collaborators/bitcoin-treasuries.svg", width: 509, height: 53, type: "brand", theme: "invert", size: "wide", presence: "strong" },
  { name: "Simply Bitcoin", logo: "/collaborators/simply-bitcoin.svg", width: 785, height: 504, type: "creator", theme: "invert", size: "tall", presence: "strong" },
  { name: "Roxom", logo: "/collaborators/roxom-tv.png", width: 757, height: 177, type: "brand", theme: "native" },
  { name: "21st Capital", logo: "/collaborators/21st-capital.svg", width: 80, height: 30, type: "brand", theme: "invert", presence: "strong" },
  { name: "BTC Sessions", logo: "/collaborators/btc-sessions.webp", width: 1200, height: 800, type: "creator", theme: "native", size: "tall", presence: "strong" },
  { name: "Zimo Media", logo: "/collaborators/zimo-media.svg", width: 382, height: 105, type: "brand", theme: "invert" },
];

export const availability = {
  available: true,
  label: "Available for select projects",
};

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
