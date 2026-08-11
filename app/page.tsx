"use client";

import { useState } from "react";

const projects = [
  { title: "The 30-Day Reset", client: "Creator campaign", category: "YouTube Shorts", metric: "18M views", tone: "ember", ratio: "portrait" },
  { title: "No Shortcut Home", client: "YouTube documentary", category: "Long-form", metric: "12:48", tone: "blue", ratio: "wide" },
  { title: "The Quiet Part", client: "Founder conversations", category: "Podcast Clips", metric: "Series of 24", tone: "silver", ratio: "square" },
  { title: "Signal / Noise", client: "Brand identity film", category: "Motion Graphics", metric: "01:06", tone: "red", ratio: "wide" },
  { title: "Built in Public", client: "Social campaign", category: "Social Content", metric: "32 assets", tone: "violet", ratio: "portrait" },
  { title: "After the Launch", client: "Creator profile", category: "Long-form", metric: "09:22", tone: "green", ratio: "square" },
];

const categories = ["All", "YouTube Shorts", "Long-form", "Podcast Clips", "Motion Graphics", "Social Content"];

export default function Home() {
  const [active, setActive] = useState("All");
  const [menuOpen, setMenuOpen] = useState(false);
  const visible = active === "All" ? projects : projects.filter((project) => project.category === active);

  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Sarthak Sharma, home">SS<span>.</span></a>
        <nav className={menuOpen ? "nav open" : "nav"} aria-label="Primary navigation">
          <a href="#work" onClick={() => setMenuOpen(false)}>Work</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
          <a className="nav-cta" href="#contact" onClick={() => setMenuOpen(false)}>Start a project <span>↗</span></a>
        </nav>
        <button className="menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-expanded={menuOpen}>
          <span /><span />
        </button>
      </header>

      <section className="hero" id="top">
        <div className="grain" />
        <p className="eyebrow reveal"><span /> Freelance video editor · India / Worldwide</p>
        <h1 className="hero-title reveal delay-1">I edit stories<br />people <em>feel.</em></h1>
        <div className="hero-bottom reveal delay-2">
          <p>Sharp cuts, honest rhythm, and visuals that stay with you. I help creators and brands turn raw footage into work worth watching.</p>
          <a className="circle-link" href="#work" aria-label="See selected work"><span>View<br />work</span><b>↓</b></a>
        </div>
        <div className="frame-marks" aria-hidden="true"><i>REC</i><i>00:00:01:12</i></div>
      </section>

      <div className="ticker" aria-label="Specialties"><div>STORY FIRST <span>✦</span> CLEAN CUTS <span>✦</span> HUMAN RHYTHM <span>✦</span> STORY FIRST <span>✦</span> CLEAN CUTS <span>✦</span> HUMAN RHYTHM <span>✦</span></div></div>

      <section className="section work" id="work">
        <div className="section-head">
          <div><p className="kicker">01 / Selected work</p><h2>Recent cuts.</h2></div>
          <p>A selection of stories shaped for screens big, small, and held in one hand.</p>
        </div>
        <div className="filters" role="group" aria-label="Filter projects">
          {categories.map((category) => <button key={category} className={active === category ? "active" : ""} onClick={() => setActive(category)}>{category}</button>)}
        </div>
        <div className="project-grid">
          {visible.map((project, index) => (
            <article className={`project ${project.ratio}`} key={project.title}>
              <div className={`project-visual ${project.tone}`}>
                <div className="timecode">0{index + 1}:2{index}:4{index}</div>
                <div className="visual-type">{project.title.split(" ").map((word) => <span key={word}>{word}</span>)}</div>
                <button className="play" aria-label={`Play ${project.title} preview`}>▶</button>
              </div>
              <div className="project-info"><div><h3>{project.title}</h3><p>{project.client}</p></div><div><span>{project.category}</span><span>{project.metric}</span></div></div>
            </article>
          ))}
        </div>
      </section>

      <section className="about section" id="about">
        <div className="about-intro"><p className="kicker">02 / About</p><p className="statement">Good editing disappears.<br /><span>The feeling doesn’t.</span></p></div>
        <div className="about-body">
          <div className="portrait" aria-label="Portrait placeholder for Sarthak Sharma"><div className="portrait-initial">S</div><span>YOUR FRAME HERE</span></div>
          <div className="bio"><h2>I’m Sarthak.</h2><p>I’m a freelance editor and creative based in India, working with creators, founders, and teams who care about the details.</p><p>My job is more than making footage shorter. It’s finding the heartbeat of a story—the pause before a line lands, the frame that says enough, the cut nobody notices but everyone feels.</p><a href="#contact">More about how I work <span>↗</span></a></div>
        </div>
        <div className="stats"><div><strong>4<span>+</span></strong><p>Years shaping<br />stories</p></div><div><strong>350<span>+</span></strong><p>Videos edited<br />and delivered</p></div><div><strong>80<span>M+</span></strong><p>Organic views<br />across platforms</p></div><div><strong>12<span>+</span></strong><p>Countries reached<br />through the work</p></div></div>
      </section>

      <section className="services section" id="services">
        <div className="section-head"><div><p className="kicker">03 / Services</p><h2>From raw to<br /><em>ready.</em></h2></div><p>Bring the footage, the brief, or just the beginnings of an idea. I’ll help shape the rest.</p></div>
        <div className="service-list">
          {[['01','YouTube & long-form','Narrative structure, pacing, sound design, colour, and a finish built for retention.'],['02','Short-form & social','Platform-native edits with hooks that earn attention—without losing the human voice.'],['03','Podcasts & conversations','Full episodes and sharp social cutdowns that make the strongest moments travel.'],['04','Motion & visual systems','Titles, typography, transitions, and repeatable visual language for every series.']].map(([num,title,copy]) => <div className="service" key={num}><span>{num}</span><h3>{title}</h3><p>{copy}</p><b>↗</b></div>)}
        </div>
      </section>

      <section className="clients section">
        <p className="kicker">04 / Experience</p><div className="client-row"><span>Creators</span><span>Founders</span><span>Podcasts</span><span>Brands</span><span>Studios</span></div>
        <div className="experience"><h2>Built for long-term<br />creative partnerships.</h2><p>From daily social systems to carefully paced documentaries, I slot into your workflow, communicate clearly, and treat every deadline like it’s mine.</p></div>
      </section>

      <section className="quote section">
        <p className="kicker">05 / Kind words</p><blockquote>“Sarthak doesn’t just edit the footage. He finds the version of the story we were trying to tell.”</blockquote><div className="quote-by"><span>Client name</span><span>Creator / Brand</span><small>Testimonial placeholder</small></div>
      </section>

      <section className="contact section" id="contact">
        <p className="kicker">06 / Let’s make something</p><h2>Have footage.<br />Need <em>a story?</em></h2><div className="contact-bottom"><a href="mailto:hello@sarthaksharma.work">hello@sarthaksharma.work <span>↗</span></a><p>Available for select freelance projects and ongoing creative partnerships.</p></div>
      </section>

      <footer><a className="wordmark" href="#top">SS<span>.</span></a><div className="socials"><a href="#" aria-label="Instagram">Instagram ↗</a><a href="#" aria-label="YouTube">YouTube ↗</a><a href="#" aria-label="LinkedIn">LinkedIn ↗</a></div><p>© {new Date().getFullYear()} Sarthak Sharma</p><a href="#top">Back to top ↑</a></footer>
    </main>
  );
}
