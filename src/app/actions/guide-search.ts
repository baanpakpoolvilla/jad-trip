"use server";

import type { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export type GuideSearchResult = {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatarUrl: string | null;
};

/** ผู้จัดค้นหา user ที่เปิดโหมดไกด์ — วาง id / พิมพ์ชื่อ / อีเมล */
export async function searchGuidesForTripOrganizer(
  query: string,
): Promise<GuideSearchResult[] | { error: string }> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ORGANIZER") {
    return { error: "ไม่มีสิทธิ์" };
  }

  const q = query.trim();
  if (q.length < 2) {
    return { error: "พิมพ์อย่างน้อย 2 ตัวอักษร หรือวางรหัสผู้ใช้ (cuid)" };
  }

  const or: Prisma.UserWhereInput[] = [];

  if (/^c[a-z0-9]{24}$/i.test(q)) {
    or.push({ id: { equals: q } });
  } else if (/^c[a-z0-9]{5,23}$/i.test(q)) {
    or.push({ id: { startsWith: q } });
  }

  or.push({ name: { contains: q, mode: "insensitive" } });
  or.push({ email: { contains: q, mode: "insensitive" } });

  try {
    return await db.user.findMany({
      where: {
        isGuide: true,
        OR: or,
      },
      take: 15,
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatarUrl: true,
      },
      orderBy: { name: "asc" },
    });
  } catch {
    return {
      error: "ค้นหาไกด์ไม่สำเร็จชั่วคราว — กรุณาลองใหม่หรือติดต่อผู้ดูแลระบบ",
    };
  }
}
