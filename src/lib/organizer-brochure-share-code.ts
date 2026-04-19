import { db } from "@/lib/db";
import { randomShareCode } from "@/lib/trip-share-code";
import { organizerBrochureShortPath } from "@/lib/trips-public";

/** สร้างหรือคืนรหัสย่อสำหรับลิงก์ `/o/…` (ไม่ซ้ำในตาราง User) */
export async function ensureOrganizerBrochureShareCode(userId: string): Promise<string> {
  const u = await db.user.findUnique({
    where: { id: userId },
    select: { brochureShareCode: true },
  });
  if (!u) throw new Error("User not found");
  if (u.brochureShareCode) return u.brochureShareCode;

  for (let attempt = 0; attempt < 16; attempt++) {
    const code = randomShareCode();
    try {
      await db.user.update({
        where: { id: userId },
        data: { brochureShareCode: code },
      });
      return code;
    } catch {
      // unique collision — retry
    }
  }
  throw new Error("Could not assign organizer brochureShareCode");
}

/** ลิงก์สาธารณะแบบย่อสำหรับแชร์ — ต้องเรียกหลัง ensure (เช่นใน layout) */
export async function getOrganizerPublicBrochureHref(userId: string): Promise<string> {
  const code = await ensureOrganizerBrochureShareCode(userId);
  return organizerBrochureShortPath(code);
}
