/* eslint-disable @next/next/no-img-element -- This site ships hand-optimized responsive image assets without the Next image runtime. */

import { BookingProvider, BookingTrigger } from "./BookingExperience";
import { CalendarBlank } from "@phosphor-icons/react/dist/ssr/CalendarBlank";
import { ChatText } from "@phosphor-icons/react/dist/ssr/ChatText";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr/EnvelopeSimple";
import { InstagramLogo } from "@phosphor-icons/react/dist/ssr/InstagramLogo";
import { XLogo } from "@phosphor-icons/react/dist/ssr/XLogo";
import { YoutubeLogo } from "@phosphor-icons/react/dist/ssr/YoutubeLogo";
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

const footerSocials = [
  ...socials,
  { platform: "email", label: "Email", href: "mailto:work@sarthakeai.com" },
];

const footerSocialIcons = {
  instagram: InstagramLogo,
  x: XLogo,
  youtube: YoutubeLogo,
  email: EnvelopeSimple,
};

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
            <div className="hero-availability hero-reveal hero-delay-1" aria-label="Available for work">
              <span className="hero-availability-dot" aria-hidden="true" />
              <span>Available for work</span>
            </div>
            <h1 className="hero-reveal hero-delay-1">Hi, I’m Sarthak.</h1>
            <p className="hero-intro hero-reveal hero-delay-2">I’m a video editor and creator based in India. I edit YouTube videos, shorts, podcasts and social content for brands and creators around the world.</p>
            <div className="hero-actions hero-reveal hero-delay-2">
              <a className="button button-secondary" href="#work">See selected work <span aria-hidden="true">↓</span></a>
              <BookingTrigger className="button button-primary hero-connect">Connect <span aria-hidden="true">↗</span></BookingTrigger>
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

        <section className="section work" id="work">
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
              <p>I’ve been editing professionally for around five years, working with brands and creators across YouTube, podcasts, tech, finance and social.</p>
              <p>I also run a technology YouTube channel of my own. That means I’m not only thinking about clean cuts - I’m thinking about the idea, the audience and whether the video actually holds up once it’s published.</p>
            </div>
          </div>
          <div className="stats" aria-label="Experience in numbers">
            {stats.map((stat) => <div key={stat.value}><strong>{stat.value}</strong><p>{stat.label}</p></div>)}
          </div>
        </section>

        <section className="section services" id="services" data-reveal>
          <div className="services-intro">
            <p className="kicker">What I do</p>
            <p>I can handle the full edit from the first assembly to final exports, or work inside an existing team and workflow.</p>
          </div>
          <div className="service-list">
            {services.map((service) => <article className="service" key={service.number}><span>{service.number}</span><h3>{service.title}</h3><p>{service.copy}</p><i aria-hidden="true">↗</i></article>)}
          </div>
        </section>

        <section className="section youtube" id="youtube" data-reveal>
          <div className="youtube-copy">
            <p className="kicker">Personal project / YouTube</p>
            <h2>I make videos too.</h2>
            <p>I’ve created and published more than 350 long-form videos on my technology channel, which now has over 24,000 subscribers. Running the channel has taught me what works after a video leaves the timeline and reaches a real audience.</p>
          </div>
          <div className="youtube-panel" aria-label="YouTube channel in numbers">
            <div className="youtube-mark"><span className="sr-only">EAI</span></div>
            <div className="youtube-stats">
              {youtubeStats.map((stat) => <div className="youtube-stat" key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
            </div>
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
              <div className="contact-route-heading">
                <CalendarBlank className="contact-route-icon" aria-hidden="true" weight="regular" />
                <p className="contact-route-label">Prefer a call?</p>
              </div>
              <p>Book a 30-minute call.</p>
            </div>
            <div className="contact-actions">
              <BookingTrigger className="button button-primary contact-connect">Connect <span aria-hidden="true">↗</span></BookingTrigger>
            </div>
          </div>
          <div className="contact-form-intro">
            <div className="contact-write-copy">
              <div className="contact-route-heading">
                <ChatText className="contact-route-icon" aria-hidden="true" weight="regular" />
                <p className="contact-route-label">Prefer to write?</p>
              </div>
              <p>Send me a project message.</p>
            </div>
            <a className="contact-email" href="mailto:work@sarthakeai.com"><EnvelopeSimple aria-hidden="true" weight="regular" />work@sarthakeai.com <span aria-hidden="true">↗</span></a>
          </div>
          <ContactForm />
        </section>
      </div>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-upper">
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
                  {footerSocials.map((social) => {
                    const SocialIcon = footerSocialIcons[social.platform as keyof typeof footerSocialIcons];
                    const isEmail = social.platform === "email";
                    return (
                    <a className="footer-directory-link footer-social-link" data-platform={social.platform} key={social.label} href={social.href} target={isEmail ? undefined : "_blank"} rel={isEmail ? undefined : "noopener noreferrer"} aria-label={isEmail ? "Email Sarthak at work@sarthakeai.com" : `${social.label}, opens in a new tab`}>
                      <SocialIcon className="footer-link-icon" aria-hidden="true" weight="regular" />
                      <span className="footer-link-title">{social.platform === "x" ? "X / Twitter" : social.label}</span>
                      <span className="footer-link-arrow" aria-hidden="true">↗</span>
                    </a>
                    );
                  })}
                </div>
              </div>
            </div>
            <a className="footer-back-to-top" href="#top" aria-label="Back to top">↑</a>
          </div>
          <div className="footer-divider" aria-hidden="true" />
          <p className="footer-copyright"><span>© 2026 Sarthak Sharma</span><span>All Rights Reserved.</span></p>
        </div>
      </footer>
    </main>
    </BookingProvider>
  );
}
