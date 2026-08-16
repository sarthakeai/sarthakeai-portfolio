import type { Metadata } from "next";
import "./globals.css";

const themeScript = `(() => { try { const stored = localStorage.getItem('theme'); const theme = stored === 'dark' ? 'dark' : 'light'; document.documentElement.dataset.theme = theme; document.documentElement.style.colorScheme = theme; document.documentElement.style.backgroundColor = theme === 'dark' ? '#0f0f0e' : '#ffffff'; } catch (_) { document.documentElement.dataset.theme = 'light'; document.documentElement.style.colorScheme = 'light'; document.documentElement.style.backgroundColor = '#ffffff'; } })();`;
const startupScrollScript = `(() => {
  const resetToTop = () => {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previous;
  };
  try {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  } catch (_) {}
  resetToTop();
  document.addEventListener('DOMContentLoaded', resetToTop, { once: true });
  window.addEventListener('load', () => requestAnimationFrame(resetToTop), { once: true });
  window.addEventListener('pageshow', resetToTop);
})();`;

const title = "Sarthak | Video Editor";
const description = "Freelance video editor and creator from India, working across YouTube, short-form, podcasts, tech and social content.";

export const metadata: Metadata = {
  metadataBase: new URL("https://sarthakeai.com"),
  title,
  description,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg", apple: "/eai-mark.png" },
  openGraph: { title, description, type: "website", url: "https://sarthakeai.com/", images: [{ url: "/og-white.png", width: 1200, height: 630, alt: title }] },
  twitter: { card: "summary_large_image", title, description, images: ["/og-white.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><link rel="canonical" href="https://sarthakeai.com/" /><link rel="preload" href="/fonts/geist-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /><link rel="preload" href="/eai-logo-dark.svg" as="image" type="image/svg+xml" /><link rel="preload" href="/eai-logo-light.svg" as="image" type="image/svg+xml" /><script dangerouslySetInnerHTML={{ __html: themeScript }} /><script dangerouslySetInnerHTML={{ __html: startupScrollScript }} /></head><body>{children}</body></html>;
}
