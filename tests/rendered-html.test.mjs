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
    ["/work", "Sarthak Sharma | Selected Video Editing Work", "Selected video editing work by Sarthak Sharma across YouTube, short-form content, podcasts, brand videos and motion graphics."],
    ["/work/short-form-video", "Short-Form Video Editing for Swan Bitcoin & Roxom | Sarthak Sharma", "Short-form video editing by Sarthak Sharma for Swan Bitcoin and Roxom, featuring interview-driven edits, captions, visual cutaways, motion graphics and sound design."],
    ["/work/21st-capital-introduction", "21st Capital Brand Video Editing | Sarthak Sharma", "A company introduction video edited by Sarthak Sharma for 21st Capital using presenter-led editing, diagrams, motion graphics and sound design."],
    ["/work/xiaomi-13-pro-review", "Xiaomi 13 Pro Review Video Editing | Sarthak Sharma", "A hands-on Xiaomi 13 Pro review created and edited by Sarthak Sharma for his technology YouTube channel."],
    ["/work/motion-brand-animation", "Motion & Brand Animation | Sarthak Sharma", "Selected motion and brand animation work by Sarthak Sharma for Bitcoin Treasuries, HashrateUp × Swan and Swan."],
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
    assert.doesNotMatch(html, /__sourcePage|__renderObservation/, path);
  }

  const sitemapResponse = await render("/sitemap.xml");
  assert.equal(sitemapResponse.status, 200);
  const sitemap = await sitemapResponse.text();
  for (const [path] of [["/"], ...routes]) {
    assert.match(sitemap, new RegExp(`https://sarthakeai\\.com${path === "/" ? "/" : path.replaceAll("/", "\\/")}`));
  }
  assert.doesNotMatch(sitemap, /work\/swan-bitcoin|work\/roxom/);
  assert.doesNotMatch(sitemap, /https:\/\/sarthakeai\.com\/about(?:<|\s)/);
  assert.doesNotMatch(sitemap, /localhost|chatgpt\.site|www\.sarthakeai\.com/);

  const robotsResponse = await render("/robots.txt");
  assert.equal(robotsResponse.status, 200);
  const robots = await robotsResponse.text();
  assert.match(robots, /User-Agent: \*/i);
  assert.match(robots, /User-Agent: Googlebot-Image/i);
  assert.match(robots, /Allow: \//);
  assert.match(robots, /Sitemap: https:\/\/sarthakeai\.com\/sitemap\.xml/i);

  const aboutResponse = await render("/about");
  assert.equal(aboutResponse.status, 308);
  assert.equal(aboutResponse.headers.get("location"), "/#about");

  const legacyAboutPageResponse = await render("/about/page");
  assert.equal(legacyAboutPageResponse.status, 308);
  assert.equal(legacyAboutPageResponse.headers.get("location"), "/#about");

  const legacyXiaomiPageResponse = await render("/work/xiaomi-13-pro-review/page");
  assert.equal(legacyXiaomiPageResponse.status, 308);
  assert.equal(legacyXiaomiPageResponse.headers.get("location"), "/work/xiaomi-13-pro-review");

  const missingResponse = await render("/definitely-missing-seo-check");
  assert.equal(missingResponse.status, 404);
});

