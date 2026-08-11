"use client";

import { useState } from "react";
import Image from "next/image";
import { categories, projects } from "./portfolio-data";

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => void;
};

export function PortfolioGrid() {
  const [active, setActive] = useState("All");
  const visible = active === "All" ? projects : projects.filter((project) => project.category === active);

  const selectCategory = (category: string) => {
    if (category === active) return;
    const update = () => setActive(category);
    const transition = (document as ViewTransitionDocument).startViewTransition;
    if (transition) transition.call(document, update);
    else update();
  };

  return (
    <>
      <div className="filters" role="group" aria-label="Filter selected work">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            aria-pressed={active === category}
            aria-controls="project-grid"
            className={active === category ? "active" : ""}
            onClick={() => selectCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">Showing {visible.length} {visible.length === 1 ? "project" : "projects"}.</p>
      <div className="project-grid" id="project-grid">
        {visible.map((project, index) => (
          <article className={`project ${project.ratio}`} key={project.id} style={{ viewTransitionName: `project-${project.id}` }}>
            <div className={`project-visual ${project.tone}`}>
              {project.poster ? <Image src={project.poster} alt="" fill sizes="(max-width: 800px) 100vw, 55vw" /> : null}
              <div className="project-placeholder" aria-label={`${project.category} project placeholder`}>
                <span className="project-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="project-category">{project.category}</span>
                <strong>{project.artLabel}</strong>
                <span className="project-status">Ready for your video</span>
              </div>
              {project.videoUrl ? <a className="play" href={project.videoUrl} aria-label={`Watch ${project.title}`}>Play ↗</a> : null}
            </div>
            <div className="project-info">
              <h3>{project.title}</h3>
              <p>{project.context}</p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
