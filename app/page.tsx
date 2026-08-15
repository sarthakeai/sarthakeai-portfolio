/* eslint-disable @next/next/no-img-element -- This site ships hand-optimized responsive image assets without the Next image runtime. */

import { BookingProvider, BookingTrigger } from "./BookingExperience";
import { ClientTestimonials } from "./ClientTestimonials";
import { ContactForm } from "./ContactForm";
import { HeroTimeline } from "./HeroTimeline";
import { MotionController } from "./MotionController";
import { PortfolioGrid } from "./PortfolioGrid";
import { clients, services, socials, stats, youtubeStats, youtubeVideos } from "./portfolio-data";
import { SiteHeader } from "./SiteHeader";

const footerLinks = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#services", label: "What I do" },
  { href: "#youtube", label: "YouTube" },
  { href: "#contact", label: "Contact" },
];

function ClientLogoSet({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div className="client-logo-set" aria-hidden={duplicate ? true : undefined}>
      {clients.map((client) => {
        const logo = (
          <img
            src={client.logo}
            alt={duplicate ? "" : client.name}
            width={client.width}
            height={client.height}
            loading="eager"
            decoding="async"
            data-theme-treatment={client.theme ?? "invert"}
            data-logo-size={client.size ?? "standard"}
            data-logo-presence={client.presence ?? "balanced"}
          />
        );

        if (duplicate || !client.url) return <span key={client.name}>{logo}</span>;
        return <a key={client.name} href={client.url} target="_blank" rel="noopener noreferrer" aria-label={`${client.name}, opens in a new tab`}>{logo}</a>;
      })}
    </div>
  );
}

