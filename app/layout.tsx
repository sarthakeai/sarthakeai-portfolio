import type { Metadata } from "next";
import "./globals.css";

const themeScript = `(() => { try { const stored = localStorage.getItem('theme'); const theme = stored === 'dark' ? 'dark' : 'light'; document.documentElement.dataset.theme = theme; document.documentElement.style.colorScheme = theme; document.documentElement.style.backgroundColor = theme === 'dark' ? '#0f0f0e' : '#ffffff'; } catch (_) { document.documentElement.dataset.theme = 'light'; document.documentElement.style.colorScheme = 'light'; document.documentElement.style.backgroundColor = '#ffffff'; } })();`;
const startupScrollScript = `(() => {
  try {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const hashTargets = {
      '#work': '#work',
      '#about': '#about',
      '#services': '#services',
      '#what-i-do': '#services',
      '#youtube': '#youtube',
      '#contact': '#contact',
    };
    const navigation = performance.getEntriesByType?.('navigation')?.[0];
    const isReload = navigation?.type === 'reload';
    if (isReload && location.hash) history.replaceState(null, '', location.pathname + location.search);
    const hashTarget = isReload ? undefined : hashTargets[location.hash];
    if (hashTarget) {
      const initialHash = location.hash;
      let frame = 0;
      let observer;
      const stopTracking = () => {
        observer?.disconnect();
        cancelAnimationFrame(frame);
      };
      const alignToHash = () => {
        if (location.hash !== initialHash) return stopTracking();
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => requestAnimationFrame(() => {
          document.querySelector(hashTarget)?.scrollIntoView({ behavior: 'auto', block: 'start' });
        }));
      };
      const startTracking = () => {
        observer = new ResizeObserver(alignToHash);
        observer.observe(document.body);
        alignToHash();
        document.fonts?.ready.then(alignToHash);
      };
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startTracking, { once: true });
      else startTracking();
      window.addEventListener('load', alignToHash, { once: true });
      window.addEventListener('hashchange', stopTracking, { once: true });
      window.addEventListener('wheel', stopTracking, { passive: true, once: true });
      window.addEventListener('touchstart', stopTracking, { passive: true, once: true });
      window.addEventListener('pointerdown', stopTracking, { passive: true, once: true });
      window.addEventListener('keydown', stopTracking, { once: true });
      return;
    }
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    const resetToTop = () => {
      if (location.hash) return;
      const root = document.documentElement;
      const previous = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, 0);
      root.style.scrollBehavior = previous;
    };
    let topFrame = 0;
    const settleAtTop = () => {
      if (location.hash) return cancelAnimationFrame(topFrame);
      resetToTop();
      cancelAnimationFrame(topFrame);
      topFrame = requestAnimationFrame(() => requestAnimationFrame(resetToTop));
    };
    settleAtTop();
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', settleAtTop, { once: true });
    window.addEventListener('load', settleAtTop, { once: true });
    document.fonts?.ready.then(settleAtTop);
    window.addEventListener('pageshow', settleAtTop);
  } catch (_) {}
})();`;

const title = "Sarthak Sharma - Video Editor for Brands & Creators";
const description = "Video editor and creator working with brands and creators worldwide across YouTube, short-form, podcasts and motion graphics. Based in New Delhi, India.";

export const metadata: Metadata = {
  metadataBase: new URL("https://sarthakeai.com"),
  title,
  description,
  alternates: { canonical: "https://sarthakeai.com/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: { title, description, siteName: "Sarthak Sharma", type: "website", url: "https://sarthakeai.com/", images: [{ url: "/og-white.png", width: 1200, height: 630, alt: title }] },
  twitter: { card: "summary_large_image", title, description, images: ["/og-white.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><link rel="preload" href="/fonts/geist-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /><link rel="preload" href="/eai-logo-dark.svg" as="image" type="image/svg+xml" /><link rel="preload" href="/eai-logo-light.svg" as="image" type="image/svg+xml" /><script dangerouslySetInnerHTML={{ __html: themeScript }} /><script dangerouslySetInnerHTML={{ __html: startupScrollScript }} /></head><body>{children}</body></html>;
}
