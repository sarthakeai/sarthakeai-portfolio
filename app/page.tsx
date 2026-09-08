/* eslint-disable @next/next/no-img-element -- This site ships hand-optimized responsive image assets without the Next image runtime. */

import { BookingTrigger } from "./BookingExperience";
import { AboutStoryExperience } from "./AboutStoryExperience";
import { CalendarBlank } from "@phosphor-icons/react/dist/ssr/CalendarBlank";
import { ChatText } from "@phosphor-icons/react/dist/ssr/ChatText";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr/EnvelopeSimple";
import { ClientTestimonials } from "./ClientTestimonials";
import { ContactForm } from "./ContactForm";
import { HeroTimeline } from "./HeroTimeline";
import { PageFrame } from "./PageFrame";
import { PortfolioGrid } from "./PortfolioGrid";
import { YouTubeShowcase } from "./YouTubeShowcase";
import { loadYouTubeShowcaseData } from "./api/youtube-latest/route";
import { homepageAboutIntro } from "./about-content";
import { clients, services, stats } from "./portfolio-data";

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

export default async function Home() {
  const { data: youtubeShowcaseData } = await loadYouTubeShowcaseData();
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Sarthak Sharma",
      alternateName: ["Sarthak EAI", "sarthakeai.com"],
      url: "https://sarthakeai.com/",
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": "https://sarthakeai.com/#person",
      name: "Sarthak Sharma",
      alternateName: "Sarthak EAI",
      url: "https://sarthakeai.com/",
      description: "Freelance video editor and creator based in New Delhi, India.",
      image: "https://sarthakeai.com/sarthak-about-1600.webp",
      jobTitle: "Video Editor & Creator",
      address: { "@type": "PostalAddress", addressLocality: "New Delhi", addressCountry: "IN" },
      sameAs: [
        "https://www.instagram.com/sarthak.eai",
        "https://x.com/sarthakeai",
        "https://www.youtube.com/@sarthakeai",
        "https://www.upwork.com/freelancers/~01a047caaf8c8ed5b6",
      ],
    },
  ];
  return (
    <PageFrame>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <section className="hero" id="top">
          <HeroTimeline />
          <div className="hero-copy">
            <div className="hero-left-anchor">
              <figure className="hero-portrait hero-reveal">
                <img src="/sarthak-sharma.webp" alt="Sarthak Sharma, video editor and creator" width="320" height="320" fetchPriority="high" />
              </figure>
              <h1 className="hero-reveal hero-delay-1">Hi, I’m Sarthak.</h1>
              <p className="hero-intro hero-reveal hero-delay-2">I’m a video editor and creator based in India. I edit YouTube videos, shorts, podcasts and social content for brands and creators around the world.</p>
            </div>
            <div className="hero-actions hero-reveal hero-delay-2">
              <a className="button button-secondary" href="#work">See selected work <span aria-hidden="true">↓</span></a>
              <BookingTrigger className="button button-primary cta-outline hero-connect">Connect <span aria-hidden="true">↗</span></BookingTrigger>
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
          </div>
          <PortfolioGrid />
        </section>

        <section className="section about" id="about" data-reveal>
          <div className="about-grid">
            <p className="kicker">About me</p>
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
              <p className="about-intro">{homepageAboutIntro}</p>
              <AboutStoryExperience />
              <div className="about-stats" aria-label="Experience in numbers">
                {stats.map((stat) => <div key={stat.value}><strong>{stat.value}</strong><p>{stat.label}</p></div>)}
              </div>
            </div>
          </div>
        </section>

        <ClientTestimonials />

        <section className="section services" id="services" data-reveal>
          <div className="services-intro">
            <p className="kicker">What I do</p>
            <p>I can handle the full edit from the first assembly to final exports, or work inside an existing team and workflow.</p>
          </div>
          <div className="service-list">
            {services.map((service) => <article className="service" key={service.number}><span>{service.number}</span><h3>{service.title}</h3><p>{service.copy}</p><i aria-hidden="true">↗</i></article>)}
          </div>
        </section>

        <YouTubeShowcase initialData={youtubeShowcaseData} />

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
              <BookingTrigger className="button button-primary cta-outline contact-connect">Connect <span aria-hidden="true">↗</span></BookingTrigger>
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
    </PageFrame>
  );
}
