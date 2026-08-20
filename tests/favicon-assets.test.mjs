import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const faviconAssets = [
  ["favicon-16.png", 16],
  ["favicon-32.png", 32],
  ["favicon-48.png", 48],
  ["favicon-192.png", 192],
  ["favicon-512.png", 512],
  ["apple-touch-icon.png", 180],
];

test("keeps the EAI favicon assets crisp and multi-resolution", async () => {
  const svg = await readFile(new URL("../public/favicon.svg", import.meta.url), "utf8");
  assert.doesNotMatch(svg, /prefers-color-scheme|<style>/);
  assert.match(svg, /viewBox="0 0 32 32"/);
  assert.match(svg, /translate\(3\.2 5\.6248\) scale\(\.03975155\) translate\(-78 -140\)/);
  assert.match(svg, /<g fill="#ffffff"/);
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
  assert.equal(ico.readUInt16LE(4), 3);
  assert.deepEqual([ico[6], ico[22], ico[38]], [16, 32, 48]);
});
