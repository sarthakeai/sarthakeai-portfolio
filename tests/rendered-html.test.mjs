import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import { contactFormEndpoint, submitContactForm } from "../app/contact-form-submit.mjs";

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
  assert.match(html, /Sarthak/);
  assert.doesNotMatch(html, />Sarthak Sharma</);
  assert.match(html, /class="brand-name"/);
  assert.match(html, /class="brand-signature/);
  assert.match(html, /Hi, I.m Sarthak/);
  assert.match(html, /class="hero-portrait hero-reveal"/);
  assert.match(html, /role="slider"/);
  assert.match(html, /id="work"/);
  assert.match(html, /id="about"/);
  assert.match(html, /id="services"/);
  assert.match(html, /id="youtube"/);
  assert.match(html, /id="contact"/);
  assert.match(html, /social-icon-instagram/);
  assert.match(html, /social-icon-x/);
  assert.match(html, /social-icon-youtube/);
  assert.doesNotMatch(html, /footer-accordion/);
  assert.doesNotMatch(html, /hero-meta/);
  assert.doesNotMatch(html, /aria-label="At a glance"/);
  assert.match(html, /My role/);
  assert.match(html, /350\+/);
  assert.doesNotMatch(html, /Selected clients/);
  assert.doesNotMatch(html, /Some people I.ve worked with/);
  assert.match(html, /mailto:officialsarthakeai@gmail\.com/);
  assert.doesNotMatch(html, /hello@sarthaksharma\.work/);
  assert.match(html, /brands and creators around the world/);
  assert.match(html, /Press/);
  assert.match(html, /to copy email/);
  assert.match(html, /action="https:\/\/formspree\.io\/f\/xkjwbaoe"/);
  assert.match(html, /name="name"/);
  assert.match(html, /name="email"/);
  assert.match(html, /name="message"/);
  assert.match(html, /name="_gotcha"/);
  assert.match(html, /Send message/);
  assert.match(html, /https:\/\/www\.youtube\.com\/@sarthakeai/);
  assert.match(html, /https:\/\/www\.instagram\.com\/sarthak\.eai/);
  assert.match(html, /https:\/\/x\.com\/sarthakeai/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape|Ready for your video|coming soon|Client names and links can be added/i);
});

test("keeps interaction scoped and accessibility preferences explicit", async () => {
  const [page, layout, header, portfolio, data, theme, timeline, emailShortcut, contactForm, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/SiteHeader.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/PortfolioGrid.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/portfolio-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/ThemeToggle.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/HeroTimeline.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/EmailShortcut.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/ContactForm.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(page, /^"use client"/);
  assert.doesNotMatch(layout, /next\/headers|generateMetadata/);
  assert.match(layout, /metadataBase/);
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
  assert.match(header, /Available for select projects/);
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
  assert.match(data, /roles: string\[\]/);
  assert.match(data, /export const clients: Client\[\] = \[\]/);
  assert.match(data, /export const youtubeVideos: YouTubeVideo\[\] = \[\]/);
  assert.match(theme, /localStorage\.setItem\("theme"/);
  assert.match(emailShortcut, /navigator\.clipboard\.writeText/);
  assert.match(emailShortcut, /target\.closest\("input, textarea, select/);
  assert.match(emailShortcut, /1800/);
  assert.match(contactForm, /required/);
  assert.match(contactForm, /type="email"/);
  assert.match(contactForm, /requestSubmit/);
  assert.match(contactForm, /event\.ctrlKey/);
  assert.match(contactForm, /event\.metaKey/);
  assert.match(contactForm, /form\.reset\(\)/);
  assert.match(contactForm, /submittingRef\.current/);
  assert.match(contactForm, /Sending\\u2026/);
  assert.match(contactForm, /Message sent\. I\\u2019ll get back to you soon\./);
  assert.match(contactForm, /disabled=\{sending\}/);
  assert.match(contactForm, /aria-live="polite"/);
  assert.match(contactForm, /Something went wrong\. Please try again or email me directly\./);
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
  assert.match(css, /html\[data-theme="dark"\] \.theme-track i \{ transform: translateX\(1\.3125rem\)/);
  assert.doesNotMatch(css, /margin-inline:\s*calc\(var\(--page-gutter\)\s*\*\s*-1\)/);
  assert.match(css, /prefers-reduced-transparency:\s*reduce/);
  assert.match(css, /prefers-contrast:\s*more/);
});

test("keeps initial visual assets lightweight", async () => {
  const [portrait, darkLogo, lightLogo] = await Promise.all([
    stat(new URL("../public/sarthak-sharma.webp", import.meta.url)),
    stat(new URL("../public/eai-logo-dark.svg", import.meta.url)),
    stat(new URL("../public/eai-logo-light.svg", import.meta.url)),
  ]);
  assert.ok(portrait.size < 20_000, `hero portrait is ${portrait.size} bytes`);
  assert.ok(darkLogo.size < 3_000, `dark logo is ${darkLogo.size} bytes`);
  assert.ok(lightLogo.size < 3_000, `light logo is ${lightLogo.size} bytes`);
});

test("submits contact data to Formspree and handles failures", async () => {
  assert.equal(contactFormEndpoint, "https://formspree.io/f/xkjwbaoe");
  const formData = new FormData();
  formData.set("name", "Test Person");
  formData.set("email", "test@example.com");
  formData.set("message", "Test message");

  let captured;
  const response = await submitContactForm(formData, async (url, options) => {
    captured = { url, options };
    return new Response(null, { status: 200 });
  });
  assert.equal(response.ok, true);
  assert.equal(captured.url, contactFormEndpoint);
  assert.equal(captured.options.method, "POST");
  assert.equal(captured.options.body, formData);
  assert.equal(captured.options.headers.Accept, "application/json");

  await assert.rejects(() => submitContactForm(formData, async () => new Response(null, { status: 500 })), /submission failed/);
});
