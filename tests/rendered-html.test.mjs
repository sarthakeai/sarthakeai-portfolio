import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

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
  assert.match(html, /Hi, I.m Sarthak/);
  assert.match(html, /id="work"/);
  assert.match(html, /id="about"/);
  assert.match(html, /id="services"/);
  assert.match(html, /id="youtube"/);
  assert.match(html, /id="contact"/);
  assert.match(html, /mailto:hello@sarthaksharma\.work/);
  assert.match(html, /https:\/\/www\.youtube\.com\/@sarthakeai/);
  assert.match(html, /https:\/\/www\.instagram\.com\/sarthak\.eai/);
  assert.match(html, /https:\/\/x\.com\/sarthakeai/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape|Ready for your video|coming soon|placeholder|Client names and links can be added/i);
});

test("keeps interaction scoped and accessibility preferences explicit", async () => {
  const [page, layout, header, portfolio, theme, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/SiteHeader.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/PortfolioGrid.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/ThemeToggle.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(page, /^"use client"/);
  assert.match(header, /^"use client"/);
  assert.match(portfolio, /aria-pressed/);
  assert.match(portfolio, /aria-live="polite"/);
  assert.match(portfolio, /aria-modal="true"/);
  assert.match(theme, /localStorage\.setItem\("theme"/);
  assert.doesNotMatch(theme, /prefers-color-scheme/);
  assert.match(layout, /stored === 'dark' \? 'dark' : 'light'/);
  assert.doesNotMatch(layout, /prefers-color-scheme/);
  assert.match(header, /aria-expanded/);
  assert.match(header, /body\.style\.overflow = "hidden"/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /prefers-reduced-transparency:\s*reduce/);
  assert.match(css, /prefers-contrast:\s*more/);
});
