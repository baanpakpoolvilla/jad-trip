/** ใช้กับ metadataBase, sitemap, robots — ตรงกับ NEXT_PUBLIC_APP_URL บน production */
const FALLBACK_PRODUCTION_BASE = "https://sayhitrip.com";

export function getPublicSiteBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || FALLBACK_PRODUCTION_BASE;
}
