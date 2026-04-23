import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import { Providers } from "@/components/providers";
import { getPublicSiteBaseUrl } from "@/lib/public-site-url";
import { getSiteSettings } from "@/lib/site-settings";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const title = `${s.siteName} — ${s.siteTagline}`;
  const shareImageUrl = s.ogImageUrl?.trim() || s.logoUrl?.trim();

  return {
    metadataBase: new URL(getPublicSiteBaseUrl()),
    title: {
      default: title,
      template: `%s | ${s.siteName}`,
    },
    description: s.siteDescription,
    ...(s.faviconUrl?.trim()
      ? { icons: { icon: s.faviconUrl.trim(), shortcut: s.faviconUrl.trim() } }
      : {}),
    openGraph: {
      type: "website",
      locale: "th_TH",
      siteName: s.siteName,
      title,
      description: s.siteDescription,
      ...(shareImageUrl
        ? { images: [{ url: shareImageUrl, width: 1200, height: 630 }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: s.siteDescription,
      ...(shareImageUrl ? { images: [shareImageUrl] } : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${notoSansThai.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full bg-canvas font-sans text-fg antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
