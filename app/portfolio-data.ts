type ProjectBase = {
  id: string;
  title: string;
  client?: string;
  category: string;
  contentType: string;
  description: string;
  artLabel: string;
  tone: string;
  ratio: "portrait" | "wide" | "square";
  thumbnail?: string;
  externalUrl?: string;
};

type ProjectMedia =
  | { videoUrl: string; captionsUrl: string }
  | { videoUrl?: never; captionsUrl?: never };

export type Project = ProjectBase & ProjectMedia;

// Add real thumbnail, video and external URLs here as projects are approved for the site.
export const projects: Project[] = [
  { id: "shorts", title: "Short-form edits", category: "Short-form", contentType: "Shorts / Reels / X", description: "Fast-paced cuts, captions, motion and platform-ready versions.", artLabel: "Short-form", tone: "coral", ratio: "portrait" },
  { id: "long-form", title: "YouTube & long-form", category: "Long-form", contentType: "YouTube / Long-form", description: "Structure, pacing, sound and clean visual details across longer edits.", artLabel: "Long-form", tone: "cobalt", ratio: "wide" },
  { id: "podcasts", title: "Podcasts & clips", category: "Podcasts", contentType: "Episodes / Cutdowns", description: "Full conversations and focused clips built from the strongest moments.", artLabel: "Podcasts", tone: "clay", ratio: "square" },
  { id: "bitcoin-tech", title: "Bitcoin, finance & tech", category: "Social", contentType: "Explainers / Social", description: "Clear edits for detailed topics, from full videos to quick social clips.", artLabel: "Tech / Finance", tone: "acid", ratio: "wide" },
  { id: "motion", title: "Motion & design", category: "Motion", contentType: "Motion graphics", description: "Titles, captions, transitions and light motion systems for recurring content.", artLabel: "Motion", tone: "ink", ratio: "portrait" },
  { id: "social", title: "Social content", category: "Social", contentType: "Multi-platform", description: "Repeatable edits and versions made for regular publishing across platforms.", artLabel: "Social", tone: "sand", ratio: "square" },
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

export const clients = ["Creators", "YouTube teams", "Podcasts", "Tech", "Bitcoin & finance"];

export const socials = [
  { label: "Instagram", href: "https://www.instagram.com/sarthak.eai" },
  { label: "X / Twitter", href: "https://x.com/sarthakeai" },
  { label: "YouTube", href: "https://www.youtube.com/@sarthakeai" },
];

export type Testimonial = { quote: string; name: string; role?: string };
export const testimonials: Testimonial[] = [];
