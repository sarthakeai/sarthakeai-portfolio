/* eslint-disable @next/next/no-img-element -- Reuses optimized portfolio poster assets. */
import type { Metadata } from "next";
import { caseStudies } from "../case-study-data";
import { PageFrame } from "../PageFrame";
import { WorkShortFormCard } from "../WorkShortFormCard";

const title = "Sarthak Sharma | Selected Video Editing Work";
const description = "Selected video editing work by Sarthak Sharma across YouTube, short-form content, podcasts, brand videos and motion graphics.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/work" },
  openGraph: { title, description, siteName: "Sarthak Sharma", url: "/work", type: "website", images: [{ url: "/og-white.png", width: 1200, height: 630, alt: title }] },
  twitter: { card: "summary_large_image", title, description, images: ["/og-white.png"] },
};

export default function WorkPage() {
  return (
    <PageFrame>
      <section className="standalone-page work-index-page" id="top">
        <header className="standalone-page-header">
          <p className="kicker">Selected work</p>
          <h1>Selected video editing work</h1>
          <p className="standalone-page-lede">Selected editing work across YouTube, short-form content, podcasts, brand videos and motion graphics.</p>
        </header>
        <div className="work-index-grid">
          {caseStudies.map((study) => {
            const poster = study.media[0];
            const isShortFormStudy = study.slug === "short-form-video";
            if (isShortFormStudy) return <WorkShortFormCard key={study.slug} study={study} />;
            return (
              <article className="work-index-card" key={study.slug}>
                <a className="work-index-media" href={`/work/${study.slug}`} aria-label={`View ${study.title}`}>
                  {poster ? <img src={poster.poster} alt="" width={poster.width} height={poster.height} loading="lazy" decoding="async" /> : null}
                  <span>View project <b aria-hidden="true">↗</b></span>
                </a>
                <div className="project-info">
                  <div className="project-copy">
                    <h2><a href={`/work/${study.slug}`}>{study.title}</a></h2>
                    <p>{study.description}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </PageFrame>
  );
}
