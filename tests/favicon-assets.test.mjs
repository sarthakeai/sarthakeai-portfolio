import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const faviconAssets = [
  ["favicon-16x16.png", 16],
  ["favicon-32x32.png", 32],
  ["favicon-48x48.png", 48],
  ["apple-touch-icon.png", 180],
  ["android-chrome-192x192.png", 192],
  ["android-chrome-512x512.png", 512],
  ["favicon-master-512x512.png", 512],
];

test("keeps the EAI favicon assets crisp and multi-resolution", async () => {
  const svg = await readFile(new URL("../public/favicon.svg", import.meta.url), "utf8");
  assert.doesNotMatch(svg, /prefers-color-scheme|<style>/);
  assert.match(svg, /viewBox="0 0 512 512"/);
  assert.match(svg, /<rect width="512" height="512" rx="71\.68" fill="#ffffff"/);
  assert.match(svg, /translate\(74\.5 97\.5\) scale\(\.5917252\) translate\(-79\.75 -140\.75\)/);
  assert.match(svg, /<g fill="#000000"/);
  assert.match(svg, /fill="#ff0000"/);
  for (const [filename, size] of faviconAssets) {
    const png = await readFile(new URL(`../public/${filename}`, import.meta.url));
    assert.equal(png.toString("ascii", 1, 4), "PNG", `${filename} is a PNG`);
    assert.equal(png.readUInt32BE(16), size, `${filename} width`);
    assert.equal(png.readUInt32BE(20), size, `${filename} height`);
  }

  const ico = await readFile(new URL("../public/favicon.ico", import.meta.url));
  assert.equal(ico.readUInt16LE(0), 0);
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 4);
  assert.deepEqual([ico[6], ico[22], ico[38], ico[54]], [16, 32, 48, 0]);
});

test("wires the final favicon package through the web manifest", async () => {
  const manifest = JSON.parse(await readFile(new URL("../public/site.webmanifest", import.meta.url), "utf8"));
  assert.equal(manifest.background_color, "#ffffff");
  assert.equal(manifest.theme_color, "#ffffff");
  assert.deepEqual(
    manifest.icons.map(({ src, sizes, purpose }) => [src, sizes, purpose]),
    [
      ["/android-chrome-192x192.png", "192x192", "any"],
      ["/android-chrome-512x512.png", "512x512", "any"],
    ],
  );
});
