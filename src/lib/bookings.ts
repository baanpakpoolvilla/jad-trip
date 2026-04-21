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

/**
 * Expire bookings globally — throttled to at most once per 60 s per process instance.
 * ป้องกัน write query ซ้ำซ้อนเมื่อหลาย request เข้าพร้อมกัน
 */
let _lastGlobalExpire = 0;
const GLOBAL_EXPIRE_INTERVAL_MS = 60_000;

export async function expireStaleBookingsGlobal() {
  const now = Date.now();
  if (now - _lastGlobalExpire < GLOBAL_EXPIRE_INTERVAL_MS) return;
  _lastGlobalExpire = now;

  await db.booking.updateMany({
    where: {
      status: BookingStatus.PENDING_PAYMENT,
      expiresAt: { lt: new Date(now) },
    },
    data: { status: BookingStatus.EXPIRED },
  });
}

/** นับที่นั่งที่ใช้งานอยู่ (รอชำระที่ยังไม่หมดเวลา + ชำระแล้ว) พร้อม expire per-trip */
export async function countActiveSeats(tripId: string) {
  await expireStaleBookingsForTrip(tripId);
  const now = new Date();
  return db.booking.count({
    where: {
      tripId,
      OR: [
        { status: BookingStatus.CONFIRMED },
        { status: BookingStatus.PENDING_PAYMENT, expiresAt: { gte: now } },
      ],
    },
  });
}

/**
 * นับที่นั่งโดยไม่ expire (ใช้หลังจาก expireStaleBookingsGlobal ทำงานแล้ว)
 * ลด DB call ใน batch operations
 */
export async function countActiveSeatsNoExpire(tripId: string, now: Date) {
  return db.booking.count({
    where: {
      tripId,
      OR: [
        { status: BookingStatus.CONFIRMED },
        { status: BookingStatus.PENDING_PAYMENT, expiresAt: { gte: now } },
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
