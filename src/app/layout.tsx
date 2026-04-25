import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import { Providers } from "@/components/providers";
import { getMetadataBaseUrl } from "@/lib/public-site-url";
import { getSiteSettingsSafe } from "@/lib/site-settings";
import { safeHttpHref } from "@/lib/social-link";
import { safeAuth } from "@/lib/auth-session";
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
  const s = await getSiteSettingsSafe();
  const title = `${s.siteName} — ${s.siteTagline}`;
  const shareImageUrl = safeHttpHref(s.ogImageUrl) ?? safeHttpHref(s.logoUrl);
  const faviconHref = safeHttpHref(s.faviconUrl);

  return {
    metadataBase: getMetadataBaseUrl(),
    title: {
      default: title,
      template: `%s | ${s.siteName}`,
    },
    description: s.siteDescription,
    ...(faviconHref
      ? { icons: { icon: faviconHref, shortcut: faviconHref } }
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await safeAuth();
  return (
    <html
      lang="th"
      className={`${notoSansThai.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full bg-canvas font-sans text-fg antialiased">
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
