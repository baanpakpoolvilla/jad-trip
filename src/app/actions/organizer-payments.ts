"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const payoutSchema = z.object({
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

const qrPathOk = (url: string) =>
  /^\/uploads\/trips\/[a-zA-Z0-9._-]+$/.test(url);

export type OrganizerPaymentActionState = { error?: string } | { ok: true };

export async function updateOrganizerPaymentSettings(
  _prev: OrganizerPaymentActionState,
  formData: FormData,
): Promise<OrganizerPaymentActionState> {
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

  const parsed = payoutSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const digits = parsed.data.payoutPromptPayId.replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 15) {
    return { error: "ความยาวตัวเลขไม่เหมาะสม (พร้อมเพย์หรือเลขผู้เสียภาษี)" };
  }

  let payoutQrImageUrl: string | null = null;
  if (parsed.data.payoutQrImageUrl) {
    if (!qrPathOk(parsed.data.payoutQrImageUrl)) {
      return { error: "ลิงก์รูป QR ไม่ถูกต้อง" };
    }
    payoutQrImageUrl = parsed.data.payoutQrImageUrl;
  }

  const bankNum = parsed.data.payoutBankAccountNumber;
  if (bankNum && !/^[\d\- ]+$/.test(bankNum)) {
    return { error: "เลขบัญชีใส่ได้เฉพาะตัวเลข ช่องว่าง และขีด" };
  }

  await db.user.update({
    where: { id: session.user.id },
    data: {
      payoutPromptPayId: digits,
      payoutQrImageUrl,
      payoutBankName: parsed.data.payoutBankName ?? null,
      payoutBankAccountName: parsed.data.payoutBankAccountName ?? null,
      payoutBankAccountNumber: bankNum?.replace(/\D/g, "") ?? null,
    },
  });

  revalidatePath("/organizer/payments");
  revalidatePath("/organizer/profile");
  revalidatePath("/organizer/trips");
  revalidatePath("/organizer");
  const trips = await db.trip.findMany({
    where: { organizerId: session.user.id },
    select: { id: true },
  });
  for (const t of trips) {
    revalidatePath(`/trips/${t.id}`);
    revalidatePath(`/organizer/trips/${t.id}`);
  }

  return { ok: true };
}
