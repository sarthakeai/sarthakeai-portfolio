import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import { countSlotsForLocalToday, getLocalDateKey, resolveValidTimeZone } from "../app/calendly-day.mjs";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("serves the standalone portfolio routes with unique indexable metadata", async () => {
  const routes = [
    ["/about", "About Sarthak Sharma | Video Editor & Creator", "Learn about Sarthak Sharma, a video editor and creator from India working across YouTube, short-form content, podcasts, tech and finance."],
    ["/work", "Video Editing Work | Sarthak Sharma", "Selected video editing work by Sarthak Sharma across YouTube, short-form content, podcasts, brand videos and motion graphics."],
    ["/work/short-form-video", "Short-Form Video Editing for Swan Bitcoin & Roxom | Sarthak Sharma", "Short-form video editing by Sarthak Sharma for Swan Bitcoin and Roxom, featuring interview-driven edits, captions, visual cutaways, motion graphics and sound design."],
    ["/work/21st-capital-introduction", "21st Capital Brand Video Editing | Sarthak Sharma", "A company introduction video edited by Sarthak Sharma for 21st Capital using presenter-led editing, diagrams, motion graphics and sound design."],
    ["/work/xiaomi-13-pro-review", "Xiaomi 13 Pro Review Video Editing | Sarthak Sharma", "A hands-on Xiaomi 13 Pro review created and edited by Sarthak Sharma for his technology YouTube channel."],
    ["/work/21st-capital-interview", "Podcast & Interview Video Editing | Sarthak Sharma", "Interview video editing by Sarthak Sharma for 21st Capital, including editing, captions, motion graphics and layout design."],
  ];

  for (const [path, title, description] of routes) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    const encodedTitle = title.replaceAll("&", "&amp;");
    assert.match(html, new RegExp(`<title>${encodedTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}<\\/title>`), path);
    assert.match(html, new RegExp(`<meta name="description" content="${description.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"\\/>`), path);
    assert.match(html, new RegExp(`<link rel="canonical" href="https://sarthakeai\\.com${path.replaceAll("/", "\\/")}"\\/>`), path);
    assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1, path);
    assert.doesNotMatch(html, /noindex|localhost|chatgpt\.site/, path);
  }

  const sitemapResponse = await render("/sitemap.xml");
  assert.equal(sitemapResponse.status, 200);
  const sitemap = await sitemapResponse.text();
  for (const [path] of [["/"], ...routes]) {
    assert.match(sitemap, new RegExp(`https://sarthakeai\\.com${path === "/" ? "/" : path.replaceAll("/", "\\/")}`));
  }
  assert.doesNotMatch(sitemap, /work\/swan-bitcoin|work\/roxom/);
});

