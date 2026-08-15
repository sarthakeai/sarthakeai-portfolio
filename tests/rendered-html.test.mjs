import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import { countSlotsForLocalToday, getLocalDateKey, resolveValidTimeZone } from "../app/calendly-day.mjs";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the complete Sarthak portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Sarthak \| Video Editor<\/title>/);
  assert.match(html, /Sarthak/);
  assert.doesNotMatch(html, />Sarthak Sharma</);
  assert.match(html, /class="brand-signature brand-logo-only"/);
  assert.match(html, /Hi, I.m Sarthak/);
  assert.match(html, /class="hero-portrait hero-reveal"/);
  assert.match(html, /role="slider"/);
  assert.match(html, /id="work"/);
  assert.match(html, /id="about"/);
  assert.match(html, /id="services"/);
  assert.match(html, /id="youtube"/);
  assert.match(html, /id="contact"/);
  assert.match(html, /Swan Bitcoin short-form/);
  assert.match(html, /Roxom social edits/);
  assert.match(html, /Xiaomi 13 Pro review/);
  assert.match(html, /21st Capital introduction/);
  assert.match(html, /Motion &amp; Brand Animation/);
  assert.match(html, /21st Capital interview/);
  assert.equal((html.match(/<article data-project-id="[^"]+" class="project/g) ?? []).length, 6);
  assert.match(html, /\/work\/swan\/swan-short-04-poster\.webp/);
  assert.match(html, /\/work\/roxom\/roxom-short-01-poster\.webp/);
  assert.match(html, /\/work\/youtube\/xiaomi-13-pro-poster\.webp/);
  assert.match(html, /\/work\/21st-capital\/21st-capital-intro-poster\.webp/);
  assert.match(html, /\/work\/motion\/motion-bitcoin-treasuries-poster\.webp/);
  assert.match(html, /\/work\/youtube\/21st-capital-interview-poster\.webp/);
  assert.doesNotMatch(html, /\.mp4/);
  assert.equal((html.match(/class="footer-directory-link/g) ?? []).length, 8);
  assert.match(html, /class="footer-upper"/);
  assert.match(html, /class="footer-directory"/);
  assert.match(html, /class="footer-divider"/);
  assert.match(html, />Navigation</);
  assert.match(html, />Elsewhere</);
  assert.match(html, />Instagram</);
  assert.match(html, />X \/ Twitter</);
  assert.match(html, />YouTube</);
  assert.doesNotMatch(html, /footer-nav-index/);
  assert.match(html, /© 2026 Sarthak Sharma/);
  assert.match(html, /All Rights Reserved\./);
  assert.doesNotMatch(html, /Back to top|footer-lower|footer-back/);
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
  assert.match(html, /mailto:officialsarthakeai@gmail\.com/);
  assert.doesNotMatch(html, /hello@sarthaksharma\.work/);
  assert.match(html, /brands and creators around the world/);
  assert.match(html, /Book a call or send me an email\./);
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

test("keeps interaction scoped and accessibility preferences explicit", async () => {
  const [page, layout, header, booking, availabilityRoute, contactForm, contactSubmit, portfolio, mediaPlayback, data, theme, timeline, css, swanLogo, favicon] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
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
  assert.match(layout, /icons: \{ icon: "\/favicon\.svg"/);
  assert.match(favicon, /<g fill="#ffffff"/);
  assert.match(favicon, /fill="#ff0000"/);
  assert.match(layout, /history\.scrollRestoration = 'manual'/);
  assert.match(layout, /history\.replaceState/);
  assert.match(layout, /window\.scrollTo\(0, 0\)/);
  assert.match(layout, /window\.addEventListener\('pageshow'/);
  assert.match(page, /className="hero-portrait hero-reveal"/);
  assert.match(page, /<HeroTimeline \/>/);
  assert.match(timeline, /^"use client"/);
  assert.match(timeline, /setPointerCapture/);
  assert.match(timeline, /role="slider"/);
  assert.doesNotMatch(page, /className="portrait"/);
  assert.match(header, /^"use client"/);
  assert.match(header, /brand-logo-only/);
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
  assert.match(page, /loading="lazy"/);
  assert.match(css, /eai-logo-dark\.svg/);
  assert.match(css, /eai-logo-light\.svg/);
  assert.match(css, /content-visibility:\s*auto/);
  assert.match(css, /\.mobile-nav-text[^}]+var\(--font-geist-sans\)/s);
  assert.match(css, /font-size:\s*clamp\(1\.8rem, 7\.7vw, 2\.125rem\)/);
  assert.match(css, /transform:\s*translateY\(\.625rem\)/);
  assert.match(css, /opacity 340ms var\(--ease-out\) var\(--row-open-delay\)/);
  assert.match(css, /--row-open-delay:\s*245ms/);
  assert.match(css, /\.mobile-nav-item\.is-selected/);
  assert.match(css, /scroll-margin-top:\s*calc\(5\.5rem \+ env\(safe-area-inset-top\)\)/);
  assert.match(css, /min-height:\s*100dvh/);
  assert.match(css, /env\(safe-area-inset-top\)/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(portfolio, /aria-pressed/);
  assert.match(portfolio, /aria-live="polite"/);
  assert.match(portfolio, /aria-modal="true"/);
  assert.match(portfolio, /View details for/);
  assert.match(portfolio, /focusableElements/);
  assert.match(portfolio, /project\.roles\.map/);
  assert.match(portfolio, /project\.deliverables/);
  assert.match(portfolio, /project\.result/);
  assert.match(portfolio, /selectedProject\.media/);
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
  assert.match(data, /contentType: "10 selected edits"/);
  assert.match(data, /contentType: "4 selected edits"/);
  assert.equal((data.match(/id: "swan-\d{2}"/g) ?? []).length, 10);
  assert.equal((data.match(/id: "roxom-\d{2}"/g) ?? []).length, 4);
  assert.match(data, /"YouTube Long-Form"/);
  assert.match(data, /"Motion Graphics \/ Brand Animation"/);
  assert.match(data, /"Podcast \/ Interview"/);
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
  assert.match(booking, /role="dialog"/);
  assert.match(booking, /aria-modal="true"/);
  assert.match(booking, /<iframe/);
  assert.match(booking, /event\.key === "Escape"/);
  assert.match(booking, /body\.style\.overflow = "hidden"/);
  assert.match(booking, /returnFocus\?\.focus/);
  assert.match(booking, /setCalendarSlow/);
  assert.match(booking, /Open Calendly/);
  assert.match(booking, /BookingTrigger must be used within BookingProvider/);
  assert.match(page, /<BookingProvider>/);
  assert.equal((page.match(/<BookingTrigger/g) ?? []).length, 2);
  assert.match(page, /<ContactForm \/>/);
  assert.doesNotMatch(page, /EmailShortcut|Press E/);
  assert.match(css, /\.contact-form\s*\{/);
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
  assert.match(css, /\.project\.portrait \.project-visual\.has-media\s*\{\s*aspect-ratio:\s*16\/10/);
  assert.match(css, /\.project-preview-triptych\s*\{[^}]+repeat\(3, minmax\(0, 1fr\)\)[^}]+padding:\s*0/s);
  assert.match(css, /\.project-meta-line\s*\{[^}]+grid-template-columns:\s*auto minmax\(0, 1fr\) auto/s);
  assert.doesNotMatch(css, /project-art-media/);
  assert.doesNotMatch(css, /background:\s*rgba\(12,12,11,\.74\)/);
  assert.doesNotMatch(css, /transform:\s*scale\(1\.045\)/);
  assert.match(css, /\.video-modal-media-portrait\s*\{[^}]+repeat\(3, minmax\(0, 1fr\)\)/s);
  assert.match(css, /\.video-modal-media video\s*\{[^}]+width:\s*100%/s);
  assert.match(css, /\.video-modal-youtube/);
  assert.match(css, /\.hero-connect\s*\{[^}]+height:\s*3rem;[^}]+border-radius:\s*0;[^}]+background:\s*var\(--accent\)/s);
  assert.match(css, /\.about-portrait/);
  assert.match(css, /\.booking-calendar\s*\{[^}]+justify-content:\s*center/s);
  assert.match(css, /html\[data-theme="dark"\] \.theme-track i \{ transform: translateX\(1\.3125rem\)/);
  assert.doesNotMatch(css, /margin-inline:\s*calc\(var\(--page-gutter\)\s*\*\s*-1\)/);
  assert.match(css, /prefers-reduced-transparency:\s*reduce/);
  assert.match(css, /prefers-contrast:\s*more/);
  assert.match(css, /\.footer-upper[^}]+grid-template-columns:\s*minmax\(0, 1\.5fr\) minmax\(27rem, \.9fr\)/s);
  assert.match(css, /\.footer-directory[^}]+grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.footer-upper[^}]+display:\s*contents/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.footer-directory[^}]+order:\s*1[^}]+grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.footer-divider[^}]+order:\s*2/);
  assert.match(css, /@media \(max-width: 42rem\)[\s\S]+\.footer-copyright[^}]+order:\s*3/);
  assert.doesNotMatch(css, /footer-lower|footer-back/);
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
