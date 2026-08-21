import type { CaseStudy } from "./case-study-data";
import { CaseStudyMedia } from "./CaseStudyMedia";
import { PageFrame } from "./PageFrame";

export function ProjectCaseStudy({ study }: { study: CaseStudy }) {
  const canonical = `https://sarthakeai.com/work/${study.slug}`;
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Work", item: "https://sarthakeai.com/work" },
      { "@type": "ListItem", position: 2, name: study.title, item: canonical },
    ],
  };

  return (
    <PageFrame>
      <article className="standalone-page case-study-page" id="top">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
        <nav className="page-breadcrumb" aria-label="Breadcrumb"><a href="/work">Work</a><span aria-hidden="true">/</span><span>{study.title}</span></nav>
        <header className="standalone-page-header">
          <p className="kicker">{study.eyebrow}</p>
          <h1>{study.title}</h1>
          <p className="standalone-page-lede">{study.description}</p>
        </header>
        <div className="case-study-details">
          <div>
            <p className="project-label">My role</p>
            <ul className="case-study-roles" aria-label={`Roles for ${study.title}`}>{study.roles.map((role) => <li key={role}>{role}</li>)}</ul>
          </div>
          <p>{study.supportingCopy}</p>
        </div>
        <CaseStudyMedia media={study.media} projectTitle={study.title} portrait={study.ratio === "portrait"} />
        <a className="text-link case-study-back" href="/work">Back to selected work <span aria-hidden="true">↗</span></a>
      </article>
    </PageFrame>
  );
}
