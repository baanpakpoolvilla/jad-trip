import { TripStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { countActiveSeats, expireStaleBookingsGlobal } from "@/lib/bookings";
import { assignUniqueShareCodeForTrip } from "@/lib/trip-share-code";

export async function listPublishedTripsForPublic() {
  await expireStaleBookingsGlobal();
  const now = new Date();

  const trips = await db.trip.findMany({
    where: { status: TripStatus.PUBLISHED },
    orderBy: { startAt: "asc" },
    include: {
      organizer: { select: { name: true, phone: true } },
    },
  });

  const enriched = [];
  for (const t of trips) {
    if (t.bookingClosesAt && t.bookingClosesAt < now) continue;
    const used = await countActiveSeats(t.id);
    const spotsLeft = Math.max(0, t.maxParticipants - used);
    if (spotsLeft <= 0) continue;
    enriched.push({ ...t, spotsLeft });
  }

  return enriched;
}

export async function getPublishedTripById(id: string) {
  await expireStaleBookingsGlobal();
  const trip = await db.trip.findFirst({
    where: { id, status: TripStatus.PUBLISHED },
    include: { organizer: { select: { name: true, phone: true, email: true } } },
  });
  if (!trip) return null;

  const now = new Date();
  if (trip.bookingClosesAt && trip.bookingClosesAt < now) return null;

  const used = await countActiveSeats(trip.id);
  const spotsLeft = Math.max(0, trip.maxParticipants - used);

  const shareCode =
    trip.shareCode ?? (await assignUniqueShareCodeForTrip(trip.id));

  return { trip: { ...trip, shareCode }, spotsLeft };
}

/** หา id ทริปจากลิงก์ย่อ (ทริปเผยแพร่ + ยังไม่ปิดรับจองตามเวลา — แสดงหน้ารายละเอียดได้แม้ที่นั่งเต็ม) */
export async function getPublishedTripIdByShareCode(shareCode: string) {
  await expireStaleBookingsGlobal();
  const normalized = shareCode.trim().toLowerCase();
  if (!normalized || normalized.length > 32) return null;

  const trip = await db.trip.findFirst({
    where: { shareCode: normalized, status: TripStatus.PUBLISHED },
  });
  if (!trip) return null;

  const now = new Date();
  if (trip.bookingClosesAt && trip.bookingClosesAt < now) return null;

  return trip.id;
}
