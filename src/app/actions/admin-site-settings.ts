"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { SITE_SETTINGS_TAG } from "@/lib/site-settings";

const schema = z.object({
  siteName: z.string().min(1, "กรุณาระบุชื่อเว็บ").max(80),
  siteTagline: z.string().max(120),
  siteDescription: z.string().max(500),
  logoUrl: z
    .string()
    .url("URL โลโก้ไม่ถูกต้อง")
    .or(z.literal(""))
    .transform((v) => v || null),
  faviconUrl: z
    .string()
    .url("URL favicon ไม่ถูกต้อง")
    .or(z.literal(""))
    .transform((v) => v || null),
  ogImageUrl: z
    .string()
    .url("URL รูป OG ไม่ถูกต้อง")
    .or(z.literal(""))
    .transform((v) => v || null),
});

export async function saveSiteSettings(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok?: boolean; error?: string }> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "ไม่มีสิทธิ์" };

  const parsed = schema.safeParse({
    siteName: formData.get("siteName") ?? "",
    siteTagline: formData.get("siteTagline") ?? "",
    siteDescription: formData.get("siteDescription") ?? "",
    logoUrl: formData.get("logoUrl") ?? "",
    faviconUrl: formData.get("faviconUrl") ?? "",
    ogImageUrl: formData.get("ogImageUrl") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const { siteName, siteTagline, siteDescription, logoUrl, faviconUrl, ogImageUrl } = parsed.data;

  await db.siteSettings.upsert({
    where: { id: "1" },
    update: { siteName, siteTagline, siteDescription, logoUrl, faviconUrl, ogImageUrl },
    create: { id: "1", siteName, siteTagline, siteDescription, logoUrl, faviconUrl, ogImageUrl },
  });

  revalidateTag(SITE_SETTINGS_TAG);
  return { ok: true };
}
