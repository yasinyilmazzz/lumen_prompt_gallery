import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { siteUrl } from "@/lib/utils";

const base = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: {
    default: "LUMEN — AI Visual Prompt Library",
    template: "%s — LUMEN Prompt Library",
  },
  description:
    "Discover cinematic AI-generated visuals and copy the exact prompts behind them. Explore consistent models, categories and curated prompt collections.",
  keywords: ["AI prompts", "text to image", "prompt library", "AI photography", "fashion editorial AI", "midjourney prompts"],
  authors: [{ name: "LUMEN" }],
  openGraph: {
    type: "website",
    siteName: "LUMEN",
    title: "LUMEN — AI Visual Prompt Library",
    description: "Discover cinematic AI visuals and copy the exact prompts behind them.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LUMEN — AI Visual Prompt Library",
    description: "Discover cinematic AI visuals and copy the exact prompts behind them.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#fafafb] text-[#101012] antialiased">
        {children}
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "LUMEN — AI Visual Prompt Library",
              url: base,
              potentialAction: {
                "@type": "SearchAction",
                target: `${base}/explore?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
