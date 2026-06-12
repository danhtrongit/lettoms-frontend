import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteChrome } from "@/components/layout/site-chrome";
import { siteConfig } from "@/data/site";
import { organizationJsonLd } from "@/lib/seo";
import { getSettings } from "@/lib/repos/settings.repo";
import { getSiteNavigation } from "@/lib/cms/navigation";

const pangea = localFont({
  variable: "--font-sans",
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "system-ui", "sans-serif"],
  src: [
    { path: "./fonts/Pangea-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Pangea-SemiBold.woff2", weight: "600", style: "normal" },
  ],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: "vi_VN",
    url: siteConfig.url,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, nav] = await Promise.all([getSettings(), getSiteNavigation()]);
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${pangea.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/*
          JSON-LD rendered as raw HTML inside a wrapper so React never
          processes a <script> element (avoids React 19's script warning).
          `<` is escaped to prevent any premature </script> break-out.
        */}
        <div
          dangerouslySetInnerHTML={{
            __html: `<script type="application/ld+json">${JSON.stringify(
              organizationJsonLd()
            ).replace(/</g, "\\u003c")}</script>`,
          }}
        />
        <Providers>
          <SiteChrome announcement={settings.announcementBar} nav={nav}>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
