import { MotionController } from "./MotionController";
import Image from "next/image";
import { PortfolioGrid } from "./PortfolioGrid";
import { services } from "./portfolio-data";
import { SiteHeader } from "./SiteHeader";

const socials = [
  { label: "Instagram", href: null },
  { label: "YouTube", href: null },
  { label: "LinkedIn", href: null },
];

export default function Home() {
  return (
    <main>
      <a className="skip-link" href="#content">Skip to content</a>
      <MotionController />
      <SiteHeader />

      <div id="content">
        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="availability hero-reveal"><span /> Available for select projects</p>
            <h1 className="hero-reveal hero-delay-1">I’m Sarthak — a video editor and creator.</h1>
            <p className="hero-intro hero-reveal hero-delay-2">I edit YouTube videos, shorts, podcasts and social content for people who care about what they put into the world.</p>
            <div className="hero-actions hero-reveal hero-delay-2">
              <a className="button button-primary" href="#work">See selected work <span aria-hidden="true">↓</span></a>
              <a className="text-link" href="mailto:hello@sarthaksharma.work">Email me <span aria-hidden="true">↗</span></a>
            </div>
          </div>
          <aside className="hero-aside hero-reveal hero-delay-2" aria-label="At a glance">
            <p>Based in India<br />Working worldwide</p>
            <p>Long-form · Shorts<br />Podcasts · Motion</p>
          </aside>
        </section>

        <section className="section work" id="work" data-reveal>
          <div className="section-head">
            <div><p className="kicker">Selected work</p><h2>A few places<br />my edits live.</h2></div>
            <p>The final films will replace these project slots as the reel comes together. The structure is ready for posters, hover previews or full case studies.</p>
          </div>
          <PortfolioGrid />
        </section>

        <section className="section about" id="about" data-reveal>
          <div className="about-grid">
            <figure className="portrait">
              <Image src="/sarthak-sharma.webp" alt="Sarthak Sharma" width={1440} height={1440} sizes="(max-width: 800px) 100vw, 38vw" />
              <figcaption>Sarthak Sharma · India</figcaption>
            </figure>
            <div className="about-copy">
              <p className="kicker">About</p>
              <h2>I know the edit from both sides of the timeline.</h2>
              <p>I’ve been editing professionally for around five years, mostly for creators working across YouTube, podcasts, tech, finance and social.</p>
              <p>I also run a technology YouTube channel of my own. That means I’m not only thinking about clean cuts—I’m thinking about the idea, the audience and whether the video actually holds up once it’s published.</p>
              <p className="personal-note">Away from the timeline: photography, films, music, travel, cars and motorcycles.</p>
            </div>
          </div>
          <div className="stats" aria-label="Experience in numbers">
            <div><strong>4–5</strong><p>years editing<br />professionally</p></div>
            <div><strong>350+</strong><p>long-form<br />videos edited</p></div>
            <div><strong>700+</strong><p>short-form<br />videos edited</p></div>
            <div><strong>24k+</strong><p>subscribers on<br />my tech channel</p></div>
          </div>
        </section>

        <section className="section services" id="services" data-reveal>
          <div className="section-head">
            <div><p className="kicker">What I do</p><h2>Editing that feels<br />like you.</h2></div>
            <p>I can take a project from a folder of footage to the final upload, or join an existing workflow where you need another thoughtful pair of hands.</p>
          </div>
          <div className="service-list">
            {services.map((service) => <article className="service" key={service.number}><span>{service.number}</span><h3>{service.title}</h3><p>{service.copy}</p><i aria-hidden="true">↗</i></article>)}
          </div>
        </section>

        <section className="section experience-section" data-reveal>
          <div className="section-head compact-head">
            <div><p className="kicker">Experience</p><h2>Some people I’ve worked with.</h2></div>
            <p>Independent creators, YouTube teams, podcasts, and people making thoughtful work in tech, Bitcoin and finance.</p>
          </div>
          <div className="experience-list" aria-label="Types of clients and collaborations">
            <span>Creators</span><span>YouTube teams</span><span>Podcasts</span><span>Tech</span><span>Bitcoin & finance</span>
          </div>
          <p className="experience-note">Client names and links can be added here once you choose what to show publicly.</p>
        </section>

        <section className="section youtube" id="youtube" data-reveal>
          <div className="youtube-mark"><Image src="/eai-white.png" alt="EAI" width={320} height={320} /></div>
          <div className="youtube-copy">
            <p className="kicker">Personal project / YouTube</p>
            <h2>I make videos too.</h2>
            <p>My technology channel has grown to more than 24,000 subscribers and hundreds of uploads. It’s where I test ideas, learn what viewers respond to and remember how an edit feels from the creator’s chair.</p>
            <span className="text-link is-placeholder">Channel link coming soon</span>
          </div>
          <div className="youtube-stat"><strong>24k+</strong><span>subscribers</span></div>
        </section>

        <section className="section testimonial" data-reveal>
          <p className="kicker">A note from a client</p>
          <blockquote>“A short, specific testimonial will feel right here—once we choose one that’s real.”</blockquote>
          <p className="testimonial-label">Testimonial placeholder</p>
        </section>

        <section className="section contact" id="contact" data-reveal>
          <p className="kicker">Get in touch</p>
          <h2>Have something<br />you want to make?</h2>
          <div className="contact-bottom">
            <a href="mailto:hello@sarthaksharma.work">hello@sarthaksharma.work <span aria-hidden="true">↗</span></a>
            <p>Tell me what you’re working on, what you need help with and where you are in the process.</p>
          </div>
        </section>
      </div>

      <footer>
        <a className="footer-brand" href="#top" aria-label="Sarthak Sharma, back to top"><Image src="/eai-white.png" alt="" width={320} height={320} /><span>Sarthak Sharma</span></a>
        <div className="socials" aria-label="Social profiles">{socials.map((social) => social.href ? <a key={social.label} href={social.href}>{social.label} ↗</a> : <span key={social.label} aria-disabled="true">{social.label}</span>)}</div>
        <p>© {new Date().getFullYear()} Sarthak Sharma</p>
        <a href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}