test("server-renders the complete Sarthak portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Sarthak \| Video Editor<\/title>/);
  assert.match(html, /<link rel="icon" href="\/favicon\.ico" sizes="any" type="image\/x-icon"\/>/);
  assert.match(html, /<link rel="icon" href="\/favicon-48\.png" sizes="48x48" type="image\/png"\/>/);
  assert.match(html, /Sarthak/);
  assert.doesNotMatch(html, />Sarthak Sharma</);
  assert.match(html, /class="brand-signature brand-logo-only"/);
  assert.match(html, /Hi, I.m Sarthak/);
  assert.match(html, /class="hero-portrait hero-reveal"/);
  assert.match(html, /role="slider"/);
  assert.match(html, /id="work"/);
  assert.match(html, /Client testimonials/i);
  assert.match(html, /What clients say\./);
  assert.doesNotMatch(html, /Don’t take my word for it/);
  assert.match(html, /He goes above and beyond to deliver an incredible product every time\./);
  assert.match(html, /MEGAN O MORAN/);
  assert.match(html, /Co-Founder · Zimo Media/);
  assert.match(html, /Your product is in very good hands as long as he is working on it\./);
  assert.match(html, /PRADEEP CHINTAPALLI/);
  assert.match(html, /Upwork Client · Video Editing/);
  assert.doesNotMatch(html, /YouTube Channel · Video Editing/);
  assert.doesNotMatch(html, /Testimonial navigation|Previous testimonial|Next testimonial/);
  assert.match(html, /id="work"[\s\S]+Client testimonials[\s\S]+id="about"/i);
  assert.match(html, /id="about"/);
  assert.match(html, /id="services"/);
  assert.match(html, /id="youtube"/);
  assert.match(html, /id="contact"/);
  assert.doesNotMatch(html, />Swan Bitcoin short-form</);
  assert.doesNotMatch(html, />Roxom social edits</);
  assert.match(html, /Xiaomi 13 Pro review/);
  assert.match(html, /21st Capital introduction/);
  assert.match(html, /Motion &amp; Brand Animation/);
  assert.match(html, /21st Capital interview/);
  assert.match(html, />Short-form video\.</);
  assert.match(html, />YouTube long-form\.</);
  assert.match(html, />Brand introductions\.</);
  assert.match(html, />Motion &amp; brand animation\.</);
  assert.match(html, />Podcasts &amp; interviews\.</);
  assert.equal((html.match(/<article data-project-id="[^"]+" class="project editorial-project-card"/g) ?? []).length, 4);
  assert.equal((html.match(/class="short-card(?: [^"]*)?"/g) ?? []).length, 5);
  assert.match(html, /class="button button-secondary shorts-see-more"[^>]*>See more/);
  assert.match(html, /\/work\/swan\/swan-short-01-poster\.webp/);
  assert.doesNotMatch(html, /\/work\/swan\/swan-short-10-poster\.webp/);
  assert.match(html, /\/work\/swan\/swan-short-04-poster\.webp/);
  assert.doesNotMatch(html, /\/work\/roxom\/roxom-short-01-poster\.webp/);
  assert.match(html, /\/work\/youtube\/xiaomi-13-pro-poster\.webp/);
  assert.match(html, /\/work\/21st-capital\/21st-capital-intro-poster\.webp/);
  assert.match(html, /\/work\/motion\/motion-bitcoin-treasuries-poster\.webp/);
  assert.match(html, /\/work\/youtube\/21st-capital-interview-poster\.webp/);
  assert.doesNotMatch(html, /\.mp4/);
  assert.equal((html.match(/class="footer-directory-link/g) ?? []).length, 10);
  assert.match(html, /class="footer-upper"/);
  assert.match(html, /class="footer-directory"/);
  assert.match(html, /class="footer-divider"/);
  assert.match(html, />Navigation</);
  assert.match(html, />Elsewhere</);
  assert.match(html, />Instagram</);
  assert.match(html, />X \/ Twitter</);
  assert.match(html, /Email Sarthak at work@sarthakeai\.com/);
  assert.doesNotMatch(html, /class="footer-link-copy"/);
  assert.match(html, />YouTube</);
  assert.match(html, />Upwork</);
  assert.doesNotMatch(html, /footer-nav-index/);
  assert.match(html, /© 2026 Sarthak Sharma/);
  assert.match(html, /All Rights Reserved\./);
  assert.match(html, /aria-label="Back to top"/);
  assert.match(html, /class="footer-back-to-top" href="#top" aria-label="Back to top">↑<\/a>/);
  assert.doesNotMatch(html, /footer-accordion/);
  assert.doesNotMatch(html, /hero-meta/);
  assert.doesNotMatch(html, /aria-label="At a glance"/);
  assert.match(html, /My role/);
  assert.match(html, /350\+/);
  assert.match(html, /long-form videos/);
  assert.match(html, /class="text-link youtube-cta"/);
  assert.doesNotMatch(html, /Selected clients/);
  assert.doesNotMatch(html, /Some people I.ve worked with/);
  assert.match(html, /Selected brands &amp; creators/i);
  assert.match(html, /Selected brands and creators Sarthak has worked with/);
  assert.match(html, /Across YouTube, short-form, podcasts and social content\./);
  assert.match(html, /\/collaborators\/21st-capital\.svg/);
  assert.match(html, /\/collaborators\/btc-sessions\.webp/);
  assert.match(html, /\/collaborators\/roxom-tv\.png/);
  assert.match(html, /client-marquee-track/);
  assert.equal((html.match(/class="client-logo-set"/g) ?? []).length, 2);
  assert.match(html, /class="contact-email" href="mailto:work@sarthakeai\.com"/);
  assert.match(html, /work@sarthakeai\.com/);
  assert.doesNotMatch(html, /hello@sarthaksharma\.work/);
  assert.match(html, /brands and creators around the world/);
  assert.match(html, /Book a 30-minute call\./);
  assert.match(html, /Send me a project message\./);
  assert.match(html, />Connect <span/);
  assert.match(html, /checking availability/i);
  assert.doesNotMatch(html, /\b2 slots available\b/i);
  assert.match(html, /class="header-location"/);
  assert.match(html, /New Delhi/i);
  assert.match(html, /\/sarthak-about-960\.webp/);
  assert.doesNotMatch(html, /Press|to copy email/);
  assert.match(html, /https:\/\/formspree\.io\/f\/xkjwbaoe/);
  assert.match(html, /name="name"/);
  assert.match(html, /name="email"/);
  assert.match(html, /name="message"/);
  assert.match(html, /https:\/\/www\.youtube\.com\/@sarthakeai/);
  assert.match(html, /https:\/\/www\.instagram\.com\/sarthak\.eai/);
  assert.match(html, /https:\/\/x\.com\/sarthakeai/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape|Ready for your video|coming soon|Client names and links can be added/i);
});

test("keeps both testimonials real, stacked, exact, and accessible", async () => {
  const [component, data, meganImage, pradeepImage] = await Promise.all([
    readFile(new URL("../app/ClientTestimonials.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/testimonials-data.ts", import.meta.url), "utf8"),
    stat(new URL("../public/testimonials/megan-o-moran.webp", import.meta.url)),
    stat(new URL("../public/testimonials/pradeep-chintapalli.webp", import.meta.url)),
  ]);

  assert.equal((data.match(/id: "/g) ?? []).length, 2);
  assert.match(data, /image: \{[\s\S]+\/testimonials\/megan-o-moran\.webp/);
  assert.match(data, /id: "pradeep-chintapalli"[\s\S]+\/testimonials\/pradeep-chintapalli\.webp/);
  assert.match(data, /He goes above and beyond to deliver an incredible product every time\./);
  assert.match(data, /Sarthak is an absolute pleasure to work with\./);
  assert.match(data, /MEGAN O MORAN/);
  assert.match(data, /Co-Founder · Zimo Media/);
  assert.match(data, /Your product is in very good hands as long as he is working on it\./);
  assert.match(data, /Sarthak is very competent with editing videos as per your requirement\./);
  assert.match(data, /PRADEEP CHINTAPALLI/);
  assert.match(data, /Upwork Client · Video Editing/);
  assert.doesNotMatch(data, /YouTube Channel · Video Editing/);
  assert.doesNotMatch(data, /rating|stars|source|date|company logo/i);
  assert.match(component, /clientTestimonials\.map/);
  assert.match(component, /testimonials-list/);
  assert.match(component, /testimonial-entry/);
  assert.doesNotMatch(component, /useState|Previous testimonial|Next testimonial|ArrowLeft|ArrowRight|carousel|testimonial-controls/i);
  assert.match(component, /loading="lazy"/);
  assert.ok(meganImage.size < 100_000, `Megan testimonial image is ${meganImage.size} bytes`);
  assert.ok(pradeepImage.size < 300_000, `Pradeep testimonial image is ${pradeepImage.size} bytes`);
});

test("keeps interaction scoped and accessibility preferences explicit", async () => {
  const [page, pageFrame, siteFooter, layout, header, booking, availabilityRoute, contactForm, contactSubmit, portfolio, mediaPlayback, data, theme, timeline, css, swanLogo, favicon] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/PageFrame.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/SiteFooter.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/SiteHeader.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/BookingExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/calendly-availability/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/ContactForm.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/contact-form-submit.mjs", import.meta.url), "utf8"),
    readFile(new URL("../app/PortfolioGrid.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/media-playback.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/portfolio-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/ThemeToggle.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/HeroTimeline.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../public/collaborators/swan-bitcoin.svg", import.meta.url), "utf8"),
    readFile(new URL("../public/favicon.svg", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(page, /^"use client"/);
  assert.doesNotMatch(layout, /next\/headers|generateMetadata/);
  assert.match(layout, /metadataBase/);
  assert.match(layout, /const title = "Sarthak \| Video Editor"/);
  assert.match(layout, /icon:\s*\[[\s\S]*?\/favicon\.ico[\s\S]*?favicon-48\.png[\s\S]*?favicon-192\.png[\s\S]*?favicon-512\.png/);
  assert.match(layout, /apple-touch-icon\.png/);
  assert.match(favicon, /viewBox="0 0 32 32"/);
  assert.match(favicon, /<g fill="#ffffff"/);
  assert.match(favicon, /fill="#ff0000"/);
  assert.doesNotMatch(favicon, /prefers-color-scheme|<style>/);
  assert.match(layout, /history\.scrollRestoration = 'manual'/);
  assert.match(layout, /history\.replaceState/);
  assert.match(layout, /window\.scrollTo\(0, 0\)/);
  assert.doesNotMatch(layout, /DOMContentLoaded|addEventListener\('load'|addEventListener\('pageshow'/);
  assert.match(page, /className="hero-portrait hero-reveal"/);
  assert.match(page, /className="timeline-scroll-region"/);
  assert.match(page, /className="timeline-sticky-track"/);
  assert.match(page, /<HeroTimeline \/>/);
  assert.match(timeline, /^"use client"/);
  assert.match(timeline, /setPointerCapture/);
  assert.match(timeline, /role="slider"/);
  assert.match(timeline, /window\.addEventListener\("scroll", scheduleScrollUpdate, \{ passive: true \}\)/);
  assert.match(timeline, /window\.requestAnimationFrame\(updateFromScroll\)/);
  assert.match(timeline, /style\.transform = `translate3d\(\$\{pixelOffset\}px, 0, 0\)`/);
  assert.match(timeline, /type InteractionPhase = "idle" \| "dragging" \| "navigating"/);
  assert.match(timeline, /navigationFrameRef/);
  assert.match(timeline, /premiumEase/);
  assert.match(timeline, /--timeline-scroll-offset/);
  assert.match(timeline, /timeline-marker-notch/);
  assert.match(timeline, /const rulerTickCount = 37/);
  assert.match(timeline, /major: index % 3 === 0/);
  assert.match(timeline, /marker: rulerStart \+ index \* destinationTickInterval \* rulerStep/);
  assert.doesNotMatch(timeline, /timeline-marker-axis/);
  assert.match(timeline, /timeline-navigation-active/);
  assert.match(timeline, /TIMELINE_NAVIGATE_EVENT/);
  assert.match(timeline, /setAttribute\("inert", ""\)/);
  assert.match(timeline, /className="timeline-playhead-hit"/);
  assert.doesNotMatch(timeline, /setPosition/);
  assert.match(css, /\.timeline-sticky-track\s*\{[^}]+position:\s*absolute[^}]+bottom:\s*clamp\(18rem, 45vh, 26rem\)/s);
  assert.match(css, /\.hero-timeline\s*\{[^}]+position:\s*sticky[^}]+top:\s*var\(--timeline-header-offset, 4\.5rem\)/s);
  assert.match(css, /\.timeline-playhead\s*\{[^}]+left:\s*5%[^}]+width:\s*0[^}]+transform:\s*translate3d\(0, 0, 0\)[^}]+will-change:\s*transform/s);
  assert.match(css, /\.timeline-playhead::before\s*\{[^}]+width:\s*1\.125rem[^}]+height:\s*\.9rem/s);
  assert.match(css, /\.timeline-playhead::after\s*\{[^}]+width:\s*1px[^}]+height:\s*5rem/s);
  assert.match(css, /\.timeline-marker-notch\s*\{[^}]+clip-path:\s*polygon\(0 0, 100% 0, 50% 100%\)/s);
  assert.match(css, /\.timeline-ruler i\s*\{[^}]+position:\s*absolute[^}]+bottom:\s*0[^}]+transform:\s*translateX\(-50%\)/s);
  assert.match(css, /html\.timeline-navigation-active \.site-header:not\(\.menu-open\)\s*\{[^}]+opacity:\s*0[^}]+translate3d\(0, -\.75rem, 0\)/s);
  assert.match(css, /\.hero-timeline::before\s*\{[^}]+z-index:\s*-1[^}]+background:\s*color-mix\(in srgb, var\(--bg\) 99%, transparent\)[^}]+backdrop-filter:\s*blur\(\.65rem\)/s);
  assert.match(css, /\.hero-timeline\.is-stuck::before\s*\{[^}]+opacity:\s*1/s);
  assert.doesNotMatch(css, /\.hero-timeline\.is-stuck\s*\{[^}]+box-shadow/s);
  assert.doesNotMatch(css, /\.hero-timeline\.is-stuck\s*\{[^}]+border/s);
  assert.doesNotMatch(css, /\.timeline-playhead\s*\{[^}]+contain:\s*layout paint/s);
  assert.doesNotMatch(css, /\.timeline-marker-notch\s*\{[^}]+border-radius:\s*50%/s);
  assert.doesNotMatch(page, /className="portrait"/);
  assert.match(header, /^"use client"/);
  assert.match(header, /brand-logo-only/);
  assert.match(css, /\.brand-logo-only\s*\{[^}]+height:\s*1\.35rem/);
  assert.match(css, /@media \(max-width: 50rem\)[\s\S]+\.brand-logo-only\s*\{\s*height:\s*1\.35rem/);
  assert.match(header, /site-header-inner/);
  assert.match(header, /window\.dispatchEvent\(new CustomEvent\(TIMELINE_NAVIGATE_EVENT/);
  assert.doesNotMatch(header, /brand-name/);
  assert.match(header, /nav-desktop/);
  assert.match(header, /mobile-nav-label">Menu/);
  assert.match(header, /mobile-nav-index/);
  assert.match(header, /mobile-nav-cta/);
  assert.match(header, /navigateFromMenu/);
  assert.match(header, /scrollIntoView\(\{ behavior: reducedMotion \? "auto" : "smooth"/);
  assert.match(header, /window\.history\.pushState/);
  assert.match(header, /selectedHref === link\.href \? " is-selected"/);
  assert.doesNotMatch(header, /from "\.\/portfolio-data"/);
  assert.match(header, /availability\.slots === 1 \? "slot" : "slots"/);
  assert.match(header, /Checking availability/);
  assert.match(header, /View availability/);
  assert.match(header, /Today’s slots filled/);
  assert.match(header, /left today/);
  assert.match(header, /Intl\.DateTimeFormat\(\)\.resolvedOptions\(\)\.timeZone/);
  assert.match(header, /timeZone: getVisitorTimeZone\(\)/);
  assert.match(header, /\/api\/calendly-availability/);
  assert.match(header, /CALENDLY_BOOKING_COMPLETE_EVENT/);
  assert.match(header, /Asia\/Kolkata/);
  assert.match(header, /window\.setInterval\(updateClock, 1000\)/);
  assert.match(header, /window\.clearInterval\(interval\)/);
  assert.match(header, /header-location/);
  assert.match(header, /mobile-local-time/);
  assert.match(header, /availability-cta/);
  assert.match(header, /mobile-availability/);
  assert.match(header, /BookingTrigger/);
  assert.match(header, /instagram\.com\/sarthak\.eai/);
  assert.match(header, /x\.com\/sarthakeai/);
  assert.match(header, /youtube\.com\/@sarthakeai/);
  assert.doesNotMatch(page, /from "next\/image"/);
  assert.doesNotMatch(header, /from "next\/image"/);
  assert.doesNotMatch(portfolio, /from "next\/image"/);
  assert.match(page, /fetchPriority="high"/);
  assert.match(css, /\.hero-portrait\s*\{[^}]+aspect-ratio:\s*1[^}]+overflow:\s*hidden[^}]+border-radius:\s*14px/s);
  assert.match(css, /@media \(max-width: 50rem\)[\s\S]+\.hero-portrait\s*\{[^}]+border-radius:\s*12px/s);
  assert.match(css, /\.hero-portrait img\s*\{[^}]+object-fit:\s*cover/s);
  assert.match(page, /loading="lazy"/);
  assert.match(layout, /rel="preload" href="\/eai-logo-dark\.svg"/);
  assert.match(layout, /rel="preload" href="\/eai-logo-light\.svg"/);
  assert.match(css, /eai-logo-dark\.svg/);
  assert.match(css, /eai-logo-light\.svg/);
  assert.doesNotMatch(css, /\.about[^}]+content-visibility:\s*auto/s);
  assert.match(css, /\.mobile-nav-text[^}]+var\(--font-geist-sans\)/s);
  assert.match(css, /font-size:\s*clamp\(1\.8rem, 7\.7vw, 2\.125rem\)/);
  assert.match(css, /transform:\s*translateY\(\.625rem\)/);
  assert.match(css, /opacity 340ms var\(--ease-out\) var\(--row-open-delay\)/);
  assert.match(css, /--row-open-delay:\s*245ms/);
  assert.match(css, /\.mobile-nav-item\.is-selected/);
  assert.match(css, /--timeline-sticky-height:\s*8\.25rem/);
  assert.match(css, /--timeline-sticky-gap:\s*12px/);
  assert.match(css, /scroll-margin-top:\s*var\(--timeline-scroll-offset, calc\(var\(--timeline-sticky-height\) \+ var\(--timeline-sticky-gap\)\)\)/);
  assert.match(css, /min-height:\s*100dvh/);
  assert.match(css, /env\(safe-area-inset-top\)/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(portfolio, /aria-pressed/);
  assert.doesNotMatch(portfolio, /button\.scrollIntoView/);
  assert.match(portfolio, /filters\.scrollTo\(\{ left: Math\.max\(0, left\), behavior: reducedMotion \? "auto" : "smooth" \}\)/);
  assert.match(portfolio, /fetchPriority=\{priority \? "high" : "auto"\}/);
  assert.match(portfolio, /aria-live="polite"/);
  assert.match(portfolio, /aria-modal="true"/);
  assert.match(portfolio, /View details for/);
  assert.match(portfolio, /project-open-media-only/);
  assert.match(portfolio, /const showMobileProjectCta = project\.id === "short-form-video" \|\| isXiaomiProject;/);
  assert.match(portfolio, /const hideProjectOverlay = mediaOnly && !showMobileProjectCta;/);
  assert.match(portfolio, /!hideProjectOverlay \? <span>View project/);
  assert.match(css, /\.portfolio-category-heading\s*\{[^}]+font:\s*620 clamp\(2rem, 3\.4vw, 3\.5rem\)\/\.98/s);
  assert.doesNotMatch(css, /\.nonshort-category-section \.portfolio-category-heading\s*\{[^}]+font-size:/s);
  assert.match(portfolio, /const hideCardProjectLink = project\.id === "youtube-long-form" \|\| project\.id === "podcast-interview"/);
  assert.match(portfolio, /!hideCardProjectLink && project\.externalUrl/);
  assert.match(portfolio, /project-eyebrow-separator/);
  assert.match(portfolio, /focusableElements/);
  assert.match(portfolio, /project\.roles\.map/);
  assert.doesNotMatch(portfolio, /project\.deliverables|project-deliverables|hideMetadata/);
  assert.match(portfolio, /project\.result/);
  assert.match(portfolio, /selectedProject\.media/);
  assert.match(portfolio, /project\.category === "Short-form video"/);
  assert.match(portfolio, /shortProjects\.flatMap/);
  assert.match(portfolio, /const shortInitialCount = 5/);
  assert.match(portfolio, /shortMedia\.slice\(0, shortInitialCount\)/);
  assert.match(portfolio, /shortMedia\.slice\(shortInitialCount, 14\)/);
  assert.match(portfolio, /const mobileShortMedia = shortMedia/);
  assert.match(portfolio, /shortMedia = shortProjects\.flatMap/);
  assert.doesNotMatch(portfolio, /isTwoColumnShortLayout|syncShortLayout/);
  assert.match(portfolio, /className="short-form-mobile-content"[\s\S]*?<EditorialProjectCard/);
  assert.match(portfolio, /className="short-form-desktop-content"[\s\S]*?shortMedia\.slice\(0, shortInitialCount\)/);
  assert.match(portfolio, /previewCount=\{3\}/);
  assert.match(portfolio, /eyebrowText="Swan Bitcoin \+ Roxom · Short-form social video"/);
  assert.match(portfolio, /A selection of short-form edits across Swan Bitcoin and Roxom, cut from interviews and talks with captions, visual cutaways, motion graphics and tight pacing\./);
  assert.match(portfolio, /roles: \["Editing", "Captions", "Motion Graphics", "Sound Design"\]/);
  assert.match(portfolio, /onOpen=\{\(trigger\) => openProject\(mobileShortFormProject, trigger\)\}/);
  assert.match(portfolio, /video-modal-short-form/);
  assert.match(portfolio, /video-modal-short-grid/);
  assert.match(portfolio, /className=\{`short-card/);
  assert.match(portfolio, /data-reveal/);
  assert.match(portfolio, /className="short-card-control"/);
  assert.match(portfolio, /aria-pressed=\{isPlaying\}/);
  assert.doesNotMatch(portfolio, /Click for sound/);
  assert.doesNotMatch(portfolio, /onPointerEnter=\{startPreview\}/);
  assert.doesNotMatch(portfolio, /onPointerLeave=\{stopPreview\}/);
  assert.match(portfolio, /aria-expanded=\{shortExpanded\}/);
  assert.match(portfolio, /shortExpanded \? "See less" : "See more"/);
  assert.match(portfolio, /const collapseShorts = \(\) =>/);
  assert.match(portfolio, /stopAllMedia\(\);/);
  assert.match(portfolio, /const expandedHeight = extras\.scrollHeight/);
  assert.match(portfolio, /shortExpansionPhase === "opening" \? extras\.getBoundingClientRect\(\)\.height : extras\.scrollHeight/);
  assert.match(portfolio, /onTransitionEnd=\{onShortExtrasTransitionEnd\}/);
  assert.doesNotMatch(portfolio, /const collapseShorts = \(\) => \{[\s\S]*?scrollIntoView\([\s\S]*?\n {2}\};\n\n {2}const toggleShorts/);
  assert.match(portfolio, /preload="none"/);
  assert.match(portfolio, /playsInline/);
  assert.match(portfolio, /poster=\{media\.poster\}/);
  assert.match(portfolio, /<source src=\{media\.videoUrl\} type="video\/mp4"/);
  assert.match(portfolio, /video-modal-poster/);
  assert.match(portfolio, /setStarted\(true\)/);
  assert.match(portfolio, /videoRef\.current\?\.play\(\)/);
  assert.doesNotMatch(portfolio, /autoPlay/);
  assert.match(portfolio, /youtube-nocookie\.com\/embed/);
  assert.match(portfolio, /Watch on YouTube/);
  assert.match(portfolio, /MEDIA_PLAYBACK_EVENT/);
  assert.match(portfolio, /stopMediaWithin\(dialogRef\.current\)/);
  assert.match(portfolio, /onPlay=\{\(event\) => activateMedia/);
  assert.match(mediaPlayback, /video\.pause\(\)/);
  assert.match(mediaPlayback, /activeId/);
  assert.match(mediaPlayback, /iframe\.src = "about:blank"/);
  assert.match(data, /roles: string\[\]/);
  assert.match(data, /export type ProjectMedia/);
  assert.match(data, /title: "Swan Bitcoin short-form"/);
  assert.match(data, /title: "Roxom social edits"/);
  assert.match(data, /title: "Xiaomi 13 Pro review"/);
  assert.match(data, /title: "21st Capital introduction"/);
  assert.match(data, /title: "Motion & Brand Animation"/);
  assert.match(data, /title: "21st Capital interview"/);
  assert.match(data, /contentType: "Short-form social edits"/);
  assert.doesNotMatch(data, /deliverables:|Deliverables|10 vertical social edits|4 vertical social edits|1 long-form YouTube review|1 brand introduction|3 brand animations|1 interview episode|Ten vertical edits|Four vertical clips|Three short brand animations/);
  assert.equal((data.match(/category: "Short-form video"/g) ?? []).length, 2);
  assert.match(data, /"YouTube long-form"/);
  assert.match(data, /"Brand introductions"/);
  assert.match(data, /"Motion & brand animation"/);
  assert.match(data, /"Podcasts & interviews"/);
  assert.match(data, /\{ value: "5", label: "years editing professionally" \}/);
  assert.match(data, /export const youtubeStats = \[\s*\{ value: "24K\+", label: "subscribers" \},\s*\];/);
  assert.equal((data.match(/id: "swan-\d{2}"/g) ?? []).length, 10);
  assert.equal((data.match(/id: "roxom-\d{2}"/g) ?? []).length, 4);
  assert.doesNotMatch(portfolio, /project-meta-line/);
  assert.match(data, /https:\/\/youtu\.be\/5MWtToYnA00\?si=C8LS743wbJXIkAWy/);
  assert.match(data, /https:\/\/youtu\.be\/X5Z5VLdJxC4\?si=xjztMcaGd1S-CfQH/);
  assert.match(data, /xiaomi-13-pro-poster\.webp/);
  assert.match(data, /21st-capital-interview-poster\.webp/);
  assert.match(data, /posterFallbacks/);
  assert.doesNotMatch(data, /export const availability|slots:\s*2/);
  assert.match(data, /type\?: "brand" \| "creator"/);
  assert.match(data, /export const clients: Client\[\] = \[/);
  assert.match(data, /name: "Swan Bitcoin"/);
  assert.match(data, /name: "Simply Bitcoin"/);
  assert.match(data, /name: "Swan Bitcoin"[\s\S]+name: "Bitcoin Treasuries"[\s\S]+name: "Simply Bitcoin"[\s\S]+name: "Roxom"/);
  assert.match(data, /width: number/);
  assert.match(data, /size\?: "standard" \| "wide" \| "tall" \| "padded"/);
  assert.match(data, /name: "BTC Sessions"[^\n]+size: "padded"/);
  assert.match(data, /presence\?: "balanced" \| "strong"/);
  assert.match(page, /data-logo-presence=/);
  assert.match(css, /\.client-strip\s*\{[^}]+overflow:\s*hidden/s);
  assert.doesNotMatch(css, /\.client-strip[^}]+mask-image:/s);
  assert.match(css, /data-theme-treatment="invert"/);
  assert.match(css, /data-logo-presence="strong"/);
  assert.match(css, /\.client-logo-set img \{[^}]+filter:\s*none;[^}]+opacity:\s*\.82/s);
  assert.match(css, /Approved dark-mode logo treatment/);
  assert.match(css, /html\[data-theme="dark"\] \.client-logo-set img\[data-theme-treatment="invert"\][^}]+brightness\(\.9\) contrast\(\.9\)[^}]+opacity:\s*\.82/s);
  assert.match(css, /html\[data-theme="dark"\] \.client-logo-set img\[data-logo-presence="strong"\][^}]+opacity:\s*\.88/s);
  assert.match(swanLogo, /#00305E/);
  assert.doesNotMatch(swanLogo, /currentColor/);
  assert.match(css, /img\[src\$="\/collaborators\/swan-bitcoin\.svg"\][^}]+brightness\(0\) invert\(1\) brightness\(\.9\) contrast\(\.9\)/);
  assert.match(css, /\.client-strip::-webkit-scrollbar/);
  assert.match(css, /animation:\s*collaborator-marquee 34s linear infinite/);
  assert.match(css, /translate3d\(-50%, 0, 0\)/);
  assert.match(css, /\.client-logo-set\[aria-hidden="true"\]\s*\{\s*display:\s*none/);
  assert.match(data, /export const youtubeVideos: YouTubeVideo\[\] = \[\]/);
  assert.match(theme, /localStorage\.setItem\("theme"/);
  assert.match(booking, /https:\/\/calendly\.com\/officialsarthakeai\/30min/);
  assert.match(booking, /calendly\.event_scheduled/);
  assert.match(booking, /CALENDLY_BOOKING_COMPLETE_EVENT/);
  assert.match(availabilityRoute, /CALENDLY_ACCESS_TOKEN/);
  assert.match(availabilityRoute, /CALENDLY_EVENT_TYPE_URI/);
  assert.match(availabilityRoute, /\/event_type_available_times/);
  assert.match(availabilityRoute, /AVAILABILITY_LOOKAHEAD_MS = 48 \* 60 \* 60 \* 1000/);
  assert.match(availabilityRoute, /CACHE_TTL_MS = 5 \* 60 \* 1000/);
  assert.match(availabilityRoute, /resolveValidTimeZone/);
  assert.match(availabilityRoute, /countSlotsForLocalToday/);
  assert.doesNotMatch(availabilityRoute, /NEXT_PUBLIC_CALENDLY/);
  assert.match(contactSubmit, /https:\/\/formspree\.io\/f\/xkjwbaoe/);
  assert.match(contactSubmit, /Accept: "application\/json"/);
  assert.match(contactForm, /name="name"[^>]+required/);
  assert.match(contactForm, /type="email" name="email"[^>]+required/);
  assert.match(contactForm, /textarea name="message"[^>]+required/);
  assert.match(contactForm, /event\.ctrlKey && !event\.metaKey/);
  assert.match(contactForm, /requestSubmit\(\)/);
  assert.match(contactForm, /Message sent\. I’ll get back to you soon\./);
  assert.match(contactForm, /Something went wrong\. Please try again or email me directly\./);
  assert.match(contactForm, /mailto:officialsarthakeai@gmail\.com/);
  assert.match(contactForm, /<div className="contact-form-actions">\s*<p className="contact-form-hint">[\s\S]*?<button className="button button-primary contact-submit"/);
  assert.match(booking, /role="dialog"/);
  assert.match(booking, /aria-modal="true"/);
  assert.match(booking, /<iframe/);
  assert.match(booking, /event\.key === "Escape"/);
  assert.match(booking, /body\.style\.overflow = "hidden"/);
  assert.match(booking, /returnFocus\?\.focus/);
  assert.match(booking, /setCalendarSlow/);
  assert.match(booking, /Open Calendly/);
  assert.match(booking, /BookingTrigger must be used within BookingProvider/);
  assert.match(page, /<PageFrame>/);
  assert.match(pageFrame, /<BookingProvider>/);
  assert.equal((page.match(/<BookingTrigger/g) ?? []).length, 2);
  assert.match(page, /<ContactForm \/>/);
  assert.match(page, /<div className="contact-form-intro">[\s\S]*?<p className="contact-route-label">Prefer to write\?<\/p>[\s\S]*?Send me a project message\.[\s\S]*?<a className="contact-email" href="mailto:work@sarthakeai\.com"><EnvelopeSimple[\s\S]*?work@sarthakeai\.com/);
  assert.doesNotMatch(page, /EmailShortcut|Press E/);
  assert.doesNotMatch(page, /officialsarthakeai@gmail\.com/);
  assert.match(css, /\.contact-form\s*\{/);
  assert.match(css, /\.contact-bottom, \.contact-form-intro\s*\{[^}]+grid-template-columns:\s*minmax\(12rem, \.75fr\) minmax\(0, 1\.25fr\)/s);
  assert.match(css, /\.contact-email\s*\{[^}]+border-bottom:\s*1px solid var\(--line\)/s);
  assert.match(css, /\.contact-form-actions\s*\{[^}]+display:\s*flex[^}]+align-items:\s*center[^}]+justify-content:\s*space-between/s);
  assert.match(css, /\.contact-submit/);
  assert.doesNotMatch(css, /email-shortcut/);
  assert.match(theme, /role="switch"/);
  assert.match(theme, /aria-checked/);
  assert.match(theme, /Switch to light mode/);
  assert.match(theme, /Switch to dark mode/);
  assert.match(theme, /<svg/);
  assert.match(theme, /stroke="currentColor"/);
  assert.doesNotMatch(theme, /☀|☾|🌙/);
  assert.doesNotMatch(theme, /prefers-color-scheme/);
  assert.match(layout, /stored === 'dark' \? 'dark' : 'light'/);
  assert.doesNotMatch(layout, /prefers-color-scheme/);
  assert.match(header, /aria-expanded/);
  assert.match(header, /body\.style\.overflow = "hidden"/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /--frame-bg/);
  assert.match(css, /project-open/);
  assert.match(css, /modal-panel-in/);
  assert.match(css, /\.project-preview-triptych/);
  assert.match(css, /\.portfolio-category-heading\s*\{[^}]+font:[^}]+var\(--font-geist-sans\)/s);
  assert.match(css, /\.nonshort-category-grid\s*\{[^}]+repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.match(css, /\.nonshort-category-section\s*\{[^}]+gap:\s*clamp\(2rem, 2\.5vw, 2\.5rem\)/s);
  assert.match(css, /\.nonshort-category-section \.portfolio-category-heading\s*\{[^}]+min-height:\s*0[^}]+margin-bottom:\s*0/s);
  assert.doesNotMatch(css, /\.nonshort-category-section \.portfolio-category-heading\s*\{[^}]+min-height:\s*1\.96em/s);
  assert.match(css, /\.editorial-project-card \.project-visual\s*\{[^}]+aspect-ratio:\s*16\s*\/\s*9/s);
  assert.match(css, /\.xiaomi-thumbnail-shell \.poster-fade\s*\{[^}]+scale:\s*1\.13/s);
  assert.match(css, /\.shorts-grid, \.shorts-expanded-grid\s*\{[^}]+repeat\(10, minmax\(0, 1fr\)\)/s);
  assert.match(css, /\.button\.shorts-see-more\s*\{[^}]+min-height:\s*2\.75rem[^}]+padding:\s*0 1\.25rem[^}]+border-radius:\s*\.625rem[^}]+font-size:\s*\.875rem[^}]+font-weight:\s*600/s);
  assert.match(css, /\.short-card\s*\{[^}]+aspect-ratio:\s*9\s*\/\s*16/s);
  assert.match(css, /\.short-card\s*\{[^}]+border-radius:\s*clamp\(1rem, 1\.35vw, 1\.25rem\)/s);
  assert.match(css, /\.shorts-expanded-wrapper\s*\{[^}]+overflow:\s*hidden[^}]+height 480ms cubic-bezier\(\.22, 1, \.36, 1\)/s);
  assert.match(css, /\.shorts-expanded-grid \.short-card:nth-child\(6\)\s*\{\s*grid-column:\s*2 \/ span 2/s);
  assert.match(css, /\.short-card-control/);
  assert.match(css, /\.short-card\.is-playing \.short-card-control\s*\{[^}]+opacity:\s*0[^}]+pointer-events:\s*none/s);
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\)[\s\S]+\.short-card\.is-playing:hover \.short-card-control\s*\{[^}]+opacity:\s*1[^}]+pointer-events:\s*auto/s);
  assert.match(css, /@media \(hover: none\), \(pointer: coarse\)[\s\S]+\.short-card\.is-playing \.short-card-control\s*\{[^}]+opacity:\s*1[^}]+pointer-events:\s*auto/s);
  assert.doesNotMatch(css, /\.short-sound-prompt/);
  assert.doesNotMatch(css, /short-card-extra|shorts-grid\.is-collapsing/);
  assert.doesNotMatch(css, /\.short-form-section\s*\{\s*overflow-anchor:\s*none/);
  assert.match(css, /\.short-form-mobile-content\s*\{\s*display:\s*none/);
  assert.match(css, /\.short-form-desktop-content\s*\{\s*display:\s*contents/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.short-form-mobile-content\s*\{\s*display:\s*contents[\s\S]+?\.short-form-desktop-content\s*\{\s*display:\s*none/);
  assert.match(css, /@media \(min-width: 42\.0625rem\) and \(max-width: 64rem\)[\s\S]+\.shorts-grid\s*\{[^}]+repeat\(6, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(min-width: 42\.0625rem\) and \(max-width: 64rem\)[\s\S]+\.shorts-grid > \.short-card\s*\{[^}]+grid-column:\s*span 2/);
  assert.match(css, /@media \(min-width: 42\.0625rem\) and \(max-width: 64rem\)[\s\S]+\.shorts-grid > \.short-card:nth-child\(4\)\s*\{[^}]+grid-column:\s*2 \/ span 2/);
  assert.match(css, /@media \(min-width: 42\.0625rem\) and \(max-width: 64rem\)[\s\S]+\.shorts-expanded-grid\s*\{[^}]+repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+--portfolio-mobile-category-title-size:\s*clamp\(1\.875rem, 9vw, 2\.5rem\)/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+--portfolio-mobile-category-gap:\s*3\.875rem/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.short-form-section \+ \.nonshort-category-grid\s*\{\s*margin-top:\s*0/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.nonshort-category-grid\s*\{\s*gap:\s*var\(--portfolio-mobile-category-gap\)/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.portfolio-category-section \.portfolio-category-heading\s*\{[^}]+font-size:\s*var\(--portfolio-mobile-category-title-size\)[^}]+font-weight:\s*620[^}]+line-height:\s*\.98[^}]+letter-spacing:\s*-\.055em[^}]+text-align:\s*left/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.shorts-grid, \.shorts-expanded-grid\s*\{[^}]+repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.mobile-short-project-card \.project-visual\s*\{\s*aspect-ratio:\s*27 \/ 16/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.video-modal-short-form \.video-modal-media-portrait\s*\{[^}]+repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.video-modal-short-grid\s*\{[^}]+grid-auto-flow:\s*row/);
  assert.match(css, /\.video-modal-short-grid > figure\s*\{[^}]+grid-column:\s*auto[^}]+grid-row:\s*auto/);
  assert.match(css, /@media \(max-width: 50rem\)[\s\S]+\.video-modal-short-grid\s*\{[^}]+repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.shorts-grid, \.shorts-expanded-grid\s*\{[^}]+repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.project\.portrait \.project-visual\.has-media\s*\{\s*aspect-ratio:\s*27\/16/);
  assert.match(css, /\.project-preview-triptych\s*\{[^}]+repeat\(3, minmax\(0, 1fr\)\)[^}]+padding:\s*0/s);
  assert.match(css, /\.project-meta-line\s*\{[^}]+grid-template-columns:\s*auto minmax\(0, 1fr\) auto/s);
  assert.doesNotMatch(css, /project-art-media/);
  assert.doesNotMatch(css, /background:\s*rgba\(12,12,11,\.74\)/);
  assert.doesNotMatch(css, /transform:\s*scale\(1\.045\)/);
  assert.match(css, /\.video-modal-media-portrait\s*\{[^}]+repeat\(3, minmax\(0, 1fr\)\)/s);
  assert.match(css, /\.video-modal-media video\s*\{[^}]+width:\s*100%/s);
  assert.match(css, /\.video-modal-youtube/);
  assert.match(css, /\.button\s*\{[^}]+border-radius:\s*var\(--control-radius\)/s);
  assert.match(css, /\.button\s*\{[^}]+min-height:\s*3\.5rem[^}]+font-size:\s*1rem[^}]+font-weight:\s*600/s);
  assert.match(page, /className="button button-secondary" href="#work"/);
  assert.match(page, /className="button button-primary hero-connect"/);
  assert.doesNotMatch(css, /\.hero-connect\s*\{[^}]+text-transform:\s*uppercase/s);
  assert.match(css, /\.about-portrait/);
  assert.match(css, /\.booking-calendar\s*\{[^}]+justify-content:\s*center/s);
  assert.match(css, /html\[data-theme="dark"\] \.theme-track i \{ transform: translateX\(1\.3125rem\)/);
  assert.doesNotMatch(css, /margin-inline:\s*calc\(var\(--page-gutter\)\s*\*\s*-1\)/);
  assert.match(css, /prefers-reduced-transparency:\s*reduce/);
  assert.match(css, /prefers-contrast:\s*more/);
  assert.match(css, /\.footer-upper[^}]+grid-template-columns:\s*minmax\(0, 1fr\) auto/s);
  assert.match(css, /\.footer-directory[^}]+grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.match(css, /\.footer-link-icon\s*\{[^}]+width:\s*1\.3125rem[^}]+height:\s*1\.3125rem/s);
  assert.match(siteFooter, /href:\s*"mailto:work@sarthakeai\.com"/);
  assert.doesNotMatch(page, /<small>work@sarthakeai\.com<\/small>/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.footer-upper[^}]+order:\s*1[^}]+grid-template-columns:\s*minmax\(0, 1fr\) auto/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.footer-directory[^}]+grid-template-columns:\s*minmax\(0, \.85fr\) minmax\(0, 1\.15fr\)/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.footer-social-link \.footer-link-title[^}]+white-space:\s*nowrap/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.footer-divider[^}]+order:\s*2/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.footer-copyright[^}]+order:\s*3/);
  assert.match(css, /\.footer-back-to-top/);
  assert.match(css, /\.footer-copyright\s*\{[^}]+text-align:\s*right/s);
  assert.doesNotMatch(css, /footer-nav-row|footer-nav-index|footer-social-links|social-icon/);
});

test("counts only future Calendly starts on the visitor's local calendar day", () => {
  const now = Date.parse("2026-01-01T01:00:00.000Z");
  const startTimes = [
    "2025-12-31T23:00:00.000Z",
    "2026-01-01T02:00:00.000Z",
    "2026-01-01T06:00:00.000Z",
    "2026-01-02T02:00:00.000Z",
  ];

  assert.equal(getLocalDateKey(new Date(now), "America/New_York"), "2025-12-31");
  assert.equal(getLocalDateKey(new Date(now), "Asia/Kolkata"), "2026-01-01");
  assert.equal(countSlotsForLocalToday(startTimes, "America/New_York", now), 1);
  assert.equal(countSlotsForLocalToday(startTimes, "Europe/London", now), 2);
  assert.equal(countSlotsForLocalToday(startTimes, "Asia/Kolkata", now), 2);
  assert.equal(resolveValidTimeZone("America/Los_Angeles"), "America/Los_Angeles");
  assert.equal(resolveValidTimeZone("Not/A_Time_Zone"), null);
});

test("keeps initial visual assets lightweight", async () => {
  const [portrait, aboutPortrait, darkLogo, lightLogo] = await Promise.all([
    stat(new URL("../public/sarthak-sharma.webp", import.meta.url)),
    stat(new URL("../public/sarthak-about-1600.webp", import.meta.url)),
    stat(new URL("../public/eai-logo-dark.svg", import.meta.url)),
    stat(new URL("../public/eai-logo-light.svg", import.meta.url)),
  ]);
  assert.ok(portrait.size < 20_000, `hero portrait is ${portrait.size} bytes`);
  assert.ok(aboutPortrait.size < 800_000, `About portrait is ${aboutPortrait.size} bytes`);
  assert.ok(darkLogo.size < 3_000, `dark logo is ${darkLogo.size} bytes`);
  assert.ok(lightLogo.size < 3_000, `light logo is ${lightLogo.size} bytes`);
});

test("keeps portfolio media optimized and poster-led", async () => {
  const videoPaths = [
    "21st-capital/21st-capital-intro-preview.mp4",
    "motion/motion-bitcoin-treasuries-preview.mp4",
    "motion/motion-hashrateup-swan-preview.mp4",
    "motion/motion-swan-logo-preview.mp4",
    ...Array.from({ length: 4 }, (_, index) => `roxom/roxom-short-${String(index + 1).padStart(2, "0")}-preview.mp4`),
    ...Array.from({ length: 10 }, (_, index) => `swan/swan-short-${String(index + 1).padStart(2, "0")}-preview.mp4`),
  ];
  const posterPaths = [
    "youtube/xiaomi-13-pro-poster.webp",
    "youtube/21st-capital-interview-poster.webp",
    "21st-capital/21st-capital-intro-poster.webp",
    "motion/motion-bitcoin-treasuries-poster.webp",
    "motion/motion-hashrateup-swan-poster.webp",
    "motion/motion-swan-logo-poster.webp",
    ...Array.from({ length: 4 }, (_, index) => `roxom/roxom-short-${String(index + 1).padStart(2, "0")}-poster.webp`),
    ...Array.from({ length: 10 }, (_, index) => `swan/swan-short-${String(index + 1).padStart(2, "0")}-poster.webp`),
  ];
  const videoStats = await Promise.all(videoPaths.map((path) => stat(new URL(`../public/work/${path}`, import.meta.url))));
  const posterStats = await Promise.all(posterPaths.map((path) => stat(new URL(`../public/work/${path}`, import.meta.url))));
  const totalVideoBytes = videoStats.reduce((total, file) => total + file.size, 0);
  const totalPosterBytes = posterStats.reduce((total, file) => total + file.size, 0);
  assert.equal(videoStats.length, 18);
  assert.equal(posterStats.length, 20);
  assert.ok(totalVideoBytes < 82_000_000, `portfolio previews total ${totalVideoBytes} bytes`);
  assert.ok(totalPosterBytes < 650_000, `portfolio posters total ${totalPosterBytes} bytes`);
  assert.ok(Math.max(...posterStats.map((file) => file.size)) < 50_000, "every portfolio poster stays below 50 KB");
});
