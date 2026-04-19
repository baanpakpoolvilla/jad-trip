import { NextResponse } from "next/server";
import { BookingStatus } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

const bodySchema = z.object({
  viewToken: z.string().min(16),
});

export async function POST(request: Request) {
  let stripe;
  try {
    stripe = getStripe();
  } catch {
    return NextResponse.json(
      { error: "ระบบยังไม่ได้ตั้งค่า Stripe (STRIPE_SECRET_KEY)" },
      { status: 503 },
    );
  }

  const json = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "คำขอไม่ถูกต้อง" }, { status: 400 });
  }

  const booking = await db.booking.findUnique({
    where: { viewToken: parsed.data.viewToken },
    include: { trip: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "ไม่พบการจอง" }, { status: 404 });
  }

  if (booking.status !== BookingStatus.PENDING_PAYMENT) {
    return NextResponse.json(
      { error: "การจองนี้ชำระเงินแล้วหรือไม่สามารถชำระได้" },
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

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "thb",
          unit_amount: booking.trip.pricePerPerson * 100,
          product_data: {
            name: booking.trip.title,
            description: `ทริป ${booking.trip.title} — 1 ที่`,
          },
        },
      },
    ],
    success_url: `${baseUrl}/bookings/${booking.viewToken}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/bookings/${booking.viewToken}?cancelled=1`,
    metadata: { bookingId: booking.id },
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "สร้างลิงก์ชำระเงินไม่สำเร็จ" },
      { status: 500 },
    );
  }

  await db.booking.update({
    where: { id: booking.id },
    data: { stripeSessionId: session.id },
  });

  return NextResponse.json({ url: session.url });
}
