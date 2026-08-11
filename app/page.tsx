import Image from "next/image";
import { MotionController } from "./MotionController";
import { PortfolioGrid } from "./PortfolioGrid";
import { clients, services, socials, stats, testimonials } from "./portfolio-data";
import { SiteHeader } from "./SiteHeader";

const footerLinks = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#services", label: "What I do" },
  { href: "#youtube", label: "YouTube" },
  { href: "#contact", label: "Contact" },
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
            <figure className="hero-portrait hero-reveal">
              <Image src="/sarthak-sharma.webp" alt="Sarthak" width={1440} height={1440} sizes="(max-width: 800px) 5.75rem, 8rem" priority />
            </figure>
            <h1 className="hero-reveal hero-delay-1">Hi, I’m Sarthak.</h1>
            <p className="hero-intro hero-reveal hero-delay-2">I’m a video editor and creator based in India. I edit YouTube videos, shorts, podcasts and social content for creators and brands around the world.</p>
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
            <div><p className="kicker">Selected work</p><h2>A look at<br />what I edit.</h2></div>
            <p>Long-form, short-form, podcasts, motion and social content across YouTube, Instagram and X.</p>
          </div>
          <PortfolioGrid />
        </section>

        <section className="section about" id="about" data-reveal>
          <div className="about-grid">
            <p className="kicker">About</p>
            <div className="about-copy">
              <h2>I know the edit from both sides of the timeline.</h2>
              <p>I’ve been editing professionally for around five years, mostly for creators working across YouTube, podcasts, tech, finance and social.</p>
              <p>I also run a technology YouTube channel of my own. That means I’m not only thinking about clean cuts—I’m thinking about the idea, the audience and whether the video actually holds up once it’s published.</p>
              <p className="personal-note">Away from the timeline: photography, films, music, travel, cars and motorcycles.</p>
            </div>
          </div>
          <div className="stats" aria-label="Experience in numbers">
            {stats.map((stat) => <div key={stat.value}><strong>{stat.value}</strong><p>{stat.label}</p></div>)}
          </div>
        </section>

        <section className="section services" id="services" data-reveal>
          <div className="section-head">
            <div><p className="kicker">What I do</p><h2>What I edit.</h2></div>
            <p>I can handle the full edit from the first assembly to final exports, or work inside an existing team and workflow.</p>
          </div>
          <div className="service-list">
            {services.map((service) => <article className="service" key={service.number}><span>{service.number}</span><h3>{service.title}</h3><p>{service.copy}</p><i aria-hidden="true">↗</i></article>)}
          </div>
        </section>

        <section className="section experience-section" data-reveal>
          <div className="section-head compact-head">
            <div><p className="kicker">Experience</p><h2>Some people I’ve worked with.</h2></div>
            <p>I’ve worked with independent creators, YouTube teams and podcasts, along with projects in tech, Bitcoin and finance.</p>
          </div>
          <div className="experience-list" aria-label="Types of clients and collaborations">
            {clients.map((client) => <span key={client}>{client}</span>)}
          </div>
        </section>

        <section className="section youtube" id="youtube" data-reveal>
          <div className="youtube-mark"><Image src="/eai-white.png" alt="EAI" width={320} height={320} /></div>
          <div className="youtube-copy">
            <p className="kicker">Personal project / YouTube</p>
            <h2>I make videos too.</h2>
            <p>I’ve created and published more than 350 long-form videos on my technology channel, which now has over 24,000 subscribers. Running the channel has taught me what works after a video leaves the timeline and reaches a real audience.</p>
            <a className="text-link" href="https://www.youtube.com/@sarthakeai" target="_blank" rel="noopener noreferrer" aria-label="Visit my YouTube channel, opens in a new tab">Visit my YouTube channel <span aria-hidden="true">↗</span></a>
          </div>
          <div className="youtube-stat"><strong>24K+</strong><span>subscribers</span></div>
        </section>

        {testimonials.length > 0 ? (
          <section className="section testimonial" aria-label="Client testimonials" data-reveal>
            {testimonials.map((testimonial) => <figure key={`${testimonial.name}-${testimonial.quote}`}><blockquote>“{testimonial.quote}”</blockquote><figcaption>{testimonial.name}{testimonial.role ? ` · ${testimonial.role}` : ""}</figcaption></figure>)}
          </section>
        ) : null}

        <section className="section contact" id="contact" data-reveal>
          <p className="kicker">Get in touch</p>
          <h2>Have something you want to work on?</h2>
          <div className="contact-bottom">
            <a href="mailto:hello@sarthaksharma.work">Email me <span aria-hidden="true">↗</span></a>
            <p>Send me a note with a little about the project, the format and the timeline.</p>
          </div>
        </section>
      </div>

      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-intro">
              <a className="footer-brand" href="#top" aria-label="Sarthak, back to top"><Image src="/eai-white.png" alt="" width={320} height={320} /><span>Sarthak</span></a>
              <p>Video editor & creator based in India.</p>
            </div>
            <nav className="footer-nav" aria-label="Footer navigation">
              <span className="footer-label">Explore</span>
              {footerLinks.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
            </nav>
            <div className="footer-socials" aria-label="Social profiles">
              <span className="footer-label">Elsewhere</span>
              {socials.map((social) => <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={`${social.label}, opens in a new tab`}>{social.label} <span aria-hidden="true">↗</span></a>)}
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Sarthak</p>
            <a className="footer-back" href="#top">Back to top <span aria-hidden="true">↑</span></a>
          </div>
        </div>
      </footer>
    </main>
  );
}