export default function Home() {
  return (
    <BookingProvider>
    <main>
      <a className="skip-link" href="#content">Skip to content</a>
      <MotionController />
      <SiteHeader />

      <div id="content">
        <section className="hero" id="top">
          <HeroTimeline />
          <div className="hero-copy">
            <figure className="hero-portrait hero-reveal">
              <img src="/sarthak-sharma.webp" alt="Sarthak" width="320" height="320" fetchPriority="high" />
            </figure>
            <h1 className="hero-reveal hero-delay-1">Hi, I’m Sarthak.</h1>
            <p className="hero-intro hero-reveal hero-delay-2">I’m a video editor and creator based in India. I edit YouTube videos, shorts, podcasts and social content for brands and creators around the world.</p>
            <div className="hero-actions hero-reveal hero-delay-2">
              <a className="button button-primary" href="#work">See selected work <span aria-hidden="true">↓</span></a>
              <BookingTrigger className="text-link hero-connect">Connect <span aria-hidden="true">↗</span></BookingTrigger>
            </div>
          </div>
        </section>

        {clients.length > 0 ? (
          <section className="section selected-clients" aria-labelledby="selected-clients-title" data-reveal>
            <div className="clients-intro">
              <p className="kicker" id="selected-clients-title">Selected brands &amp; creators</p>
            </div>
            <div className="client-strip" aria-label="Selected brands and creators Sarthak has worked with">
              <div className="client-marquee-track">
                <ClientLogoSet />
                <ClientLogoSet duplicate />
              </div>
            </div>
            <p className="clients-note">Across YouTube, short-form, podcasts and social content.</p>
          </section>
        ) : null}

        <section className="section work" id="work" data-reveal>
          <div className="section-head">
            <div><p className="kicker">Selected work</p><h2>A look at<br />what I edit.</h2></div>
            <p>Selected edits across short-form, YouTube, company video, motion and interview work.</p>
          </div>
          <PortfolioGrid />
        </section>

        <ClientTestimonials />

        <section className="section about" id="about" data-reveal>
          <div className="about-grid">
            <p className="kicker">About</p>
            <figure className="about-portrait">
              <img
                src="/sarthak-about-960.webp"
                srcSet="/sarthak-about-960.webp 960w, /sarthak-about-1600.webp 1600w"
                sizes="(max-width: 36rem) calc(100vw - 2.2rem), (max-width: 50rem) 32rem, (max-width: 68rem) 22rem, 24rem"
                alt="Sarthak beside his motorcycle in the mountains"
                width="1600"
                height="2132"
                loading="lazy"
                decoding="async"
              />
            </figure>
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

        <section className="section youtube" id="youtube" data-reveal>
          <div className="youtube-mark">
            <span className="sr-only">EAI</span>
          </div>
          <div className="youtube-copy">
            <p className="kicker">Personal project / YouTube</p>
            <h2>I make videos too.</h2>
            <p>I’ve created and published more than 350 long-form videos on my technology channel, which now has over 24,000 subscribers. Running the channel has taught me what works after a video leaves the timeline and reaches a real audience.</p>
          </div>
          <div className="youtube-stats" aria-label="YouTube channel in numbers">
            {youtubeStats.map((stat) => <div className="youtube-stat" key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
          </div>
          <a className="text-link youtube-cta" href="https://www.youtube.com/@sarthakeai" target="_blank" rel="noopener noreferrer" aria-label="Visit my YouTube channel, opens in a new tab">Visit my YouTube channel <span aria-hidden="true">↗</span></a>
          {youtubeVideos.length > 0 ? (
            <div className="youtube-videos" aria-label="Selected YouTube videos">
              {youtubeVideos.map((video) => (
                <a key={video.url} href={video.url} target="_blank" rel="noopener noreferrer">
                  <span className="youtube-thumbnail"><img src={video.thumbnail} alt={`${video.title} thumbnail`} width="640" height="360" loading="lazy" decoding="async" /></span>
                  <span className="youtube-video-copy"><strong>{video.title}</strong>{video.date || video.views || video.duration ? <small>{[video.date, video.views, video.duration].filter(Boolean).join(" · ")}</small> : null}</span>
                </a>
              ))}
            </div>
          ) : null}
        </section>

        <section className="section contact" id="contact" data-reveal>
          <p className="kicker">Get in touch</p>
          <h2>Have something you want to work on?</h2>
          <div className="contact-bottom">
            <div className="contact-route-copy">
              <p className="contact-route-label">Prefer a call?</p>
              <p>Book a call or send me an email.</p>
            </div>
            <div className="contact-actions">
              <BookingTrigger className="button button-primary contact-connect">Connect <span aria-hidden="true">↗</span></BookingTrigger>
              <a className="contact-email" href="mailto:officialsarthakeai@gmail.com">officialsarthakeai@gmail.com <span aria-hidden="true">↗</span></a>
            </div>
          </div>
          <div className="contact-form-intro">
            <p className="contact-route-label">Prefer to write?</p>
            <p>Send me a project message below.</p>
          </div>
          <ContactForm />
        </section>
      </div>

      <footer>
        <div className="footer-inner">
          <div className="footer-upper">
            <p className="footer-copyright"><span>© 2026 Sarthak Sharma</span><span>All Rights Reserved.</span></p>
            <div className="footer-directory">
              <nav className="footer-column" aria-label="Footer navigation">
                <p className="footer-label">Navigation</p>
                <div className="footer-link-list">
                  {footerLinks.map((link) => (
                    <a className={`footer-directory-link${link.href === "#contact" ? " footer-link-contact" : ""}`} key={link.href} href={link.href}>
                      <span className="footer-link-title">{link.label}</span>
                      <span className="footer-link-arrow" aria-hidden="true">↗</span>
                    </a>
                  ))}
                </div>
              </nav>
              <div className="footer-column" aria-label="Social profiles">
                <p className="footer-label">Elsewhere</p>
                <div className="footer-link-list">
                  {socials.map((social) => (
                    <a className="footer-directory-link" key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={`${social.label}, opens in a new tab`}>
                      <span className="footer-link-title">{social.platform === "x" ? "X / Twitter" : social.label}</span>
                      <span className="footer-link-arrow" aria-hidden="true">↗</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="footer-divider" aria-hidden="true" />
        </div>
      </footer>
    </main>
    </BookingProvider>
  );
}
