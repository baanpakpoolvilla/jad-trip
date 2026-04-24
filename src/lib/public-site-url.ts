/** ใช้กับ metadataBase, sitemap, robots — ตรงกับ NEXT_PUBLIC_APP_URL บน production */
const FALLBACK_PRODUCTION_BASE = "https://sayhitrip.com";

function originFromCandidate(candidate: string): string | null {
  try {
    const u = new URL(candidate);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.origin;
  } catch {
    return null;
  }
}

/**
 * คืน origin ที่ใช้ในลิงก์สาธารณะ — ไม่ throw แม้ env ผิดรูปแบบ (มิฉะนั้น generateMetadata ล้มทั้งไซต์บน production)
 */
export function getPublicSiteBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return FALLBACK_PRODUCTION_BASE;

  const withProtocol = raw.includes("://") ? raw : `https://${raw}`;
  return (
    originFromCandidate(raw) ??
    originFromCandidate(withProtocol) ??
    FALLBACK_PRODUCTION_BASE
  );
}

/** metadataBase — สร้างจาก base ที่ sanitize แล้ว */
export function getMetadataBaseUrl(): URL {
  return new URL(getPublicSiteBaseUrl());
}
