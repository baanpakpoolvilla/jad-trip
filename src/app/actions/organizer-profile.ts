"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { toNullableSocial, trimSocialLink } from "@/lib/social-link";

const trim = (s: unknown) => (typeof s === "string" ? s : "").trim();

const linkField = z.string().max(500, "ลิงก์ยาวเกินไป (สูงสุด 500 ตัวอักษร)");

const profileSchema = z.object({
  name: z.string().min(2, "กรอกชื่อให้ชัดเจน"),
  phone: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
  socialWebsite: linkField,
  socialLine: linkField,
  socialFacebook: linkField,
  socialInstagram: linkField,
  socialTiktok: linkField,
  socialYoutube: linkField,
  socialX: linkField,
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
    socialWebsite: formData.get("socialWebsite")?.toString() ?? "",
    socialLine: formData.get("socialLine")?.toString() ?? "",
    socialFacebook: formData.get("socialFacebook")?.toString() ?? "",
    socialInstagram: formData.get("socialInstagram")?.toString() ?? "",
    socialTiktok: formData.get("socialTiktok")?.toString() ?? "",
    socialYoutube: formData.get("socialYoutube")?.toString() ?? "",
    socialX: formData.get("socialX")?.toString() ?? "",
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

  const sw = toNullableSocial(trimSocialLink(v.socialWebsite ?? ""));
  const sl = toNullableSocial(trimSocialLink(v.socialLine ?? ""));
  const sf = toNullableSocial(trimSocialLink(v.socialFacebook ?? ""));
  const si = toNullableSocial(trimSocialLink(v.socialInstagram ?? ""));
  const st = toNullableSocial(trimSocialLink(v.socialTiktok ?? ""));
  const sy = toNullableSocial(trimSocialLink(v.socialYoutube ?? ""));
  const sx = toNullableSocial(trimSocialLink(v.socialX ?? ""));

  await db.user.update({
    where: { id: session.user.id },
    data: {
      name: trim(v.name),
      phone: phone.length ? phone : null,
      bio: trim(v.bio),
      avatarUrl: avatar.length ? avatar : null,
      isGuide,
      socialWebsite: sw,
      socialLine: sl,
      socialFacebook: sf,
      socialInstagram: si,
      socialTiktok: st,
      socialYoutube: sy,
      socialX: sx,
    },
  });

  revalidatePath("/organizer/profile");
  revalidatePath("/organizer/trips");
  revalidatePath("/organizer");
  revalidatePath("/organizer/trips/new");
  revalidatePath("/trips");

  const userCode = await db.user.findUnique({
    where: { id: session.user.id },
    select: { brochureShareCode: true },
  });
  if (userCode?.brochureShareCode?.trim()) {
    revalidatePath(`/o/${userCode.brochureShareCode.trim().toLowerCase()}/profile`);
  }

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
