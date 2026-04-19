import { BookingStatus, TripStatus, type Trip } from "@prisma/client";
import { PAYMENT_MINUTES } from "@/lib/constants";
import { db } from "@/lib/db";

export function paymentDeadlineFromNow() {
  return new Date(Date.now() + PAYMENT_MINUTES * 60 * 1000);
}

export async function expireStaleBookingsForTrip(tripId: string) {
  const now = new Date();
  await db.booking.updateMany({
    where: {
      tripId,
      status: BookingStatus.PENDING_PAYMENT,
      expiresAt: { lt: now },
    },
    data: { status: BookingStatus.EXPIRED },
  });
}

export async function expireStaleBookingsGlobal() {
  const now = new Date();
  await db.booking.updateMany({
    where: {
      status: BookingStatus.PENDING_PAYMENT,
      expiresAt: { lt: now },
    },
    data: { status: BookingStatus.EXPIRED },
  });
}

/** นับที่ถูกจองแล้ว (รอชำระที่ยังไม่หมดเวลา + ชำระแล้ว) */
export async function countActiveSeats(tripId: string) {
  await expireStaleBookingsForTrip(tripId);
  const now = new Date();
  return db.booking.count({
    where: {
      tripId,
      OR: [
        { status: BookingStatus.CONFIRMED },
        {
          status: BookingStatus.PENDING_PAYMENT,
          expiresAt: { gte: now },
        },
      ],
    },
  });
}

export function tripAcceptsBookings(trip: Trip) {
  if (trip.status !== TripStatus.PUBLISHED) {
    return { ok: false, reason: "ทริปนี้ยังไม่เปิดรับจองหรือปิดรับแล้ว" as const };
  }
  if (trip.bookingClosesAt && trip.bookingClosesAt < new Date()) {
    return { ok: false, reason: "เลยกำหนดปิดรับจองแล้ว" as const };
  }
  return { ok: true as const };
}

export async function spotsLeft(trip: Trip) {
  const used = await countActiveSeats(trip.id);
  return Math.max(0, trip.maxParticipants - used);
}

export { PAYMENT_MINUTES } from "@/lib/constants";
