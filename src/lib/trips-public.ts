import { TripStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { countActiveSeats, expireStaleBookingsGlobal } from "@/lib/bookings";

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
  return { trip, spotsLeft };
}
