/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const VIDEO_PATH_PATTERN = /^\/work\/.+\.mp4$/i;
const SINGLE_BYTE_RANGE_PATTERN = /^bytes=(\d*)-(\d*)$/i;

function rangeNotSatisfiable(totalLength: number) {
  return new Response(null, {
    status: 416,
    headers: {
      "Accept-Ranges": "bytes",
      "Content-Range": `bytes */${totalLength}`,
    },
  });
}

async function serveVideoAsset(request: Request, env: Env): Promise<Response> {
  const assetResponse = await env.ASSETS.fetch(request);
  const rangeHeader = request.headers.get("Range");

  if (!assetResponse.ok || assetResponse.status === 206) {
    const headers = new Headers(assetResponse.headers);
    headers.set("Accept-Ranges", "bytes");
    return new Response(request.method === "HEAD" ? null : assetResponse.body, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers,
    });
  }

  if (!rangeHeader) {
    const headers = new Headers(assetResponse.headers);
    headers.set("Accept-Ranges", "bytes");
    return new Response(request.method === "HEAD" ? null : assetResponse.body, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers,
    });
  }

  const match = SINGLE_BYTE_RANGE_PATTERN.exec(rangeHeader.trim());
  const assetBytes = await assetResponse.arrayBuffer();
  const totalLength = assetBytes.byteLength;
  if (!match || totalLength === 0) return rangeNotSatisfiable(totalLength);

  const [, startText, endText] = match;
  if (!startText && !endText) return rangeNotSatisfiable(totalLength);

  let start: number;
  let end: number;
  if (!startText) {
    const suffixLength = Number(endText);
    if (!Number.isInteger(suffixLength) || suffixLength <= 0) return rangeNotSatisfiable(totalLength);
    start = Math.max(0, totalLength - suffixLength);
    end = totalLength - 1;
  } else {
    start = Number(startText);
    end = endText ? Number(endText) : totalLength - 1;
  }

  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || start >= totalLength || end < start) {
    return rangeNotSatisfiable(totalLength);
  }
  end = Math.min(end, totalLength - 1);

  const headers = new Headers(assetResponse.headers);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Range", `bytes ${start}-${end}/${totalLength}`);
  headers.set("Content-Length", String(end - start + 1));
  return new Response(assetBytes.slice(start, end + 1), {
    status: 206,
    headers,
  });
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.hostname === "www.sarthakeai.com" || (url.hostname === "sarthakeai.com" && url.protocol !== "https:")) {
      url.protocol = "https:";
      url.hostname = "sarthakeai.com";
      return Response.redirect(url.toString(), 301);
    }

    if (VIDEO_PATH_PATTERN.test(url.pathname)) {
      return serveVideoAsset(request, env);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
