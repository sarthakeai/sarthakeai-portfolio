/* eslint-disable @next/next/no-img-element -- Reuses the approved responsive About image assets. */

import type { Metadata } from "next";
import { PageFrame } from "../PageFrame";
import { aboutBodyCopy, aboutPersonalNote } from "../about-content";

const title = "About Sarthak Sharma | Video Editor & Creator";
const description = "Learn about Sarthak Sharma, a video editor and creator from India working across YouTube, short-form content, podcasts, tech and finance.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
  openGraph: { title, description, siteName: "Sarthak Sharma", url: "/about", type: "profile", images: [{ url: "/sarthak-about-1600.webp", width: 1600, height: 2132, alt: "Sarthak Sharma" }] },
  twitter: { card: "summary_large_image", title, description, images: ["/sarthak-about-1600.webp"] },
};

export default function AboutPage() {
  const profilePageData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: "https://sarthakeai.com/about",
    mainEntity: {
      "@type": "Person",
      "@id": "https://sarthakeai.com/#person",
      name: "Sarthak Sharma",
      alternateName: "Sarthak EAI",
      description: "Video editor and creator based in India.",
      image: "https://sarthakeai.com/sarthak-about-1600.webp",
      sameAs: [
        "https://www.instagram.com/sarthak.eai",
        "https://x.com/sarthakeai",
        "https://www.youtube.com/@sarthakeai",
        "https://www.upwork.com/freelancers/~01a047caaf8c8ed5b6",
      ],
    },
  };

  return (
    <PageFrame>
      <article className="standalone-page about-page" id="top">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageData) }} />
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
            {aboutBodyCopy.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <p>{aboutPersonalNote}</p>
            <a className="text-link" href="/work">See selected work <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </article>
    </PageFrame>
  );
}
