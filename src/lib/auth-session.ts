import { cache } from "react";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { db } from "@/lib/db";

/** ไม่ throw — JWT เสีย / Auth.js misconfigured จะได้ null แทนล้มทั้งเชลล์
 *  ใช้ React cache() เพื่อ deduplicate ข้าม layout → page ภายใน request เดียวกัน */
export const safeAuth = cache(async (): Promise<Session | null> => {
  try {
    return await auth();
  } catch {
    return null;
  }
});

/** ข้อมูล user ที่ใช้บ่อยใน organizer shell — cached ต่อ request เพื่อไม่ต้อง query ซ้ำ */
export const getOrganizerUser = cache(async (userId: string) => {
  return db.user.findUnique({
    where: { id: userId },
    select: { onboardingCompletedAt: true, brochureShareCode: true },
  });
});
