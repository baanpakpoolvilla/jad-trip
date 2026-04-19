import { NextResponse } from "next/server";
import { BookingStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyBankSlipBase64 } from "@/lib/easyslip";
import { slipReceiverMatchesPromptPayId } from "@/lib/slip-receiver-match";

const bodySchema = z.object({
  viewToken: z.string().min(16),
  base64: z.string().min(100),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "คำขอไม่ถูกต้อง" }, { status: 400 });
  }

  const { viewToken, base64 } = parsed.data;

  const booking = await db.booking.findUnique({
    where: { viewToken },
    include: { trip: { include: { organizer: true } } },
  });

  if (!booking) {
    return NextResponse.json({ error: "ไม่พบการจอง" }, { status: 404 });
  }

  if (booking.status !== BookingStatus.PENDING_PAYMENT) {
    return NextResponse.json(
      { error: "การจองนี้ไม่อยู่ในสถานะรอชำระเงิน" },
      { status: 400 },
    );
  }

  if (booking.expiresAt < new Date()) {
    await db.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.EXPIRED },
    });
    return NextResponse.json({ error: "หมดเวลาชำระเงินแล้ว" }, { status: 400 });
  }

  const payoutId = booking.trip.organizer.payoutPromptPayId?.trim();
  if (!payoutId) {
    return NextResponse.json(
      { error: "ผู้จัดยังไม่ตั้งเลขรับเงินพร้อมเพย์ — โปรดติดต่อผู้จัด" },
      { status: 503 },
    );
  }

  const expectedAmount = booking.trip.pricePerPerson;

  const slip = await verifyBankSlipBase64(base64, {
    matchAmount: expectedAmount,
    checkDuplicate: true,
    remark: `booking:${booking.id}`.slice(0, 255),
  });

  if (!slip.ok) {
    return NextResponse.json({ error: slip.message }, { status: 400 });
  }

  const { data } = slip;
  if (data.isDuplicate) {
    return NextResponse.json(
      { error: "สลิปนี้เคยถูกใช้ตรวจสอบในระบบแล้ว — ใช้สลิปใหม่หรือติดต่อผู้จัด" },
      { status: 400 },
    );
  }

  const raw = data.rawSlip;
  if (!raw?.transRef) {
    return NextResponse.json(
      { error: "ไม่พบเลขอ้างอิงในสลิป — ลองใช้รูปชัดขึ้น" },
      { status: 400 },
    );
  }

  const slipAmount =
    typeof raw.amount?.amount === "number"
      ? raw.amount.amount
      : typeof data.amountInSlip === "number"
        ? data.amountInSlip
        : NaN;

  const amountOk =
    typeof data.isAmountMatched === "boolean"
      ? data.isAmountMatched
      : Math.abs(Number(slipAmount) - expectedAmount) < 0.01;

  if (!amountOk) {
    return NextResponse.json(
      {
        error: `จำนวนเงินในสลิปไม่ตรงกับยอดจอง (ต้อง ฿${expectedAmount.toLocaleString("th-TH")})`,
      },
      { status: 400 },
    );
  }

  if (!slipReceiverMatchesPromptPayId(raw, payoutId)) {
    return NextResponse.json(
      {
        error:
          "บัญชีผู้รับในสลิปไม่ตรงกับเลขพร้อมเพย์ที่ผู้จัดตั้งไว้ — ตรวจสอบว่าโอนเข้าเลขที่ถูกต้อง",
      },
      { status: 400 },
    );
  }

  const usedElsewhere = await db.booking.findFirst({
    where: {
      slipTransRef: raw.transRef,
      NOT: { id: booking.id },
    },
    select: { id: true },
  });
  if (usedElsewhere) {
    return NextResponse.json(
      { error: "สลิปนี้ถูกใช้ยืนยันการจองอื่นแล้ว" },
      { status: 400 },
    );
  }

  const paidAt = new Date();

  await db.$transaction([
    db.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CONFIRMED,
        paidAt,
        slipTransRef: raw.transRef,
        slipVerifiedAt: paidAt,
      },
    }),
    db.notification.create({
      data: {
        userId: booking.trip.organizerId,
        kind: "BOOKING_PAID",
        title: "มีผู้จองชำระเงินแล้ว",
        message: `${booking.participantName} ชำระทริป "${booking.trip.title}" เรียบร้อย`,
        href: `/organizer/trips/${booking.tripId}`,
      },
    }),
  ]);

  revalidatePath(`/bookings/${viewToken}`);
  revalidatePath(`/trips/${booking.tripId}`);
  revalidatePath("/trips");
  revalidatePath(`/organizer/trips/${booking.tripId}`);
  revalidatePath("/organizer/trips");
  revalidatePath("/organizer");
  revalidatePath("/organizer/notifications");
  revalidatePath("/organizer", "layout");

  return NextResponse.json({ ok: true });
}
