import { projects, type Project } from "./portfolio-data";

export type CaseStudy = {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  description: string;
  supportingCopy: string;
  roles: string[];
  ratio: Project["ratio"];
  media: NonNullable<Project["media"]>;
  externalUrl?: string;
};

const projectById = (id: string) => {
  const project = projects.find((item) => item.id === id);
  if (!project) throw new Error(`Missing portfolio project: ${id}`);
  return project;
};

const swan = projectById("swan-bitcoin");
const roxom = projectById("roxom");
const xiaomi = projectById("youtube-long-form");
const introduction = projectById("21st-capital-introduction");
const interview = projectById("podcast-interview");

export const caseStudies: CaseStudy[] = [
  {
    slug: "short-form-video",
    title: "Short-form video editing for Swan Bitcoin & Roxom",
    seoTitle: "Short-Form Video Editing for Swan Bitcoin & Roxom | Sarthak Sharma",
    seoDescription: "Short-form video editing by Sarthak Sharma for Swan Bitcoin and Roxom, featuring interview-driven edits, captions, visual cutaways, motion graphics and sound design.",
    eyebrow: "Swan Bitcoin + Roxom · Short-form social video",
    description: "A selection of short-form edits across Swan Bitcoin and Roxom, cut from interviews and talks with captions, visual cutaways, motion graphics and tight pacing.",
    supportingCopy: "The source material comes from interviews and talks, shaped into focused social edits through tighter pacing, clear captions, visual cutaways, supporting motion graphics and sound design.",
    roles: ["Editing", "Captions", "Motion Graphics", "Sound Design"],
    ratio: "portrait",
    media: [...(swan.media ?? []), ...(roxom.media ?? [])],
  },
  {
    slug: "21st-capital-introduction",
    title: introduction.title,
    seoTitle: "21st Capital Brand Video Editing | Sarthak Sharma",
    seoDescription: "A company introduction video edited by Sarthak Sharma for 21st Capital using presenter-led editing, diagrams, motion graphics and sound design.",
    eyebrow: "21st Capital · Company introduction",
    description: introduction.description,
    supportingCopy: "The one-minute edit combines a presenter-led explanation with diagrams, considered layouts, supporting motion and sound design to introduce the company clearly.",
    roles: introduction.roles,
    ratio: introduction.ratio,
    media: introduction.media ?? [],
  },
  {
    slug: "xiaomi-13-pro-review",
    title: xiaomi.title,
    seoTitle: "Xiaomi 13 Pro Review Video Editing | Sarthak Sharma",
    seoDescription: "A hands-on Xiaomi 13 Pro review created and edited by Sarthak Sharma for his technology YouTube channel.",
    eyebrow: "Sarthak EAI · Long-form review",
    description: xiaomi.description,
    supportingCopy: "Created for my own technology channel, the project brings together the responsibilities of both video editor and creator: shaping the story, presenting the hands-on experience and finishing the video with motion graphics and sound design.",
    roles: xiaomi.roles,
    ratio: xiaomi.ratio,
    media: xiaomi.media ?? [],
    externalUrl: xiaomi.externalUrl,
  },
  {
    slug: "21st-capital-interview",
    title: interview.title,
    seoTitle: "Podcast & Interview Video Editing | Sarthak Sharma",
    seoDescription: "Interview video editing by Sarthak Sharma for 21st Capital, including editing, captions, motion graphics and layout design.",
    eyebrow: "21st Capital · Interview episode",
    description: interview.description,
    supportingCopy: "The edit keeps the conversation direct and easy to follow, supported by captions, layout design and motion graphics where they help the presentation.",
    roles: interview.roles,
    ratio: interview.ratio,
    media: interview.media ?? [],
    externalUrl: interview.externalUrl,
  },
];

export function getCaseStudy(slug: string) {
  return caseStudies.find((study) => study.slug === slug);
}
