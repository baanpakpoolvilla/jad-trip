import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

export type SiteSettings = {
  siteName: string;
  siteTagline: string;
  siteDescription: string;
  logoUrl: string | null;
  faviconUrl: string | null;
};

export const SITE_SETTINGS_TAG = "site-settings";

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: "Say Hi Trip",
  siteTagline: "ส่ง Trip ให้ทุกคน",
  siteDescription:
    "แพลตฟอร์มจัดทริปกลุ่มแบบอบอุ่น — นำเสนอทริป รับจอง ตามสถานะชำระเงิน และส่งลิงก์ให้เพื่อนหรือลูกค้าได้ในที่เดียว",
  logoUrl: null,
  faviconUrl: null,
};

/** โหลดการตั้งค่าเว็บไซต์จาก DB — cache ไว้จนกว่าจะมีการบันทึกใหม่ */
export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const row = await db.siteSettings.findUnique({ where: { id: "1" } });
    if (!row) return DEFAULT_SITE_SETTINGS;
    return {
      siteName: row.siteName,
      siteTagline: row.siteTagline,
      siteDescription: row.siteDescription,
      logoUrl: row.logoUrl,
      faviconUrl: row.faviconUrl,
    };
  },
  ["site-settings"],
  { tags: [SITE_SETTINGS_TAG] },
);
