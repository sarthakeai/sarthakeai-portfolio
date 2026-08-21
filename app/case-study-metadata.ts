import type { Metadata } from "next";
import type { CaseStudy } from "./case-study-data";

export function caseStudyMetadata(study: CaseStudy): Metadata {
  const url = `/work/${study.slug}`;
  const image = study.media[0];
  const images = image ? [{ url: image.poster, width: image.width, height: image.height, alt: study.title }] : [];
  return {
    title: study.seoTitle,
    description: study.seoDescription,
    alternates: { canonical: url },
    openGraph: { title: study.seoTitle, description: study.seoDescription, url, type: "website", images },
    twitter: { card: "summary_large_image", title: study.seoTitle, description: study.seoDescription, images: images.map((item) => item.url) },
  };
}
