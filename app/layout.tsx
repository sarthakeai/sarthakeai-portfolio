import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const themeScript = `(() => { try { const stored = localStorage.getItem('theme'); const theme = stored || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); document.documentElement.dataset.theme = theme; document.documentElement.style.colorScheme = theme; } catch (_) {} })();`;

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og-light.png`;
  const title = "Sarthak Sharma — Video Editor & Creator";
  const description = "Freelance video editor and creator from India, working across YouTube, short-form, podcasts, tech and social content.";
  return {
    title, description,
    icons: { icon: "/eai-mark.png", shortcut: "/eai-mark.png", apple: "/eai-mark.png" },
    openGraph: { title, description, type: "website", images: [{ url: image, width: 1200, height: 630, alt: "Sarthak Sharma — Video Editor & Creator" }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}
