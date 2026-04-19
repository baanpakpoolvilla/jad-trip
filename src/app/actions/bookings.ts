"use server";

import { revalidatePath } from "next/cache";
import { BookingStatus } from "@prisma/client";
import { z } from "zod";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import {
  countActiveSeats,
  paymentDeadlineFromNow,
  spotsLeft,
  tripAcceptsBookings,
} from "@/lib/bookings";

const bookingSchema = z.object({
  tripId: z.string().min(1),
  participantName: z.string().min(2, "กรอกชื่อ"),
  participantEmail: z.string().email("อีเมลไม่ถูกต้อง"),
  participantPhone: z.string().min(8, "กรอกเบอร์โทร"),
});

export type BookingCreateState =
  | { error: string }
  | { ok: true; viewToken: string };

export async function createBooking(
  _prev: BookingCreateState | undefined,
  formData: FormData,
): Promise<BookingCreateState> {
  const raw = {
    tripId: formData.get("tripId"),
    participantName: formData.get("participantName"),
    participantEmail: formData.get("participantEmail"),
    participantPhone: formData.get("participantPhone"),
    acceptTerms: formData.get("acceptTerms"),
  };

  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ครบ" };
  }
  if (raw.acceptTerms !== "on") {
    return { error: "กรุณายอมรับข้อกำหนด" };
  }

  const trip = await db.trip.findUnique({ where: { id: parsed.data.tripId } });
  if (!trip) return { error: "ไม่พบทริป" };

  const gate = tripAcceptsBookings(trip);
  if (!gate.ok) return { error: gate.reason };

  const left = await spotsLeft(trip);
  if (left <= 0) return { error: "ที่นั่งเต็มแล้ว" };

  const viewToken = randomBytes(24).toString("hex");
  const expiresAt = paymentDeadlineFromNow();

  const [booking] = await db.$transaction([
    db.booking.create({
      data: {
        tripId: trip.id,
        participantName: parsed.data.participantName.trim(),
        participantEmail: parsed.data.participantEmail.trim().toLowerCase(),
        participantPhone: parsed.data.participantPhone.trim(),
        viewToken,
        expiresAt,
        status: BookingStatus.PENDING_PAYMENT,
      },
    }),
    db.notification.create({
      data: {
        userId: trip.organizerId,
        kind: "BOOKING_CREATED",
        title: "มีผู้จองทริปใหม่ (รอชำระเงิน)",
        message: `${parsed.data.participantName.trim()} จองทริป "${trip.title}" — รอการชำระเงิน`,
        href: `/organizer/trips/${trip.id}`,
      },
    }),
  ]);

  revalidatePath("/trips");
  revalidatePath(`/trips/${trip.id}`);
  revalidatePath(`/organizer/trips/${trip.id}`);
  revalidatePath("/organizer");
  revalidatePath("/organizer/notifications");
  revalidatePath("/organizer", "layout");

  return { ok: true, viewToken: booking.viewToken };
}

export async function cancelBookingAsParticipant(
  viewToken: string,
): Promise<{ ok: true; tripId: string } | { error: string }> {
  const booking = await db.booking.findUnique({ where: { viewToken } });
  if (!booking) return { error: "ไม่พบการจอง" };
  if (booking.status !== BookingStatus.PENDING_PAYMENT) {
    return { error: "ยกเลิกได้เฉพาะสถานะรอชำระเงิน" };
  }

  await db.booking.update({
    where: { id: booking.id },
    data: { status: BookingStatus.CANCELLED },
  });

  revalidatePath(`/bookings/${viewToken}`);
  revalidatePath(`/trips/${booking.tripId}`);
  revalidatePath(`/organizer/trips/${booking.tripId}`);
  revalidatePath("/organizer");
  return { ok: true, tripId: booking.tripId };
}

export async function getBookingByToken(viewToken: string) {
  const booking = await db.booking.findUnique({
    where: { viewToken },
    include: { trip: { include: { organizer: true } } },
  });
  if (!booking) return null;

  const used = await countActiveSeats(booking.tripId);
  const left = Math.max(0, booking.trip.maxParticipants - used);

  return { booking, spotsLeftDisplay: left };
}
