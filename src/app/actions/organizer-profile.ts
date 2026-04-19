"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const trim = (s: unknown) => (typeof s === "string" ? s : "").trim();

const profileSchema = z.object({
  name: z.string().min(2, "กรอกชื่อให้ชัดเจน"),
  phone: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export type OrganizerProfileActionState = { error?: string } | { ok: true };

export async function updateOrganizerProfile(
  _prev: OrganizerProfileActionState,
  formData: FormData,
): Promise<OrganizerProfileActionState> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ORGANIZER") {
    return { error: "ไม่มีสิทธิ์" };
  }

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone")?.toString() ?? "",
    bio: formData.get("bio")?.toString() ?? "",
    avatarUrl: formData.get("avatarUrl")?.toString() ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const v = parsed.data;
  const phone = trim(v.phone);
  if (phone.length > 0 && phone.length < 8) {
    return { error: "เบอร์โทรสั้นเกินไป" };
  }

  const avatar = trim(v.avatarUrl);

  const isGuide = formData.get("isGuide") === "on";

  await db.user.update({
    where: { id: session.user.id },
    data: {
      name: trim(v.name),
      phone: phone.length ? phone : null,
      bio: trim(v.bio),
      avatarUrl: avatar.length ? avatar : null,
      isGuide,
    },
  });

  revalidatePath("/organizer/profile");
  revalidatePath("/organizer/trips");
  revalidatePath("/organizer");
  revalidatePath("/organizer/trips/new");
  revalidatePath("/trips");

  const trips = await db.trip.findMany({
    where: { organizerId: session.user.id },
    select: { id: true },
  });
  for (const t of trips) {
    revalidatePath(`/trips/${t.id}`);
    revalidatePath(`/organizer/trips/${t.id}`);
    revalidatePath(`/organizer/trips/${t.id}/edit`);
  }

  return { ok: true };
}
