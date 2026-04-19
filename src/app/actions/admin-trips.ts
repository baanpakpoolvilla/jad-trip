"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { db } from "@/lib/db";

function q(msg: string) {
  return encodeURIComponent(msg);
}

export async function reassignTripOrganizer(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect(`/admin/trips?e=${q("ไม่มีสิทธิ์")}`);
  }

  const tripId = (formData.get("tripId")?.toString() ?? "").trim();
  const email = (formData.get("organizerEmail")?.toString() ?? "").trim().toLowerCase();

  if (!tripId) redirect(`/admin/trips?e=${q("ไม่พบรหัสทริป")}`);
  if (!email) redirect(`/admin/trips?e=${q("กรอกอีเมลผู้จัดปลายทาง")}`);

  const trip = await db.trip.findUnique({
    where: { id: tripId },
    select: { id: true, organizerId: true },
  });
  if (!trip) redirect(`/admin/trips?e=${q("ไม่พบทริป")}`);

  const nextOrganizer = await db.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });
  if (!nextOrganizer) {
    redirect(`/admin/trips?e=${q(`ไม่พบผู้ใช้อีเมล ${email}`)}`);
  }
  if (nextOrganizer.role !== Role.ORGANIZER) {
    redirect(`/admin/trips?e=${q("บัญชีนี้ไม่ใช่ผู้จัดทริป (ORGANIZER)")}`);
  }
  if (nextOrganizer.id === trip.organizerId) {
    redirect(`/admin/trips?e=${q("ทริปนี้อยู่กับผู้จัดคนนี้อยู่แล้ว")}`);
  }

  await db.trip.update({
    where: { id: tripId },
    data: { organizerId: nextOrganizer.id },
  });

  revalidatePath("/admin/trips");
  revalidatePath("/trips");
  revalidatePath(`/trips/${tripId}`);
  revalidatePath("/organizer/trips");
  revalidatePath("/organizer");
  revalidatePath(`/organizer/trips/${tripId}`);

  redirect("/admin/trips?ok=1");
}
