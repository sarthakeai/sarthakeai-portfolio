/* eslint-disable @next/next/no-img-element -- Reuses the approved responsive About image assets. */

import type { Metadata } from "next";
import { PageFrame } from "../PageFrame";

const title = "About Sarthak Sharma | Video Editor & Creator";
const description = "Learn about Sarthak Sharma, a video editor and creator from India working across YouTube, short-form content, podcasts, tech and finance.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
  openGraph: { title, description, url: "/about", type: "profile", images: [{ url: "/sarthak-about-1600.webp", width: 1600, height: 2132, alt: "Sarthak Sharma" }] },
  twitter: { card: "summary_large_image", title, description, images: ["/sarthak-about-1600.webp"] },
};

export default function AboutPage() {
  return (
    <PageFrame>
      <article className="standalone-page about-page" id="top">
        <header className="standalone-page-header">
          <p className="kicker">Video Editor &amp; Creator · New Delhi, India</p>
          <h1>About Sarthak Sharma</h1>
          <p className="standalone-page-lede">Working with brands and creators worldwide across YouTube, short-form content, podcasts, tech, finance and social.</p>
        </header>
        <div className="standalone-about-grid">
          <figure>
            <img src="/sarthak-about-960.webp" srcSet="/sarthak-about-960.webp 960w, /sarthak-about-1600.webp 1600w" sizes="(max-width: 50rem) calc(100vw - 2.5rem), 38vw" alt="Sarthak beside his motorcycle in the mountains" width="1600" height="2132" loading="eager" decoding="async" />
          </figure>
          <div className="standalone-about-copy">
            <p>I’ve been editing professionally for around five years, working with brands and creators across YouTube, podcasts, tech, finance and social.</p>
            <p>I also run a technology YouTube channel of my own. That means I’m not only thinking about clean cuts - I’m thinking about the idea, the audience and whether the video actually holds up once it’s published.</p>
            <p>Away from the timeline: photography, films, music, travel, cars and motorcycles.</p>
            <a className="text-link" href="/work">See selected work <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </article>
    </PageFrame>
  );
}
