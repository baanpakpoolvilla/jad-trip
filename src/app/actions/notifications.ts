"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function markNotificationRead(id: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ORGANIZER") {
    return { error: "ไม่มีสิทธิ์" as const };
  }

  await db.notification.updateMany({
    where: { id, userId: session.user.id },
    data: { readAt: new Date() },
  });

  revalidatePath("/organizer/notifications");
  revalidatePath("/organizer");
  revalidatePath("/organizer", "layout");
  return { ok: true as const };
}

export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ORGANIZER") {
    return { error: "ไม่มีสิทธิ์" as const };
  }

  await db.notification.updateMany({
    where: { userId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/organizer/notifications");
  revalidatePath("/organizer");
  revalidatePath("/organizer", "layout");
  return { ok: true as const };
}
