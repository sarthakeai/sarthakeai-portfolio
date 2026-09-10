import { caseStudies, type CaseStudy } from "./case-study-data";
import { CaseStudyMedia } from "./CaseStudyMedia";
import { PageFrame } from "./PageFrame";

export function ProjectCaseStudy({ study }: { study: CaseStudy }) {
  const canonical = `https://sarthakeai.com/work/${study.slug}`;
  const currentIndex = caseStudies.findIndex((item) => item.slug === study.slug);
  const nextStudy = caseStudies[(currentIndex + 1) % caseStudies.length];
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
        </header>
        <dl className="case-study-meta" aria-label={`${study.title} project details`}>
          <div><dt>Client / brand</dt><dd>{study.client}</dd></div>
          <div><dt>Category</dt><dd>{study.category}</dd></div>
          <div><dt>Role</dt><dd>{study.roles.join(" · ")}</dd></div>
        </dl>
        <CaseStudyMedia media={study.media} projectTitle={study.title} portrait={study.ratio === "portrait"} />
        <div className="case-study-story">
          <section aria-labelledby={`${study.slug}-project`}>
            <p className="project-label" id={`${study.slug}-project`}>The project</p>
            <p>{study.description}</p>
          </section>
          <section aria-labelledby={`${study.slug}-role`}>
            <p className="project-label" id={`${study.slug}-role`}>My role</p>
            <ul className="case-study-roles" aria-label={`Roles for ${study.title}`}>{study.roles.map((role) => <li key={role}>{role}</li>)}</ul>
          </section>
          <section aria-labelledby={`${study.slug}-approach`}>
            <p className="project-label" id={`${study.slug}-approach`}>The edit / approach</p>
            <p>{study.supportingCopy}</p>
          </section>
        </div>
        <nav className="case-study-navigation" aria-label="Project navigation">
          <a className="text-link case-study-back" href="/work">All selected work <span aria-hidden="true">↗</span></a>
          <a className="case-study-next" href={`/work/${nextStudy.slug}`}><span className="project-label">Next project</span><strong>{nextStudy.title}</strong><i aria-hidden="true">↗</i></a>
        </nav>
      </article>
    </PageFrame>
  );
}