test("server-renders the complete Sarthak portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Sarthak Sharma — Video Editor for Brands &amp; Creators<\/title>/);
  assert.match(html, /<meta name="description" content="Video editor and creator working with brands and creators worldwide across YouTube, short-form, podcasts and motion graphics\. Based in New Delhi, India\."\/>/);
  assert.match(html, /<link rel="canonical" href="https:\/\/sarthakeai\.com\/?"\/>/);
  assert.match(html, /<meta property="og:title" content="Sarthak Sharma — Video Editor for Brands &amp; Creators"\/>/);
  assert.match(html, /<meta property="og:description" content="Video editor and creator working with brands and creators worldwide across YouTube, short-form, podcasts and motion graphics\. Based in New Delhi, India\."\/>/);
  assert.match(html, /<meta property="og:url" content="https:\/\/sarthakeai\.com\/?"\/>/);
  assert.match(html, /<meta property="og:site_name" content="Sarthak Sharma"\/>/);
  assert.match(html, /<meta property="og:image" content="https:\/\/sarthakeai\.com\/og-white\.png"\/>/);
  assert.match(html, /<meta name="twitter:title" content="Sarthak Sharma — Video Editor for Brands &amp; Creators"\/>/);
  assert.match(html, /<meta name="twitter:description" content="Video editor and creator working with brands and creators worldwide across YouTube, short-form, podcasts and motion graphics\. Based in New Delhi, India\."\/>/);
  assert.match(html, /<meta name="twitter:image" content="https:\/\/sarthakeai\.com\/og-white\.png"\/>/);
  assert.match(html, /<link rel="icon" href="\/favicon\.ico" type="image\/x-icon" sizes="any"\/>/);
  assert.match(html, /<link rel="icon" href="\/favicon-16x16\.png" type="image\/png" sizes="16x16"\/>/);
  assert.match(html, /<link rel="icon" href="\/favicon-32x32\.png" type="image\/png" sizes="32x32"\/>/);
  assert.match(html, /<link rel="icon" href="\/favicon-48x48\.png" type="image\/png" sizes="48x48"\/>/);
  assert.match(html, /<link rel="shortcut icon" href="\/favicon\.ico"\/>/);
  assert.match(html, /<link rel="manifest" href="\/site\.webmanifest"\/>/);
  assert.equal((html.match(/"@type":"WebSite"/g) ?? []).length, 1);
  assert.equal((html.match(/"@type":"Person"/g) ?? []).length, 1);
  assert.match(html, /"name":"Sarthak Sharma"/);
  assert.match(html, /"url":"https:\/\/sarthakeai\.com\/"/);
  assert.match(html, /"alternateName":\["Sarthak EAI","sarthakeai\.com"\]/);
  assert.match(html, /"image":"https:\/\/sarthakeai\.com\/sarthak-about-1600\.webp"/);
  assert.match(html, /https:\/\/www\.upwork\.com\/freelancers\/~01a047caaf8c8ed5b6/);
  assert.doesNotMatch(html, /"@type":"(?:Review|AggregateRating)"/);
  assert.match(html, /Sarthak Sharma, video editor and creator/);
  assert.match(html, /Video editor and creator based in New Delhi, India, working with brands and creators worldwide\./);
  assert.doesNotMatch(html, />Sarthak Sharma</);
  assert.match(html, /class="brand-signature brand-logo-only"/);
  assert.match(html, /Hi, I.m Sarthak/);
  assert.match(html, /class="hero-portrait hero-reveal"/);
  assert.doesNotMatch(html, /Available for work/);
  assert.doesNotMatch(html, /role="slider"|timeline-section-markers|timeline-playhead-hit/);
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
  assert.match(html, /id="work"[\s\S]+id="about"[\s\S]+Client testimonials/i);
  assert.match(html, /id="about"/);
  assert.match(html, /id="services"/);
  assert.match(html, /id="youtube"/);
  assert.match(html, /id="contact"/);
  assert.doesNotMatch(html, />Swan Bitcoin short-form</);
  assert.doesNotMatch(html, />Roxom social edits</);
  assert.match(html, /Xiaomi 13 Pro review/);
  assert.match(html, /21st Capital introduction/);
  assert.match(html, /Selected brand animations/);
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
  assert.match(html, /\/work\/swan\/swan-short-04-economic-armor\.jpg/);
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
  assert.equal((html.match(/class="youtube-video-card/g) ?? []).length, 3);
  assert.match(html, />24K\+<\/strong>/);
  assert.doesNotMatch(html, /24\.5K\+/);
  assert.doesNotMatch(html, /1\.7K VIEWS|10K VIEWS|899 VIEWS|YEARS AGO/i);
  assert.match(html, /aria-label="Previous YouTube video"/);
  assert.match(html, /aria-label="Next YouTube video"/);
  assert.doesNotMatch(html, /youtube-player-meta|youtube-player-actions|youtube-watch-link|youtube-play/);
  assert.doesNotMatch(html, /youtube-nocookie\.com\/embed\/LBFTXoNNu_Q/);
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
  const [page, aboutContent, aboutStory, pageFrame, siteFooter, layout, header, booking, availabilityRoute, contactForm, contactSubmit, portfolio, shortFormViewer, shortFormRoute, workPage, workShortFormCard, caseStudyMedia, nativePortfolioVideo, mediaPlayback, data, youtubeShowcase, youtubeData, youtubeRoute, theme, timeline, css, worker, viteConfig, swanLogo, favicon, nextConfig, motionRoute, caseStudyData, projectCaseStudy, documentScrollLock] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/about-content.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/AboutStoryExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/PageFrame.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/SiteFooter.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/SiteHeader.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/BookingExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/calendly-availability/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/ContactForm.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/contact-form-submit.mjs", import.meta.url), "utf8"),
    readFile(new URL("../app/PortfolioGrid.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/ShortFormProjectViewer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/work/short-form-video/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/work/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/WorkShortFormCard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/CaseStudyMedia.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/NativePortfolioVideo.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/media-playback.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/portfolio-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/YouTubeShowcase.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/youtube-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/youtube-latest/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/ThemeToggle.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/HeroTimeline.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../worker/index.ts", import.meta.url), "utf8"),
    readFile(new URL("../vite.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/collaborators/swan-bitcoin.svg", import.meta.url), "utf8"),
    readFile(new URL("../public/favicon.svg", import.meta.url), "utf8"),
    readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/work/motion-brand-animation/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/case-study-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/ProjectCaseStudy.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/document-scroll-lock.ts", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(page, /^"use client"/);
  assert.doesNotMatch(layout, /next\/headers|generateMetadata/);
  assert.match(layout, /metadataBase/);
  assert.match(layout, /const title = "Sarthak Sharma — Video Editor for Brands & Creators"/);
  assert.match(layout, /siteName: "Sarthak Sharma"/);
  assert.match(layout, /icon:\s*\[[\s\S]*?\/favicon\.ico[\s\S]*?favicon-16x16\.png[\s\S]*?favicon-32x32\.png[\s\S]*?favicon-48x48\.png/);
  assert.match(layout, /shortcut: "\/favicon\.ico"/);
  assert.match(layout, /manifest: "\/site\.webmanifest"/);
  assert.match(layout, /apple-touch-icon\.png/);
  assert.match(favicon, /viewBox="0 0 512 512"/);
  assert.match(favicon, /<rect width="512" height="512" rx="71\.68" fill="#ffffff"/);
  assert.match(favicon, /<g fill="#000000"/);
  assert.match(favicon, /fill="#ff0000"/);
  assert.doesNotMatch(favicon, /prefers-color-scheme|<style>/);
  assert.match(layout, /history\.scrollRestoration = 'manual'/);
  assert.match(layout, /history\.replaceState/);
  assert.match(layout, /window\.scrollTo\(0, 0\)/);
  assert.match(layout, /const isReload = navigation\?\.type === 'reload'/);
  assert.match(layout, /if \(isReload && location\.hash\) history\.replaceState/);
  assert.match(layout, /const hashTarget = isReload \? undefined : hashTargets\[location\.hash\]/);
  assert.match(layout, /'#what-i-do': '#services'/);
  assert.match(layout, /addEventListener\('pageshow'/);
  assert.doesNotMatch(layout, /event\.persisted \|\| location\.hash \|\| navigation\?\.type === 'back_forward'/);
  assert.match(layout, /requestAnimationFrame\(\(\) => requestAnimationFrame\(resetToTop\)\)/);
  assert.match(layout, /addEventListener\('DOMContentLoaded', startTracking/);
  assert.match(layout, /addEventListener\('load', alignToHash/);
  assert.match(layout, /new ResizeObserver\(alignToHash\)/);
  assert.match(layout, /addEventListener\('hashchange', stopTracking/);
  assert.match(page, /className="hero-portrait hero-reveal"/);
  assert.match(page, /className="hero-left-anchor"/);
  assert.match(page, /<HeroTimeline \/>/);
  assert.match(timeline, /className="hero-timeline hero-reveal" aria-hidden="true"/);
  assert.match(timeline, /const rulerSubdivisions = 36/);
  assert.match(timeline, /const subdivisionsPerMajor = 6/);
  assert.match(timeline, /<svg[^>]+className="timeline-ruler"[^>]+preserveAspectRatio="none"/);
  assert.match(timeline, /const x = index \+ \.5/);
  assert.match(timeline, /setPointerCapture/);
  assert.match(timeline, /requestAnimationFrame/);
  assert.match(timeline, /playhead\.animate/);
  assert.match(timeline, /useLayoutEffect/);
  assert.match(timeline, /bounds = readBounds\(\);\s*setPosition\(0\);\s*startIntro\(0\);/);
  assert.match(timeline, /playhead\.classList\.add\("is-initialized"\)/);
  assert.match(timeline, /const boundsChanged = Math\.abs\(nextBounds\.left - bounds\.left\) > \.5 \|\| Math\.abs\(nextBounds\.right - bounds\.right\) > \.5;\s*if \(!boundsChanged\) return;/);
  assert.doesNotMatch(timeline, /introFrame/);
  assert.match(timeline, /const positionAtClipSeam = \(\) =>/);
  assert.match(timeline, /const clipARight = Number\.parseFloat\(clipAStyle\.left\) \+ Number\.parseFloat\(clipAStyle\.width\)/);
  assert.match(timeline, /const clipBLeft = Number\.parseFloat\(clipBStyle\.left\)/);
  assert.match(timeline, /const seamX = \(clipARight \+ clipBLeft\) \/ 2/);
  assert.match(timeline, /const visibleTimeline = timeline\.closest<HTMLElement>\("\.hero"\) \?\? timeline/);
  assert.match(timeline, /const visibleLeft = Math\.max\(rulerRect\.left, visibleTimelineRect\.left, 0\)/);
  assert.match(timeline, /const visibleRight = Math\.min\(rulerRect\.right, visibleTimelineRect\.right, document\.documentElement\.clientWidth\)/);
  assert.match(timeline, /visibleLeft - timelineRect\.left \+ halfTriangle/);
  assert.match(timeline, /visibleRight - timelineRect\.left - halfTriangle/);
  assert.match(timeline, /window\.addEventListener\("pointermove"/);
  assert.doesNotMatch(timeline, /localStorage|sessionStorage|document\.cookie/);
  assert.doesNotMatch(timeline, /role="slider"|TIMELINE_NAVIGATE_EVENT|scrollIntoView|IntersectionObserver|window\.scrollTo|snap/i);
  assert.doesNotMatch(page, /timeline-scroll-region|timeline-sticky-track/);
  assert.match(css, /\.hero-timeline\s*\{[^}]+position:\s*absolute[^}]+height:\s*clamp\(12rem, 22vw, 18rem\)[^}]+pointer-events:\s*auto/s);
  assert.match(css, /\.timeline-ruler\s*\{[^}]+width:\s*100%[^}]+height:\s*1\.55rem/s);
  assert.match(css, /\.timeline-tick\s*\{[^}]+stroke-width:\s*1[^}]+vector-effect:\s*non-scaling-stroke[^}]+shape-rendering:\s*crispEdges/s);
  assert.match(css, /\.timeline-tick\.minor\s*\{[^}]+var\(--ink\) 22%/s);
  assert.match(css, /\.timeline-tick\.medium\s*\{[^}]+var\(--ink\) 34%/s);
  assert.match(css, /\.timeline-tick\.major\s*\{[^}]+var\(--ink\) 52%/s);
  assert.match(css, /\.timeline-clip-a\s*\{[^}]+left:\s*0[^}]+width:\s*50%/s);
  assert.match(css, /\.timeline-clip-b\s*\{[^}]+left:\s*50%[^}]+width:\s*50%/s);
  assert.match(css, /\.hero-timeline\s*\{[^}]+--timeline-ruler-top:\s*2\.75rem[^}]+--playhead-width:\s*1\.75rem[^}]+--playhead-height:\s*8\.85rem[^}]+--playhead-triangle-width:\s*1rem[^}]+--playhead-triangle-height:\s*\.85rem[^}]+--playhead-line-start:\s*1\.5rem[^}]+--playhead-red-line-height:\s*2\.9rem/s);
  assert.match(css, /\.timeline-ruler\s*\{[^}]+inset:\s*var\(--timeline-ruler-top\) 0 auto/s);
  assert.match(css, /\.timeline-playhead\s*\{[^}]+top:\s*calc\(var\(--timeline-ruler-top\) - var\(--playhead-line-start\)\)[^}]+left:\s*0[^}]+width:\s*var\(--playhead-width\)[^}]+height:\s*var\(--playhead-height\)[^}]+opacity:\s*0[^}]+pointer-events:\s*none[^}]+touch-action:\s*pan-y[^}]+transform:\s*translate3d\(var\(--playhead-x\), 0, 0\)/s);
  assert.match(css, /\.timeline-playhead\.is-initialized\s*\{[^}]+opacity:\s*1[^}]+pointer-events:\s*auto/s);
  assert.doesNotMatch(css, /--playhead-default-position/);
  assert.match(css, /\.timeline-playhead::before\s*\{[^}]+width:\s*var\(--playhead-triangle-width\)[^}]+height:\s*var\(--playhead-triangle-height\)/s);
  assert.doesNotMatch(css, /@media \(max-width: 50rem\)[\s\S]+\.timeline-playhead\s*\{[^}]+(?:width|height):/s);
  assert.match(css, /@media \(max-width: 50rem\)[\s\S]+\.site-header\s*\{[^}]+position:\s*relative[^}]+height:\s*calc\(4\.5rem \+ env\(safe-area-inset-top\)\)/s);
  assert.match(css, /\.site-header\.is-timeline-aware\s*\{[^}]+position:\s*fixed/s);
  assert.match(css, /\.site-header\.is-timeline-aware\.is-past-timeline:not\(\.menu-open\)\s*\{[^}]+transform:\s*translate3d\(0, calc\(-100% - 1px\), 0\)/s);
  assert.match(css, /@media \(max-width: 50rem\)[\s\S]+\.hero\s*\{[^}]+--hero-timeline-top:\s*5\.25rem/s);
  assert.match(css, /@media \(max-width: 50rem\)[\s\S]+\.timeline-clip-a\s*\{[^}]+width:\s*64%[^}]*\}[\s\S]+\.timeline-clip-b\s*\{[^}]+left:\s*64%[^}]+width:\s*36%/s);
  assert.match(header, /const timeline = pathname === "\/" \? document\.querySelector<HTMLElement>\("\.hero-timeline"\) : null/);
  assert.match(header, /timelineBoundary = window\.scrollY \+ timelineRect\.bottom - headerHeight/);
  assert.match(header, /new ResizeObserver\(onViewportChange\)/);
  assert.match(header, /window\.addEventListener\("scroll", onScroll, \{ passive: true \}\)/);
  assert.doesNotMatch(css, /timeline-sticky|is-stuck|timeline-marker|timeline-mobile|timeline-playhead-hit|timeline-navigation-active|timeline-scroll-offset|timeline-header-offset/);
  assert.doesNotMatch(page, /className="portrait"/);
  assert.match(header, /^"use client"/);
  assert.match(header, /brand-logo-only/);
  assert.match(css, /\.brand-logo-only\s*\{[^}]+height:\s*1\.35rem/);
  assert.match(css, /@media \(max-width: 50rem\)[\s\S]+\.brand-logo-only\s*\{\s*height:\s*1\.35rem/);
  assert.match(header, /site-header-inner/);
  assert.doesNotMatch(header, /TIMELINE_NAVIGATE_EVENT|CustomEvent\(.*timeline/);
  assert.doesNotMatch(header, /brand-name/);
  assert.match(header, /nav-desktop/);
  assert.match(header, /mobile-nav-label">Menu/);
  assert.match(header, /mobile-nav-index/);
  assert.match(header, /mobile-nav-cta/);
  assert.match(header, /navigateFromMenu/);
  assert.match(header, /scrollIntoView\(\{ behavior: reducedMotion \? "auto" : "smooth"/);
  assert.match(header, /\{ href: "\/work", label: "Work" \}/);
  assert.match(header, /\{ href: "\/#about", label: "About" \}/);
  assert.match(header, /const hash = href\.startsWith\("\/#"\) \? href\.slice\(1\) : null/);
  assert.match(header, /const homepageSectionTargets = new Map\(\[/);
  assert.match(header, /const target = homepageSectionTargets\.get\(window\.location\.hash\)/);
  assert.match(header, /if \(href\.startsWith\("\/#"\)\)/);
  assert.match(header, /setPendingMobileNavigation\(\{ hash, reducedMotion \}\)/);
  assert.match(header, /window\.location\.assign\(href\)/);
  assert.match(header, /const navigateFromHeader = \(event: MouseEvent<HTMLAnchorElement>, href: string\)/);
  assert.match(header, /if \(!hash \|\| pathname !== "\/"\) return/);
  assert.match(header, /\{links\.map\(\(link\) => <a key=\{link\.href\} href=\{link\.href\} onClick=\{\(event\) => navigateFromHeader\(event, link\.href\)\}>/);
  assert.match(header, /const scrollWhenReady = \(\) => \{/);
  assert.match(header, /if \(attempts < 60\) \{\s*navigationFrameRef\.current = window\.requestAnimationFrame\(scrollWhenReady\)/);
  assert.match(header, /destination\.scrollIntoView\(\{ behavior: pendingMobileNavigation\.reducedMotion \? "auto" : "smooth", block: "start" \}\)/);
  assert.match(header, /window\.history\.pushState/);
  assert.match(header, /selectedHref === link\.href \? " is-selected"/);
  assert.doesNotMatch(header, /from "\.\/portfolio-data"/);
  assert.match(header, /useBookingAvailability\(\)/);
  assert.match(booking, /availability\.slots === 1 \? "slot" : "slots"/);
  assert.match(booking, /Checking availability/);
  assert.match(booking, /View availability/);
  assert.match(booking, /Today’s slots filled/);
  assert.match(booking, /left today/);
  assert.match(header, /className="mobile-availability"[\s\S]*?<span>\{availabilityLabel\}<\/span>/);
  assert.match(header, /InstagramLogo/);
  assert.match(header, /XLogo/);
  assert.match(header, /YoutubeLogo/);
  assert.match(header, /Briefcase/);
  assert.match(css, /\.mobile-nav-utility\s*\{[^}]+--mobile-utility-gap:[^}]+gap:\s*var\(--mobile-utility-gap\)/s);
  assert.match(css, /\.mobile-nav-socials svg\s*\{[^}]+width:\s*1\.5rem[^}]+height:\s*1\.5rem/s);
  assert.match(booking, /Intl\.DateTimeFormat\(\)\.resolvedOptions\(\)\.timeZone/);
  assert.match(booking, /timeZone: getVisitorTimeZone\(\)/);
  assert.match(booking, /\/api\/calendly-availability/);
  assert.doesNotMatch(header, /\/api\/calendly-availability|CALENDLY_BOOKING_COMPLETE_EVENT/);
  assert.equal(([header, booking].join("\n").match(/\/api\/calendly-availability/g) ?? []).length, 1);
  assert.match(header, /Asia\/Kolkata/);
  assert.match(header, /window\.setInterval\(updateClock, 1000\)/);
  assert.match(header, /window\.clearInterval\(interval\)/);
  assert.match(header, /header-location/);
  assert.match(header, /mobile-local-time/);
  assert.match(header, /availability-cta/);
  assert.match(header, /mobile-availability/);
  assert.match(header, /New Delhi · <time ref=\{desktopTimeRef\}>--:--:--<\/time>/);
  assert.match(header, /desktopTimeRef\.current\.textContent = time/);
  assert.match(header, /\["#what-i-do", "#services"\]/);
  assert.match(header, /window\.scrollTo\(\{ top: 0, behavior:/);
  assert.doesNotMatch(header, /from "next\/link"/);
  assert.match(header, /<a className="brand" href="\/" aria-label="Sarthak, home" onClick=\{navigateHome\}>/);
  assert.match(header, /<span>\{availabilityLabel\}<\/span>/);
  assert.match(header, /BookingTrigger/);
  assert.match(header, /instagram\.com\/sarthak\.eai/);
  assert.match(header, /x\.com\/sarthakeai/);
  assert.match(header, /youtube\.com\/@sarthakeai/);
  assert.match(header, /upwork\.com\/freelancers\/~01a047caaf8c8ed5b6/);
  assert.doesNotMatch(header, /mobile-nav-utility-head|<span>Elsewhere<\/span>|Local time <time>/);
  assert.doesNotMatch(page, /from "next\/image"/);
  assert.doesNotMatch(header, /from "next\/image"/);
  assert.doesNotMatch(portfolio, /from "next\/image"/);
  assert.match(page, /fetchPriority="high"/);
  assert.match(css, /\.hero-portrait\s*\{[^}]+aspect-ratio:\s*1[^}]+overflow:\s*hidden[^}]+border-radius:\s*14px/s);
  assert.match(css, /\.hero-left-anchor\s*\{[^}]+width:\s*100%[^}]+grid-template-columns:\s*minmax\(0, 1fr\)/s);
  assert.match(css, /\.hero-left-anchor > :is\(\.hero-portrait, h1, \.hero-intro\)\s*\{[^}]+grid-column:\s*1[^}]+margin-inline-start:\s*0/s);
  assert.match(css, /@media \(max-width: 28rem\)[\s\S]+\.hero \.hero-left-anchor > p\.hero-intro\s*\{[^}]+width:\s*min\(calc\(100% \+ \.5rem\), 39rem\)[^}]+font-size:\s*\.9375rem[^}]+line-height:\s*1\.64[^}]+text-align:\s*left[^}]+text-wrap-style:\s*auto/s);
  assert.match(css, /@media \(max-width: 28rem\)[\s\S]+\.standalone-page\.work-index-page\s*\{[^}]+padding-top:\s*clamp\(5\.75rem, 24vw, 6\.5rem\)/s);
  assert.match(page, /<p className="hero-intro hero-reveal hero-delay-2">I’m a video editor and creator based in India\. I edit YouTube videos, shorts, podcasts and social content for brands and creators around the world\.<\/p>/);
  assert.match(css, /@media \(max-width: 50rem\)[\s\S]+\.hero-portrait\s*\{[^}]+border-radius:\s*12px/s);
  assert.match(css, /\.hero-portrait img\s*\{[^}]+object-fit:\s*cover/s);
  assert.match(css, /\.hero\s*\{[^}]+--hero-timeline-to-profile:[^}]+--hero-profile-to-title:[^}]+--hero-title-to-copy:[^}]+--hero-copy-to-actions:[^}]+--hero-bottom-gap:/s);
  assert.match(css, /\.hero\s*\{[^}]+min-height:\s*0[^}]+padding-top:\s*calc\(var\(--hero-timeline-top\) \+ var\(--hero-timeline-graphic-depth\) \+ var\(--hero-timeline-to-profile\)\)/s);
  assert.match(css, /\.hero h1\s*\{[^}]+font-size:\s*clamp\(2\.1rem, calc\(1rem \+ 5vw\), 5\.35rem\)/s);
  assert.match(css, /\.hero-actions\s*\{[^}]+gap:\s*var\(--hero-actions-gap\)[^}]+margin-top:\s*var\(--hero-copy-to-actions\)/s);
  assert.match(css, /\.hero-actions \.button\s*\{[^}]+min-height:\s*clamp\(3rem,[^}]+font-size:\s*clamp\(\.875rem/s);
  assert.doesNotMatch(css, /\.hero\s*\{[^}]+min-height:\s*min\(46rem, 100svh\)/s);
  assert.match(page, /loading="lazy"/);
  assert.match(layout, /rel="preload" href="\/eai-logo-dark\.svg"/);
  assert.match(layout, /rel="preload" href="\/eai-logo-light\.svg"/);
  assert.match(css, /eai-logo-dark\.svg/);
  assert.match(css, /eai-logo-light\.svg/);
  assert.doesNotMatch(css, /\.about[^}]+content-visibility:\s*auto/s);
  assert.match(css, /\.mobile-nav-text[^}]+var\(--font-geist-sans\)/s);
  assert.match(css, /font-size:\s*clamp\(1\.8rem, 7\.7vw, 2\.125rem\)/);
  assert.match(css, /transform:\s*translateY\(\.625rem\)/);
  assert.match(header, /className="mobile-nav-content"/);
  assert.match(css, /\.mobile-nav\s*\{[^}]+background-color:\s*transparent[^}]+visibility:\s*hidden[^}]+transition:\s*background-color var\(--motion-medium\) var\(--ease-premium\), visibility 0s linear var\(--motion-medium\)/s);
  assert.match(css, /\.menu-open \.mobile-nav\s*\{[^}]+background-color:\s*var\(--bg\)[^}]+transition-delay:\s*0s/s);
  assert.doesNotMatch(css, /\.mobile-nav\s*\{[^}]+opacity:/s);
  assert.match(css, /\.menu-open \.mobile-nav\s*\{[^}]+visibility:\s*visible[^}]+transition-delay:\s*0s/s);
  assert.match(css, /\.mobile-nav-content\s*\{[^}]+opacity:\s*0[^}]+transform:\s*translateY\(\.25rem\)[^}]+transition:\s*opacity var\(--motion-medium\) var\(--ease-premium\), transform var\(--motion-medium\) var\(--ease-premium\)/s);
  assert.match(css, /\.menu-open \.mobile-nav-content\s*\{[^}]+opacity:\s*1[^}]+transform:\s*none/s);
  assert.match(css, /\.mobile-nav-item\s*\{[^}]+opacity:\s*1[^}]+transition:\s*transform var\(--motion-fast\) var\(--ease-premium\)/s);
  assert.doesNotMatch(css, /\.mobile-nav-item\s*\{[^}]+transition:\s*opacity/s);
  assert.match(css, /\.menu-open \.mobile-nav-item\s*\{[^}]+transition:\s*transform var\(--motion-medium\) var\(--ease-premium\) var\(--row-open-delay\)/s);
  assert.match(css, /--row-open-delay:\s*245ms/);
  assert.match(css, /\.mobile-nav-item\.is-selected/);
  assert.match(css, /scroll-margin-top:\s*5\.25rem/);
  assert.match(css, /min-height:\s*100dvh/);
  assert.match(css, /\.mobile-nav-utility\s*\{[^}]+align-items:\s*center[^}]+text-align:\s*center/s);
  assert.match(css, /\.mobile-availability\s*\{[^}]+min-height:\s*2\.875rem[^}]+border:\s*1px solid var\(--line\)[^}]+border-radius:\s*99rem/s);
  assert.match(css, /\.mobile-nav-socials\s*\{[^}]+justify-content:\s*center/s);
  assert.match(css, /env\(safe-area-inset-top\)/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(css, /@media \(max-width: 50rem\)[\s\S]+\.about-story-trigger\s*\{[^}]+display:\s*flex[^}]+margin-inline-start:\s*0[^}]+margin-inline-end:\s*auto/s);
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
  assert.match(portfolio, /<h3 className="portfolio-category-heading" id="short-form-heading">/);
  assert.match(portfolio, /<h3 className="portfolio-category-heading" id=\{`\$\{project\.id\}-heading`\}>/);
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
  assert.doesNotMatch(portfolio, /shortMedia\.slice\(shortInitialCount/);
  assert.match(portfolio, /const mobileShortMedia = shortMedia/);
  assert.match(portfolio, /const shortMedia = selectedShortFormMedia/);
  assert.doesNotMatch(portfolio, /isTwoColumnShortLayout|syncShortLayout/);
  assert.match(portfolio, /className="short-form-mobile-content"[\s\S]*?<EditorialProjectCard/);
  assert.match(portfolio, /className="short-form-desktop-content"[\s\S]*?shortMedia\.slice\(0, shortInitialCount\)/);
  assert.match(portfolio, /previewCount=\{3\}/);
  assert.doesNotMatch(portfolio, /eyebrowText/);
  assert.match(portfolio, /description: shortFormProjectCopy\.description/);
  assert.match(portfolio, /roles: \["Editing", "Captions", "Motion Graphics", "Sound Design"\]/);
  assert.match(portfolio, /<ShortFormProjectViewer open={shortFormViewerOpen}/);
  assert.doesNotMatch(portfolio, /video-modal-short-grid/);
  assert.match(shortFormViewer, /caseStudies\.find\(\(study\) => study\.slug === "short-form-video"\)/);
  assert.match(shortFormViewer, /<CaseStudyMedia media=\{shortFormStudy\.media\}/);
  assert.match(shortFormViewer, /stopMediaWithin\(dialog\)/);
  assert.match(shortFormViewer, /dialog\.scrollTop = 0/);
  assert.match(shortFormViewer, /<p className="project-eyebrow">Swan &amp; Roxom<\/p>/);
  assert.match(shortFormViewer, /<h2>Vertical edits<\/h2>/);
  assert.match(shortFormRoute, /<ShortFormRouteViewer \/>/);
  assert.match(workPage, /<WorkShortFormCard key=\{study\.slug\} study=\{study\}/);
  assert.match(workShortFormCard, /<ShortFormProjectViewer open=\{viewerOpen\}/);
  assert.match(workShortFormCard, /triggerRef\.current = event\.currentTarget/);
  assert.match(portfolio, /className=\{`short-card/);
  assert.match(portfolio, /data-reveal/);
  assert.match(portfolio, /className="short-card-control"/);
  assert.match(portfolio, /aria-pressed=\{isPlaying\}/);
  assert.doesNotMatch(portfolio, /Click for sound/);
  assert.doesNotMatch(portfolio, /onPointerEnter=\{startPreview\}/);
  assert.doesNotMatch(portfolio, /onPointerLeave=\{stopPreview\}/);
  assert.match(portfolio, /const openShortFormProject = \(trigger: HTMLElement\) =>/);
  assert.match(portfolio, /onOpen=\{openShortFormProject\}/);
  assert.match(portfolio, /className="button button-secondary shorts-see-more"[^\n]+aria-haspopup="dialog"[^\n]+openShortFormProject\(event\.currentTarget\)/);
  assert.doesNotMatch(portfolio, /See less|shortExpansionPhase|shortExtrasHeight|shortExtrasRef|shortExpansionFrameRef|toggleShorts|onShortExtrasTransitionEnd/);
  assert.match(portfolio, /stopAllMedia\(\);/);
  assert.match(portfolio, /media: mobileShortMedia/);
  assert.match(portfolio, /<NativePortfolioVideo/);
  assert.match(caseStudyMedia, /<NativePortfolioVideo/);
  assert.match(caseStudyMedia, /className=\{showCenterPlay \? "case-study-short-video"/);
  assert.match(nativePortfolioVideo, /controls=\{false\}/);
  assert.doesNotMatch(nativePortfolioVideo, /video\.controls = (?:false|true)/);
  assert.match(nativePortfolioVideo, /video\.pause\(\)/);
  assert.match(nativePortfolioVideo, /activateMedia\(id, video\)/);
  assert.match(nativePortfolioVideo, /detail\.activeVideo === videoRef\.current/);
  assert.match(nativePortfolioVideo, /preload=\{hasActivated \? "auto" : "metadata"\}/);
  assert.match(nativePortfolioVideo, /poster=\{hasPlayed \? undefined : poster\}/);
  assert.match(nativePortfolioVideo, /onTimeUpdate=\{\(event\) => setCurrentTime/);
  assert.doesNotMatch(nativePortfolioVideo, /showNativeControls|setShowNativeControls/);
  assert.match(nativePortfolioVideo, /activationRequestedRef\.current = false/);
  assert.match(nativePortfolioVideo, /video\.currentTime = value/);
  assert.match(nativePortfolioVideo, /className="portfolio-native-progress"/);
  assert.match(nativePortfolioVideo, /requestFullscreen/);
  assert.doesNotMatch(nativePortfolioVideo, /\.load\(\)/);
  assert.match(nativePortfolioVideo, /portfolio-native-video-idle\$\{hasPlayed \? " is-resume" : ""\}/);
  assert.match(nativePortfolioVideo, /!hasPlayed \? <img src=\{poster\}/);
  assert.match(nativePortfolioVideo, /portfolio-native-center-control/);
  assert.doesNotMatch(nativePortfolioVideo, /portfolio-native-playback-control/);
  assert.match(nativePortfolioVideo, /SpeakerHigh/);
  assert.match(nativePortfolioVideo, /SpeakerSlash/);
  assert.match(nativePortfolioVideo, /CornersOut/);
  assert.match(nativePortfolioVideo, /1000/);
  assert.match(css, /portfolio-native-video-idle[^}]+opacity 360ms var\(--ease-premium\)/);
  assert.match(css, /is-touch-controls-visible[^}]+transition-duration:\s*260ms/);
  assert.match(css, /\.portfolio-native-progress[^}]+touch-action:\s*none/);
  assert.match(css, /\.portfolio-native-progress::-webkit-slider-thumb[^}]+background:\s*#fff/);
  assert.match(css, /\.portfolio-native-video-shell\.is-active\s*>\s*:is\([^}]+opacity:\s*0[^}]+pointer-events:\s*none/);
  assert.match(css, /\.case-study-short-video:fullscreen,[\s\S]*?object-fit: contain;/);
  assert.match(portfolio, /playsInline/);
  assert.match(portfolio, /poster=\{media\.poster\}/);
  assert.match(portfolio, /<source src=\{media\.videoUrl\} type="video\/mp4"/);
  assert.match(portfolio, /video-modal-poster/);
  assert.match(portfolio, /setStarted\(true\)/);
  assert.match(nativePortfolioVideo, /video\.play\(\)/);
  assert.doesNotMatch(portfolio, /autoPlay/);
  assert.match(portfolio, /youtube-nocookie\.com\/embed/);
  assert.match(portfolio, /Watch on YouTube/);
  assert.match(portfolio, /MEDIA_PLAYBACK_EVENT/);
  assert.match(portfolio, /stopMediaWithin\(dialogRef\.current\)/);
  assert.match(nativePortfolioVideo, /onPlay=\{\(event\) =>/);
  assert.match(mediaPlayback, /video\.pause\(\)/);
  assert.match(mediaPlayback, /activeId/);
  assert.match(mediaPlayback, /iframe\.src = "about:blank"/);
  assert.match(worker, /VIDEO_PATH_PATTERN/);
  assert.match(worker, /Accept-Ranges/);
  assert.match(worker, /Content-Range/);
  assert.match(worker, /status: 206/);
  assert.match(viteConfig, /binding: "ASSETS"/);
  assert.match(viteConfig, /run_worker_first: \["\/work\/\*\*\/\*\.mp4"\]/);
  assert.match(data, /roles: string\[\]/);
  assert.match(data, /export type ProjectMedia/);
  assert.match(data, /title: "Vertical edits for Swan & Roxom"/);
  assert.match(data, /const selectedShortFormOrder = \[\s*"swan-01",\s*"swan-02",\s*"swan-04",\s*"roxom-04",\s*"swan-03",\s*"swan-05",\s*"roxom-01",\s*"swan-06",\s*"swan-07",\s*"roxom-02",\s*"swan-08",\s*"swan-09",\s*"roxom-03",\s*"swan-10",\s*\] as const;/s);
  assert.match(data, /export const selectedShortFormMedia: ProjectMedia\[\] = selectedShortFormOrder\.map/);
  assert.match(portfolio, /const shortMedia = selectedShortFormMedia;/);
  assert.match(shortFormViewer, /caseStudies\.find/);
  assert.match(data, /title: "Roxom social edits"/);
  assert.match(data, /title: "Xiaomi 13 Pro review"/);
  assert.match(data, /title: "21st Capital introduction"/);
  assert.match(data, /title: "Selected brand animations"/);
  assert.match(data, /title: "21st Capital interview"/);
  assert.match(data, /contentType: "Short-form social edits"/);
  assert.doesNotMatch(data, /deliverables:|Deliverables|10 vertical social edits|4 vertical social edits|1 long-form YouTube review|1 brand introduction|3 brand animations|1 interview episode|Ten vertical edits|Four vertical clips|Three short brand animations/);
  assert.equal((data.match(/category: "Short-form video"/g) ?? []).length, 2);
  assert.match(data, /"YouTube long-form"/);
  assert.match(data, /"Brand introductions"/);
  assert.match(data, /"Motion & brand animation"/);
  assert.match(data, /"Podcasts & interviews"/);
  assert.match(data, /\{ value: "5", label: "years of experience" \}/);
  assert.doesNotMatch(data, /\{ value: "24K\+", label: "YouTube subscribers" \}/);
  assert.match(aboutContent, /Creating and publishing my own work has shaped how I approach an edit - I think about the idea, the audience and whether the video still works once it leaves the timeline\./);
  assert.match(aboutContent, /I started creating videos out of curiosity and ended up finding the part I loved most - the edit itself\./);
  assert.match(page, /homepageAboutIntro/);
  assert.match(page, /<AboutStoryExperience \/>/);
  assert.doesNotMatch(page, /\(About me\)/i);
  assert.match(aboutStory, /className="about-story-trigger"/);
  assert.doesNotMatch(aboutStory, /button-primary about-story-trigger|cta-outline about-story-trigger/);
  assert.match(aboutStory, /Read my story <span aria-hidden="true">↗<\/span>/);
  assert.match(aboutStory, /role="dialog"/);
  assert.match(aboutStory, /aria-modal=\{(?:mobilePhase|phase) === "open" \? "true" : undefined\}/);
  assert.match(aboutStory, /aria-expanded=\{desktopOpen \|\| mobileOpen\}/);
  assert.match(aboutStory, /aria-controls=\{mobileViewport \? "about-story-mobile" : "about-story-dialog"\}/);
  assert.match(aboutStory, /className="about-story-mobile editorial-panel"/);
  assert.match(aboutStory, /className="about-story-mobile-overlay editorial-overlay"/);
  assert.match(aboutStory, /data-state=\{mobilePhase\}/);
  assert.match(aboutStory, /event\.propertyName === "opacity" && mobilePhase === "closing"\) finishMobileClose/);
  assert.match(aboutStory, /mobileStoryRef\.current\?\.scrollTo/);
  assert.match(aboutStory, /mobileCloseButtonRef\.current\?\.focus\(\{ preventScroll: true \}\)/);
  assert.match(aboutStory, /returnFocus\?\.focus\(\{ preventScroll: true \}\)/);
  assert.match(aboutStory, /window\.matchMedia\("\(max-width: 47\.9375rem\)"\)/);
  assert.match(aboutContent, /Sarthak Sharma/);
  assert.match(aboutContent, /born 3 September 2001/);
  assert.match(aboutStory, /className="about-story-intro"/);
  assert.match(aboutStory, /<strong>\{aboutStoryBio\.name\}<\/strong>\{aboutStoryBio\.details\}/);
  assert.match(aboutStory, /event\.key === "Escape"/);
  assert.match(aboutStory, /returnFocus\?\.focus/);
  assert.match(css, /\.about-story-dialog\s*\{[^}]+width:\s*min\(96vw, 112\.5rem\)[^}]+overflow-y:\s*auto[^}]+border-radius:\s*0/s);
  assert.match(css, /@media \(max-width:\s*47\.9375rem\)[\s\S]+\.about-story-mobile-overlay\s*\{[^}]+position:\s*fixed[^}]+inset:\s*0[^}]+display:\s*grid[^}]+padding:\s*var\(--mobile-story-inset\)/s);
  assert.match(css, /\.about-story-mobile\s*\{[^}]+height:\s*calc\(100dvh - \(2 \* var\(--mobile-story-inset\)\)\)[^}]+overflow-y:\s*auto[^}]+border-top:\s*3px solid var\(--accent\)/s);
  assert.match(css, /\.editorial-overlay > \.editorial-panel\s*\{[^}]+translate3d\(0, \.75rem, 0\)[^}]+transition-property:\s*opacity, transform[^}]+transition-duration:\s*150ms/s);
  assert.doesNotMatch(css, /@keyframes editorial-(?:backdrop|panel)/);
  assert.match(css, /\.about-story-mobile-head h2\s*\{[^}]+font-size:\s*clamp\(44px, 12\.5vw, 52px\)/s);
  assert.match(css, /\.about-story-mobile-portrait\s*\{[^}]+aspect-ratio:\s*5\s*\/\s*6/s);
  assert.match(css, /\.about-story-mobile-portrait img\s*\{[^}]+height:\s*100%[^}]+object-fit:\s*cover[^}]+object-position:\s*center 52%/s);
  assert.match(css, /\.about-story-mobile-copy\s*\{[^}]+font-size:\s*clamp\(\.8125rem, 3\.45vw, \.875rem\)[^}]+font-style:\s*italic[^}]+line-height:\s*1\.6/s);
  assert.match(css, /\.about-story-mobile-copy p \+ p\s*\{[^}]+margin-top:\s*1rem/s);
  assert.match(css, /\.about-story-trigger\s*\{[^}]+display:\s*inline-flex[^}]+gap:\s*\.7rem[^}]+border-bottom:\s*1px solid var\(--line\)[^}]+background:\s*transparent[^}]+font-size:\s*clamp\(1rem,[^}]+1\.125rem/s);
  assert.match(css, /\.about-story-trigger span\s*\{[^}]+color:\s*var\(--accent\)[^}]+transition:\s*transform 220ms var\(--ease-out\)/s);
  assert.match(css, /\.about-story-trigger:hover span\s*\{[^}]+translate\(\.18rem, -\.12rem\)/s);
  assert.doesNotMatch(css, /about-story-(?:mobile-)?panel-in|editorial-panel-in[^}]+scale\(/s);
  assert.match(css, /\.about-story-body\s*\{[^}]+grid-template-columns:\s*minmax\(16\.875rem, 18rem\) minmax\(0, 1fr\)[^}]+gap:\s*clamp\(2\.625rem, 3\.4vw, 3\.25rem\)/s);
  assert.match(css, /\.about-story-portrait\s*\{[^}]+max-width:\s*18rem[^}]+height:\s*28\.5rem/s);
  assert.match(css, /@media \(max-width: 50rem\)[\s\S]+\.about-story-portrait\s*\{[^}]+aspect-ratio:\s*3\s*\/\s*4/s);
  assert.match(aboutStory, /aboutStoryParagraphs\.slice\(0, 3\)[\s\S]+aboutStoryParagraphs\.slice\(3, 7\)[\s\S]+aboutStoryParagraphs\.slice\(7\)/);
  assert.match(css, /\.about-story-columns\s*\{[^}]+grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/s);
  assert.match(css, /\.about-story-columns p\s*\{[^}]+color:\s*var\(--muted-strong\)[^}]+font-family:\s*var\(--font-geist-sans\), sans-serif[^}]+font-size:\s*clamp\(\.84375rem,[^}]+font-style:\s*italic[^}]+font-weight:\s*400[^}]+line-height:\s*1\.5/s);
  assert.match(css, /\.about-story-columns p \+ p\s*\{[^}]+margin-top:\s*1rem/s);
  assert.match(css, /\.about-story-columns \.about-story-intro\s*\{[^}]+color:\s*var\(--muted-strong\)/s);
  assert.doesNotMatch(css, /\.about-story-columns \.about-story-intro\s*\{[^}]+font(?:-size|-style|-weight)?:/s);
  assert.match(css, /\.about-story-intro strong\s*\{[^}]+font-style:\s*italic[^}]+font-weight:\s*700/s);
  assert.match(nextConfig, /source:\s*"\/about"[\s\S]+destination:\s*"\/#about"[\s\S]+permanent:\s*true/);
  assert.match(motionRoute, /getCaseStudy\("motion-brand-animation"\)/);
  assert.match(caseStudyData, /slug:\s*"motion-brand-animation"/);
  assert.doesNotMatch(workPage, /href="\/#work"/);
  assert.match(siteFooter, /\{ href: "\/work", label: "Work" \}/);
  assert.match(css, /--ease-premium:\s*cubic-bezier\(\.22, 1, \.36, 1\)/);
  assert.match(css, /--motion-fast:\s*200ms/);
  assert.match(css, /--motion-medium:\s*280ms/);
  assert.match(css, /--motion-slow:\s*500ms/);
  assert.match(youtubeShowcase, /I run my own technology channel, creating reviews, hands-on videos and other tech content\./);
  assert.match(youtubeData, /YOUTUBE_CHANNEL_ID = "UCFA48GH6QpjejK8xcIdMz_g"/);
  assert.equal((youtubeData.match(/durationSeconds:/g) ?? []).length, 4);
  assert.doesNotMatch(youtubeShowcase, /fetch\("\/api\/youtube-latest"/);
  assert.match(page, /loadYouTubeShowcaseData/);
  assert.match(page, /<YouTubeShowcase initialData=\{youtubeShowcaseData\}/);
  assert.match(youtubeShowcase, /youtube-nocookie\.com\/embed\/\$\{videoId\}/);
  assert.match(youtubeShowcase, /const \[carouselIndex, setCarouselIndex\] = useState\(0\)/);
  assert.match(youtubeShowcase, /const \[playersMounted, setPlayersMounted\] = useState\(false\)/);
  assert.match(youtubeShowcase, /playersMounted \? \(/);
  assert.match(youtubeShowcase, /className="youtube-native-player"/);
  assert.match(youtubeShowcase, /loading="lazy"/);
  assert.match(youtubeShowcase, /IntersectionObserver/);
  assert.match(youtubeShowcase, /rootMargin: "400px 0px"/);
  assert.match(youtubeShowcase, /rootMargin: "800px 0px"/);
  assert.match(youtubeShowcase, /prewarmYouTubeResources/);
  assert.match(youtubeShowcase, /https:\/\/i\.ytimg\.com/);
  assert.match(youtubeShowcase, /https:\/\/www\.youtube-nocookie\.com/);
  assert.match(youtubeShowcase, /https:\/\/www\.youtube\.com/);
  assert.match(youtubeShowcase, /https:\/\/s\.ytimg\.com/);
  assert.match(youtubeShowcase, /autoplay: "0"/);
  assert.match(youtubeShowcase, /controls: "1"/);
  assert.match(youtubeShowcase, /playsinline: "1"/);
  assert.match(youtubeShowcase, /origin,/);
  assert.doesNotMatch(youtubeShowcase, /ShareIcon|ClockIcon|YouTubeMarkIcon|PlayIcon|getYouTubeUrl|shareVideo/);
  assert.doesNotMatch(youtubeShowcase, /youtube-player-meta|youtube-player-actions|youtube-watch-link|youtube-play|youtube-video-poster|youtube-facade/);
  assert.match(youtubeShowcase, /LBFTXoNNu_Q: 23/);
  assert.match(youtubeShowcase, /"5MWtToYnA00": 59/);
  assert.match(youtubeShowcase, /"2MW4freUkg8": 76/);
  assert.match(youtubeShowcase, /params\.set\("start", String\(startTime\)\)/);
  assert.match(youtubeShowcase, /enablejsapi: "1"/);
  assert.match(youtubeShowcase, /pausePlayersExcept/);
  assert.match(youtubeShowcase, /pausePlayerIfHiddenAfterNavigation/);
  assert.match(youtubeShowcase, /activePlayerIdRef/);
  assert.match(youtubeShowcase, /Math\.floor\(value \/ 1_000\)/);
  assert.doesNotMatch(youtubeShowcase, /formatViewCount|formatRelativeDate|youtube-video-details/);
  assert.doesNotMatch(youtubeShowcase, /youtube-duration/);
  assert.match(youtubeRoute, /loadYouTubeShowcaseData/);
  assert.doesNotMatch(youtubeShowcase, /NEW/);
  assert.match(youtubeRoute, /env\.YOUTUBE_API_KEY/);
  assert.doesNotMatch(youtubeRoute, /NEXT_PUBLIC_YOUTUBE_API_KEY/);
  assert.match(youtubeRoute, /durationSeconds <= LONG_FORM_MIN_SECONDS/);
  assert.match(youtubeRoute, /LONG_FORM_MIN_SECONDS = 180/);
  assert.match(youtubeRoute, /YOUTUBE_CACHE_TTL_MS/);
  assert.match(css, /\.youtube-video-row\s*\{[^}]+display:\s*flex[^}]+translate3d\(var\(--youtube-track-offset, 0\)/s);
  assert.match(css, /\.youtube-video-card\s*\{[^}]+flex:\s*0 0 46\.5%/s);
  assert.match(css, /@media \(max-width: 64rem\)[\s\S]*?\.youtube-video-card\s*\{[^}]+flex-basis:\s*84%/);
  assert.match(css, /@media \(max-width: 50rem\)[\s\S]*?\.youtube-video-card\s*\{[^}]+flex-basis:\s*100%/);
  assert.match(css, /\.youtube-video-row\s*\{[^}]+touch-action:\s*pan-y/);
  assert.doesNotMatch(css, /\.youtube-video-row[^}]+scroll-snap-type/);
  assert.match(css, /\.youtube-video-frame\s*\{[^}]+border-radius:\s*0/);
  assert.match(css, /\.youtube-native-player\s*\{[^}]+position:\s*absolute[^}]+inset:\s*0[^}]+width:\s*100%[^}]+height:\s*100%[^}]+border:\s*0/s);
  assert.doesNotMatch(css, /youtube-video-poster|youtube-facade|youtube-player-meta|youtube-player-actions|youtube-watch-link|\.youtube-play/);
  assert.match(css, /\.youtube-navigation\s*\{\s*display:\s*flex/);
  assert.match(css, /\.youtube-pagination\s*\{[^}]+gap:\s*\.5rem/);
  assert.match(css, /\.youtube-arrows button\s*\{[^}]+width:\s*3rem[^}]+border-radius:\s*50%[^}]+background:\s*var\(--accent\)[^}]+color:\s*#fff/s);
  assert.equal((data.match(/id: "swan-\d{2}"/g) ?? []).length, 10);
  assert.equal((data.match(/id: "roxom-\d{2}"/g) ?? []).length, 4);
  assert.doesNotMatch(portfolio, /project-meta-line/);
  assert.doesNotMatch(workPage, /project-eyebrow/);
  assert.doesNotMatch(workPage, /from "next\/link"/);
  assert.doesNotMatch(workShortFormCard, /project-eyebrow/);
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
  assert.match(theme, /localStorage\.setItem\("theme"/);
  assert.match(theme, /\*,\*::before,\*::after\{transition:none !important\}/);
  assert.match(theme, /void document\.body\.offsetHeight/);
  assert.match(theme, /requestAnimationFrame\(\(\) => \{\s*requestAnimationFrame\(\(\) => style\.remove\(\)\)/s);
  assert.match(booking, /https:\/\/calendly\.com\/officialsarthakeai\/30min/);
  assert.match(booking, /url\.searchParams\.set\("hide_event_type_details", "1"\)/);
  assert.match(booking, /url\.searchParams\.set\("hide_gdpr_banner", "1"\)/);
  assert.match(booking, /url\.searchParams\.set\("embed_domain"/);
  assert.match(booking, /url\.searchParams\.set\("embed_type", "Inline"\)/);
  assert.doesNotMatch(booking, /primary_color|background_color|text_color|darkCalendar/);
  assert.match(booking, /calendly\.event_scheduled/);
  assert.match(booking, /calendly\.date_and_time_selected/);
  assert.match(booking, /setCalendarFlow\("confirmation"\)/);
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
  assert.match(contactForm, /event\.nativeEvent\.isComposing \|\| event\.key !== "Enter" \|\| \(!event\.ctrlKey && !event\.metaKey\)/);
  assert.match(contactForm, /event\.currentTarget\.form\?\.requestSubmit\(\)/);
  assert.match(contactForm, /aria-label="Your Name" placeholder="Your Name"/);
  assert.match(contactForm, /aria-label="Your Email" placeholder="Your Email"/);
  assert.match(contactForm, /aria-label="Your Message" placeholder="Your Message"/);
  assert.doesNotMatch(contactForm, /<span>Name<\/span>|<span>Email<\/span>|<span>Message<\/span>/);
  assert.match(contactForm, /Message sent\. I’ll get back to you soon\./);
  assert.match(contactForm, /Something went wrong\. Please try again or email me directly\./);
  assert.match(contactForm, /mailto:officialsarthakeai@gmail\.com/);
  assert.match(contactForm, /<div className="contact-form-actions">\s*<button className="contact-submit" type="submit" disabled=\{sending\}>[\s\S]*?<p className="contact-form-hint">/);
  assert.match(booking, /role="dialog"/);
  assert.match(booking, /aria-modal=\{phase === "open" \? "true" : undefined\}/);
  assert.equal((booking.match(/<iframe/g) ?? []).length, 1);
  assert.match(booking, /event\.key === "Escape"/);
  assert.match(booking, /body\.style\.overflow = "hidden"/);
  assert.match(booking, /returnFocus\?\.focus/);
  assert.match(booking, /data-state=\{phase\}/);
  assert.match(booking, /aria-hidden=\{phase !== "open"\}/);
  assert.match(booking, /inert=\{phase !== "open" \? true : undefined\}/);
  assert.match(booking, /event\.source !== calendarFrameRef\.current\?\.contentWindow/);
  assert.equal((booking.match(/className="overlay-focus-sentinel"/g) ?? []).length, 2);
  assert.match(css, /\.overlay-focus-sentinel\s*\{[^}]+clip-path:\s*inset\(50%\)/s);
  assert.match(booking, /className="booking-availability"/);
  assert.match(booking, /className="booking-wordmark"/);
  assert.doesNotMatch(booking, /Book a call<\/p>|Let&rsquo;s connect\.<\/h2>/);
  assert.match(booking, /setCalendarSlow/);
  assert.match(booking, /Open Calendly/);
  assert.match(booking, /Booking controls must be used within BookingProvider/);
  assert.match(booking, /requestIdleCallback/);
  assert.match(booking, /onPointerEnter/);
  assert.match(booking, /onPointerDown/);
  assert.match(booking, /context\.prepareCalendar\(\)/);
  assert.match(booking, /calendarPrepared \? \(/);
  assert.match(booking, /calendarNeedsResetRef\.current = true/);
  assert.match(booking, /setCalendarSession\(\(current\) => current \+ 1\)/);
  assert.match(booking, /key=\{calendarSession\}/);
  assert.doesNotMatch(booking, /\.load\(\)/);
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
  assert.match(css, /\.contact-form-actions\s*\{[^}]+display:\s*grid[^}]+gap:\s*\.65rem/);
  assert.match(css, /\.contact-submit\s*\{[^}]+width:\s*100%[^}]+min-height:\s*3\.5rem[^}]+border-radius:\s*\.35rem[^}]+background:\s*var\(--ink\)[^}]+color:\s*var\(--bg\)/);
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
  assert.match(css, /\.project-preview-triptych\s*\{[^}]+gap:\s*4px/s);
  assert.match(css, /\.project-preview-triptych figure\s*\{[^}]+border-radius:\s*clamp\(\.5rem, \.8vw, \.65rem\)[^}]+background:\s*transparent/s);
  assert.match(css, /\.work-index-media \.work-index-short-form-preview\s*\{[^}]+gap:\s*3px[^}]+background:\s*transparent[^}]+transition:\s*transform 520ms var\(--ease-out\), filter 220ms ease-out/s);
  assert.match(css, /\.work-index-media \.work-index-short-form-preview img\s*\{[^}]+object-fit:\s*cover[^}]+transform:\s*none[^}]+filter:\s*none[^}]+transition:\s*none/s);
  assert.match(css, /\.work-index-media:hover > \.work-index-short-form-preview\s*\{[^}]+transform:\s*scale\(1\.025\)[^}]+filter:\s*saturate\(\.92\)/s);
  assert.doesNotMatch(css, /\.work-index-media:hover \.work-index-short-form-preview img/);
  assert.doesNotMatch(css, /\.footer-inner::before/);
  assert.match(css, /\.footer-divider\s*\{[^}]+height:\s*1px[^}]+background:\s*var\(--footer-line\)/s);
  assert.match(css, /\.nonshort-category-grid\s*\{[^}]+repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.match(css, /\.nonshort-category-section\s*\{[^}]+gap:\s*clamp\(2rem, 2\.5vw, 2\.5rem\)/s);
  assert.match(css, /\.editorial-project-card \.project-visual\s*\{[^}]+aspect-ratio:\s*16\s*\/\s*9/s);
  assert.match(css, /\.xiaomi-thumbnail-shell \.poster-fade\s*\{[^}]+opacity:\s*1[^}]+transition:\s*opacity 220ms ease-out/s);
  assert.doesNotMatch(css, /\.xiaomi-thumbnail-shell \.poster-fade\s*\{[^}]+scale:/s);
  assert.match(css, /\.shorts-grid\s*\{[^}]+repeat\(10, minmax\(0, 1fr\)\)/s);
  assert.match(css, /\.button\.shorts-see-more\s*\{[^}]+min-height:\s*2\.75rem[^}]+padding:\s*0 1\.25rem[^}]+border-radius:\s*\.625rem[^}]+font-size:\s*\.875rem[^}]+font-weight:\s*600/s);
  assert.match(css, /\.short-card\s*\{[^}]+aspect-ratio:\s*9\s*\/\s*16/s);
  assert.match(css, /\.short-card\s*\{[^}]+border-radius:\s*clamp\(1rem, 1\.35vw, 1\.25rem\)/s);
  assert.doesNotMatch(css, /shorts-expanded-wrapper|shorts-expanded-grid/);
  assert.match(css, /\.short-card-control/);
  assert.match(css, /\.portfolio-native-video\s*\{[^}]+pointer-events:\s*auto[^}]+touch-action:\s*auto/s);
  assert.match(css, /\.portfolio-native-video-shell\s*>\s*\.portfolio-native-video-idle\s*\{[^}]+position:\s*absolute[^}]+inset:\s*0[^}]+touch-action:\s*pan-y/s);
  assert.match(css, /\.portfolio-native-video-shell\s*>\s*\.portfolio-native-video-idle\.is-resume\s*\{\s*background:\s*transparent/);
  assert.match(css, /\.portfolio-native-video-shell\s*>\s*\.portfolio-native-video-idle\.is-resume button\s*\{\s*background:\s*transparent/);
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
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+--portfolio-mobile-category-title-size:\s*clamp\(1\.875rem, 9vw, 2\.5rem\)/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+--portfolio-mobile-category-gap:\s*3\.875rem/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.short-form-section \+ \.nonshort-category-grid\s*\{\s*margin-top:\s*0/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.nonshort-category-grid\s*\{\s*gap:\s*var\(--portfolio-mobile-category-gap\)/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.portfolio-category-section \.portfolio-category-heading\s*\{[^}]+font-size:\s*var\(--portfolio-mobile-category-title-size\)[^}]+font-weight:\s*620[^}]+line-height:\s*\.98[^}]+letter-spacing:\s*-\.055em[^}]+text-align:\s*start/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.shorts-grid\s*\{[^}]+repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.mobile-short-project-card \.project-visual\s*\{\s*aspect-ratio:\s*27 \/ 16/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.mobile-short-project-card \.project-preview-triptych\s*\{[^}]+repeat\(3, minmax\(0, 1fr\)\)[^}]+gap:\s*3px[^}]+background:\s*var\(--bg\)[^}]+transition:\s*transform 520ms var\(--ease-out\), filter 220ms ease-out/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.mobile-short-project-card \.project-preview-triptych figure\s*\{[^}]+border-radius:\s*0[^}]+background:\s*transparent/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.mobile-short-project-card \.project-preview-triptych img\s*\{[^}]+object-fit:\s*cover[^}]+transition:\s*none/);
  assert.match(css, /@media \(max-width: 42rem\) and \(hover: hover\) and \(pointer: fine\)\s*\{[^}]+\.mobile-short-project-card:hover \.project-preview-triptych\s*\{[^}]+transform:\s*scale\(1\.025\)[^}]+filter:\s*saturate\(\.92\)/s);
  assert.match(css, /\.mobile-short-project-card:hover \.project-preview-triptych img\s*\{[^}]+transform:\s*none[^}]+filter:\s*none/s);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.mobile-short-project-card \.project-open-mobile-cta\s*\{[^}]+align-items:\s*flex-end[^}]+justify-content:\s*flex-end[^}]+padding:\s*1rem/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.video-modal-short-form \.video-modal-media-portrait\s*\{[^}]+repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.short-form-project-viewer :is\(\.short-form-viewer-description, \.short-form-viewer-supporting-copy\)\s*\{\s*display:\s*none/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.short-form-project-viewer \.case-study-media\.is-portrait\s*\{[^}]+repeat\(2, minmax\(0, 1fr\)\)[^}]+gap:\s*\.5rem 6px/);
  assert.match(css, /@keyframes mobile-project-modal-panel-in\s*\{\s*from\s*\{[^}]+translateY\(2rem\)[^}]+\}\s*to\s*\{[^}]+translateY\(0\)/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.video-modal-inner\s*\{[^}]+animation-name:\s*mobile-project-modal-panel-in[^}]+animation-duration:\s*480ms/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.short-form-project-viewer \.video-modal-inner\s*\{[^}]+max-height:\s*84dvh[^}]+border-radius:\s*1\.25rem 1\.25rem 0 0/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.short-form-project-viewer \.case-study-roles\s*\{[^}]+flex-wrap:\s*nowrap[^}]+gap:\s*\.9rem/);
  assert.doesNotMatch(css, /\.portfolio-native-video:not\(\[controls\]\)::-webkit-media-controls/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.short-form-viewer-desktop-copy\s*\{\s*display:\s*none[\s\S]+?\.short-form-viewer-mobile-copy\s*\{\s*display:\s*block/);
  assert.match(css, /\.project\.portrait \.project-visual\.has-media\s*\{\s*aspect-ratio:\s*27\/16/);
  assert.match(css, /\.project-preview-triptych\s*\{[^}]+repeat\(3, minmax\(0, 1fr\)\)[^}]+padding:\s*0/s);
  assert.match(projectCaseStudy, /className="case-study-meta"/);
  assert.match(projectCaseStudy, />The project</);
  assert.match(projectCaseStudy, />The edit \/ approach</);
  assert.match(projectCaseStudy, /className="case-study-next"/);
  assert.match(caseStudyMedia, /role="region" aria-label=\{`Selected media for/);
  assert.match(shortFormViewer, /className="short-form-viewer-meta"/);
  assert.match(shortFormViewer, /shortFormStudy\.platforms\.join/);
  assert.match(portfolio, /className="filter-label-compact"/);
  assert.match(portfolio, /lockDocumentScroll\(\)/);
  assert.match(shortFormViewer, /lockDocumentScroll\(\)/);
  assert.match(documentScrollLock, /body\.style\.position = "fixed"/);
  assert.match(documentScrollLock, /window\.scrollTo\(0, scrollY\)/);
  assert.match(css, /\.case-study-meta\s*\{[^}]+repeat\(3, minmax\(0, 1fr\)\)/s);
  assert.match(css, /@media \(max-width: 50rem\)[\s\S]+\.case-study-story\s*\{[^}]+grid-template-columns:\s*minmax\(0, 1fr\)/s);
  assert.match(css, /\.project-meta-line\s*\{[^}]+grid-template-columns:\s*auto minmax\(0, 1fr\) auto/s);
  assert.doesNotMatch(css, /project-art-media/);
  assert.doesNotMatch(css, /background:\s*rgba\(12,12,11,\.74\)/);
  assert.doesNotMatch(css, /transform:\s*scale\(1\.045\)/);
  assert.match(css, /\.video-modal-media-portrait\s*\{[^}]+repeat\(3, minmax\(0, 1fr\)\)/s);
  assert.match(css, /\.portfolio-native-video\s*\{[^}]+width:\s*100%/s);
  assert.match(css, /\.video-modal-youtube/);
  assert.match(css, /@media \(max-width: 50rem\)[\s\S]+\.video-modal:not\(\.video-modal-short-form\) \{[^}]+padding-inline:\s*0/s);
  assert.match(css, /@media \(max-width: 50rem\)[\s\S]+\.video-modal:not\(\.video-modal-short-form\) \.video-modal-inner\s*\{\s*padding-inline:\s*0/s);
  assert.match(css, /@media \(max-width: 50rem\)[\s\S]+\.video-modal:not\(\.video-modal-short-form\) \.video-modal-media-wide\s*\{\s*gap:\s*0/s);
  assert.match(css, /\.button\s*\{[^}]+border-radius:\s*var\(--control-radius\)/s);
  assert.match(css, /\.button\s*\{[^}]+min-height:\s*3\.5rem[^}]+font-size:\s*1rem[^}]+font-weight:\s*600/s);
  assert.match(page, /className="button button-secondary" href="#work"/);
  assert.match(page, /className="button button-primary cta-outline hero-connect"/);
  assert.match(page, /className="button button-primary cta-outline contact-connect"/);
  assert.match(css, /\.button\.button-primary\.cta-outline\s*\{[^}]+border-color:\s*var\(--accent\)[^}]+border-radius:\s*var\(--control-radius\)[^}]+background:\s*transparent[^}]+color:\s*var\(--accent\)[^}]+transition:\s*transform var\(--press-speed\) ease-out, border-color 200ms ease-out, background-color 200ms ease-out, color 200ms ease-out/s);
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\)\s*\{[^}]+\.button\.button-primary\.cta-outline:hover\s*\{[^}]+background:\s*var\(--accent\)[^}]+color:\s*#fff[^}]+transform:\s*translateY\(-2px\)/s);
  assert.match(css, /\.button\.button-primary\.cta-outline:active\s*\{[^}]+background:\s*var\(--accent\)[^}]+color:\s*#fff/s);
  assert.match(css, /\.youtube-subscriber-stat strong\s*\{[^}]+font-size:\s*clamp\(1\.875rem, 2\.8vw, 2\.5rem\)/s);
  assert.doesNotMatch(css, /\.hero-connect\s*\{[^}]+text-transform:\s*uppercase/s);
  assert.match(css, /\.about-portrait/);
  assert.match(css, /\.booking-overlay\s*\{[^}]+--booking-overlay-x:\s*clamp\(2rem, 5vw, 6rem\)[^}]+--booking-overlay-y:\s*clamp\(1rem, 3vh, 2rem\)[^}]+padding:\s*var\(--booking-overlay-y\) var\(--booking-overlay-x\)/s);
  assert.match(css, /\.booking-dialog\s*\{[^}]+width:\s*100%[^}]+height:\s*calc\(100dvh - \(2 \* var\(--booking-overlay-y\)\)\)[^}]+grid-template-rows:\s*auto minmax\(0, 1fr\)[^}]+background:\s*var\(--booking-stage\)/s);
  assert.match(css, /\.booking-dialog\s*\{[^}]+overflow:\s*hidden/s);
  assert.match(css, /\.booking-calendar\s*\{[^}]+width:\s*min\(83rem, calc\(100% - 6rem\)\)[^}]+height:\s*min\(var\(--booking-calendar-height, 46\.875rem\), 100%\)[^}]+align-self:\s*center[^}]+justify-self:\s*center/s);
  assert.match(css, /\.booking-calendar iframe\s*\{[^}]+width:\s*100%[^}]+height:\s*100%[^}]+min-height:\s*0[^}]+opacity:\s*0/s);
  assert.match(css, /\.booking-calendar:is\(\[data-flow="details"\], \[data-flow="confirmation"\]\)\s*\{[^}]+height:\s*min\(var\(--booking-calendar-height, 50rem\), 100%\)/s);
  assert.match(css, /\.booking-wordmark\s*\{[^}]+width:\s*max-content[^}]+font-size:\s*clamp\(5\.5rem, 11vw, 12\.5rem\)[^}]+letter-spacing:\s*-\.025em[^}]+white-space:\s*nowrap[^}]+pointer-events:\s*none/s);
  assert.match(css, /@media \(max-width: 50rem\)[\s\S]+\.booking-overlay\s*\{[^}]+--booking-overlay-x:\s*clamp\(\.625rem, 3vw, 1rem\)[^}]+--booking-overlay-y:\s*clamp\(\.625rem, 3vw, 1rem\)/s);
  assert.match(css, /@media \(max-width: 50rem\)[\s\S]+\.booking-calendar\s*\{[^}]+height:\s*min\(var\(--booking-calendar-height, 44rem\), 100%\)/s);
  assert.match(css, /\.editorial-overlay\s*\{[^}]+visibility:\s*hidden[^}]+pointer-events:\s*none[^}]+transition-property:\s*opacity, visibility/s);
  assert.match(css, /\.editorial-close\s*\{[^}]+min-height:\s*2\.75rem[^}]+align-items:\s*center[^}]+font:\s*\.71875rem/s);
  assert.match(css, /\.editorial-close > span, \.editorial-close > i\s*\{[^}]+display:\s*inline-flex[^}]+align-items:\s*center[^}]+line-height:\s*1/s);
  assert.doesNotMatch(css, /\.editorial-close i\s*\{[^}]+font-size:/s);
  assert.match(css, /--booking-stage:\s*#f2f0ea/);
  assert.match(css, /html\[data-theme="dark"\][\s\S]+--booking-stage:\s*#0f0f0e/s);
  assert.ok(!css.includes("height: min(50rem, calc(100dvh - clamp(1.5rem, 4vw, 3rem)))"));
  assert.ok(!css.includes("height: calc(100dvh - .7rem)"));
  assert.match(css, /html\[data-theme="dark"\] \.theme-track i \{ transform: translateX\(1\.3125rem\)/);
  assert.doesNotMatch(css, /margin-inline:\s*calc\(var\(--page-gutter\)\s*\*\s*-1\)/);
  assert.match(css, /prefers-reduced-transparency:\s*reduce/);
  assert.match(css, /prefers-contrast:\s*more/);
  assert.match(css, /\.footer-upper[^}]+grid-template-columns:\s*minmax\(0, 1fr\) auto/s);
  assert.match(css, /\.footer-directory[^}]+grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.match(css, /\.footer-link-icon\s*\{[^}]+width:\s*1\.3125rem[^}]+height:\s*1\.3125rem/s);
  assert.match(siteFooter, /href:\s*"mailto:work@sarthakeai\.com"/);
  assert.match(siteFooter, /<p className="footer-quote">TRUST THE PROCESS\.<\/p>/);
  assert.doesNotMatch(page, /<small>work@sarthakeai\.com<\/small>/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.footer-upper[^}]+order:\s*1[^}]+grid-template-columns:\s*minmax\(0, 1fr\) auto/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.footer-directory[^}]+grid-template-columns:\s*minmax\(0, \.85fr\) minmax\(0, 1\.15fr\)/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.footer-social-link \.footer-link-title[^}]+white-space:\s*nowrap/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.footer-divider[^}]+order:\s*2/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.footer-bottom[^}]+order:\s*3[^}]+grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.footer-bottom[^}]+gap:\s*1rem/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.footer-quote[^}]+justify-self:\s*center[^}]+text-align:\s*center/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.footer-copyright[^}]+justify-self:\s*center[^}]+text-align:\s*center/);
  assert.match(css, /\.footer-quote\s*\{[^}]+font:[^}]+var\(--font-geist-mono\)[^}]+letter-spacing:\s*\.12em/);
  assert.match(css, /\.footer-back-to-top/);
  assert.match(css, /\.footer-copyright\s*\{[^}]+text-align:\s*end/s);
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
