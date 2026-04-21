"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { toNullableSocial, trimSocialLink } from "@/lib/social-link";

const trim = (s: unknown) => (typeof s === "string" ? s : "").trim();

// ── Step 1: Save profile and go to payment step ──────────────────────────────

const onboardingProfileSchema = z.object({
  name: z.string().min(2, "กรอกชื่อให้ชัดเจน (อย่างน้อย 2 ตัวอักษร)"),
  phone: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
  socialLine: z.string().max(500).optional(),
  socialFacebook: z.string().max(500).optional(),
  socialInstagram: z.string().max(500).optional(),
});

export type OnboardingProfileState = { error?: string } | { ok: true };

export async function saveOnboardingProfile(
  _prev: OnboardingProfileState,
  formData: FormData,
): Promise<OnboardingProfileState> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ORGANIZER") {
    return { error: "ไม่มีสิทธิ์" };
  }

  const parsed = onboardingProfileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone")?.toString() ?? "",
    bio: formData.get("bio")?.toString() ?? "",
    avatarUrl: formData.get("avatarUrl")?.toString() ?? "",
    socialLine: formData.get("socialLine")?.toString() ?? "",
    socialFacebook: formData.get("socialFacebook")?.toString() ?? "",
    socialInstagram: formData.get("socialInstagram")?.toString() ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const v = parsed.data;
  const phone = trim(v.phone);
  if (phone.length > 0 && phone.length < 8) {
    return { error: "เบอร์โทรสั้นเกินไป" };
  }

  await db.user.update({
    where: { id: session.user.id },
    data: {
      name: trim(v.name),
      phone: phone.length ? phone : null,
      bio: trim(v.bio),
      avatarUrl: trim(v.avatarUrl) || null,
      socialLine: toNullableSocial(trimSocialLink(v.socialLine ?? "")),
      socialFacebook: toNullableSocial(trimSocialLink(v.socialFacebook ?? "")),
      socialInstagram: toNullableSocial(trimSocialLink(v.socialInstagram ?? "")),
    },
  });

  redirect("/onboarding/payment");
}

// ── Step 2: Save payment, mark onboarding complete, go to create trip ────────

const onboardingPaymentSchema = z.object({
  payoutPromptPayId: z
    .string()
    .trim()
    .min(9, "กรอกเลขพร้อมเพย์ / เลขประจำตัวผู้เสียภาษีอย่างน้อย 9 หลัก")
    .max(20, "ยาวเกินไป")
    .regex(/^[\d\- ]+$/, "ใส่ได้เฉพาะตัวเลข ช่องว่าง และขีด"),
  payoutQrImageUrl: z
    .string()
    .trim()
    .max(512)
    .optional()
    .transform((s) => (s === "" ? undefined : s)),
  payoutBankName: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((s) => (s === "" ? undefined : s)),
  payoutBankAccountName: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((s) => (s === "" ? undefined : s)),
  payoutBankAccountNumber: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((s) => (s === "" ? undefined : s)),
});

export type OnboardingPaymentState = { error?: string } | { ok: true };

export async function saveOnboardingPayment(
  _prev: OnboardingPaymentState,
  formData: FormData,
): Promise<OnboardingPaymentState> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ORGANIZER") {
    return { error: "ไม่มีสิทธิ์" };
  }

  const raw = {
    payoutPromptPayId: (formData.get("payoutPromptPayId") ?? "").toString(),
    payoutQrImageUrl: (formData.get("payoutQrImageUrl") ?? "").toString(),
    payoutBankName: (formData.get("payoutBankName") ?? "").toString(),
    payoutBankAccountName: (formData.get("payoutBankAccountName") ?? "").toString(),
    payoutBankAccountNumber: (formData.get("payoutBankAccountNumber") ?? "").toString(),
  };

  const parsed = onboardingPaymentSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const digits = parsed.data.payoutPromptPayId.replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 15) {
    return { error: "ความยาวตัวเลขไม่เหมาะสม (พร้อมเพย์หรือเลขผู้เสียภาษี)" };
  }

  const qrUrl = parsed.data.payoutQrImageUrl ?? null;
  if (qrUrl) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const qrUrlOk =
      !!supabaseUrl &&
      qrUrl.startsWith(`${supabaseUrl}/storage/v1/object/public/`);
    if (!qrUrlOk) return { error: "ลิงก์รูป QR ไม่ถูกต้อง" };
  }

  const bankNum = parsed.data.payoutBankAccountNumber;
  if (bankNum && !/^[\d\- ]+$/.test(bankNum)) {
    return { error: "เลขบัญชีใส่ได้เฉพาะตัวเลข ช่องว่าง และขีด" };
  }

  await db.user.update({
    where: { id: session.user.id },
    data: {
      payoutPromptPayId: digits,
      payoutQrImageUrl: qrUrl,
      payoutBankName: parsed.data.payoutBankName ?? null,
      payoutBankAccountName: parsed.data.payoutBankAccountName ?? null,
      payoutBankAccountNumber: bankNum?.replace(/\D/g, "") ?? null,
      onboardingCompletedAt: new Date(),
    },
  });

  redirect("/organizer/trips/new");
}
