export type Project = {
  id: string;
  title: string;
  context: string;
  category: string;
  artLabel: string;
  tone: string;
  ratio: "portrait" | "wide" | "square";
  poster?: string;
  videoUrl?: string;
};

// Replace a project's title/context and add `poster` or `videoUrl` when final work is ready.
export const projects: Project[] = [
  { id: "shorts", title: "Short-form, made to move", context: "YouTube Shorts, Reels and X clips", category: "Short-form", artLabel: "Hook / Pace / Payoff", tone: "coral", ratio: "portrait" },
  { id: "long-form", title: "Long-form with a point of view", context: "YouTube videos and narrative edits", category: "Long-form", artLabel: "Story over noise", tone: "cobalt", ratio: "wide" },
  { id: "podcasts", title: "Conversations worth keeping", context: "Full episodes and social cutdowns", category: "Podcasts", artLabel: "Listen closer", tone: "clay", ratio: "square" },
  { id: "bitcoin-tech", title: "Complex ideas, cut clearly", context: "Bitcoin, finance and technology", category: "Social", artLabel: "Make it clear", tone: "acid", ratio: "wide" },
  { id: "motion", title: "Type, timing and movement", context: "Motion graphics and visual systems", category: "Motion", artLabel: "Frame by frame", tone: "ink", ratio: "portrait" },
  { id: "creator", title: "Content built with creators", context: "Repeatable social series and campaigns", category: "Social", artLabel: "Built to publish", tone: "sand", ratio: "square" },
];

export const categories = ["All", "Short-form", "Long-form", "Podcasts", "Motion", "Social"];

export const services = [
  { number: "01", title: "YouTube & long-form", copy: "Structure, pacing, sound and a clean finish—without sanding away your personality." },
  { number: "02", title: "Short-form & social", copy: "Shorts, Reels and clips that get to the point quickly and still feel like you." },
  { number: "03", title: "Podcasts & conversations", copy: "Full episodes, thoughtful cutdowns and the small clean-ups that keep people listening." },
  { number: "04", title: "Motion & finishing", copy: "Titles, graphics, colour and repeatable visual details for an ongoing series." },
];
