"use server";

import { revalidatePath } from "next/cache";
import { TripStatus } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { parseBangkokDateTimeLocal } from "@/lib/datetime";
import { countActiveSeats } from "@/lib/bookings";
import { assignUniqueShareCodeForTrip } from "@/lib/trip-share-code";

const trim = (s: unknown) => (typeof s === "string" ? s : "").trim();

const tripFormSchema = z.object({
  title: z.string().min(2, "กรอกชื่อทริป"),
  shortDescription: z.string().min(1, "กรอกคำอธิบายสั้น"),
  description: z.string().min(1, "กรอกรายละเอียด"),
  meetPoint: z.string().min(1, "กรอกจุดนัดพบ"),
  startAt: z.string().min(1),
  endAt: z.string().min(1),
  maxParticipants: z.coerce.number().int().min(1).max(500),
  pricePerPerson: z.coerce.number().int().min(0),
  bookingClosesAt: z.string().optional(),
  policyNotes: z.string().optional(),
  groupUrl: z.string().optional(),
  coverImageUrl: z.string().optional(),
  galleryImageUrls: z.string().optional(),
  guideDetails: z.string().optional(),
  itinerary: z.string().optional(),
  travelNotes: z.string().optional(),
  highlights: z.string().optional(),
  packingList: z.string().optional(),
  safetyNotes: z.string().optional(),
  guideProvides: z.string().optional(),
  departureOptions: z.string().optional(),
  guideUserId: z.string().optional(),
  destinationName: z.string().optional(),
  destinationLat: z.string().optional(),
  destinationLng: z.string().optional(),
  meetPointLat: z.string().optional(),
  meetPointLng: z.string().optional(),
  intent: z.enum(["draft", "publish"]),
});

function parseTripForm(formData: FormData) {
  return tripFormSchema.safeParse({
    title: formData.get("title"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    meetPoint: formData.get("meetPoint"),
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
    maxParticipants: formData.get("maxParticipants"),
    pricePerPerson: formData.get("pricePerPerson"),
    bookingClosesAt: formData.get("bookingClosesAt")?.toString() ?? "",
    policyNotes: formData.get("policyNotes")?.toString() ?? "",
    groupUrl: formData.get("groupUrl")?.toString() ?? "",
    coverImageUrl: formData.get("coverImageUrl")?.toString() ?? "",
    galleryImageUrls: formData.get("galleryImageUrls")?.toString() ?? "",
    guideDetails: formData.get("guideDetails")?.toString() ?? "",
    itinerary: formData.get("itinerary")?.toString() ?? "",
    travelNotes: formData.get("travelNotes")?.toString() ?? "",
    highlights: formData.get("highlights")?.toString() ?? "",
    packingList: formData.get("packingList")?.toString() ?? "",
    safetyNotes: formData.get("safetyNotes")?.toString() ?? "",
    guideProvides: formData.get("guideProvides")?.toString() ?? "",
    departureOptions: formData.get("departureOptions")?.toString() ?? "",
    guideUserId: formData.get("guideUserId")?.toString() ?? "",
    destinationName: formData.get("destinationName")?.toString() ?? "",
    destinationLat: formData.get("destinationLat")?.toString() ?? "",
    destinationLng: formData.get("destinationLng")?.toString() ?? "",
    meetPointLat: formData.get("meetPointLat")?.toString() ?? "",
    meetPointLng: formData.get("meetPointLng")?.toString() ?? "",
    intent: formData.get("intent") === "publish" ? "publish" : "draft",
  });
}

function parseDestinationFromParsed(v: z.infer<typeof tripFormSchema>):
  | { ok: true; destinationName: string; destinationLat: number | null; destinationLng: number | null }
  | { ok: false; error: string } {
  const name = trim(v.destinationName);
  const latS = trim(v.destinationLat);
  const lngS = trim(v.destinationLng);
  if (!latS && !lngS) {
    return { ok: true, destinationName: name, destinationLat: null, destinationLng: null };
  }
  if (!latS || !lngS) {
    return { ok: false, error: "พิกัดจุดหมายไม่ครบ — ล้างจุดหมายแล้วเลือกใหม่ หรือปล่อยว่าง" };
  }
  const lat = Number(latS);
  const lng = Number(lngS);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return { ok: false, error: "พิกัดจุดหมายไม่ถูกต้อง" };
  }
  return {
    ok: true,
    destinationName: name || "สถานที่บนแผนที่",
    destinationLat: lat,
    destinationLng: lng,
  };
}

function parseMeetPointCoords(v: z.infer<typeof tripFormSchema>):
  | { ok: true; meetPointLat: number | null; meetPointLng: number | null }
  | { ok: false; error: string } {
  const latS = trim(v.meetPointLat);
  const lngS = trim(v.meetPointLng);
  if (!latS && !lngS) {
    return { ok: true, meetPointLat: null, meetPointLng: null };
  }
  if (!latS || !lngS) {
    return { ok: false, error: "พิกัดจุดนัดพบไม่ครบ — ล้างแผนที่แล้วเลือกใหม่ หรือปล่อยว่าง" };
  }
  const lat = Number(latS);
  const lng = Number(lngS);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return { ok: false, error: "พิกัดจุดนัดพบไม่ถูกต้อง" };
  }
  return { ok: true, meetPointLat: lat, meetPointLng: lng };
}

function tripRichContentFromParsed(v: z.infer<typeof tripFormSchema>) {
  const cover = trim(v.coverImageUrl);
  return {
    coverImageUrl: cover.length ? cover : null,
    galleryImageUrls: trim(v.galleryImageUrls),
    guideDetails: trim(v.guideDetails),
    itinerary: trim(v.itinerary),
    travelNotes: trim(v.travelNotes),
    highlights: trim(v.highlights),
    packingList: trim(v.packingList),
    safetyNotes: trim(v.safetyNotes),
    guideProvides: trim(v.guideProvides),
    departureOptions: trim(v.departureOptions),
  };
}

async function resolveGuideUserId(
  raw: string,
  /** เมื่อแก้ไขทริป — ยังยอมรับไกด์เดิมได้แม้ผู้ใช้ปิดโหมดไกด์ในภายหลัง */
  grandfatheredUserId: string | null,
): Promise<{ ok: true; id: string | null } | { ok: false; error: string }> {
  const id = trim(raw);
  if (!id.length) return { ok: true, id: null };
  const u = await db.user.findFirst({
    where: { id },
    select: { id: true, isGuide: true },
  });
  if (!u) {
    return { ok: false, error: "ไม่พบผู้ใช้รหัสนี้ในระบบ" };
  }
  if (u.isGuide) return { ok: true, id: u.id };
  if (grandfatheredUserId && u.id === grandfatheredUserId) {
    return { ok: true, id: u.id };
  }
  return {
    ok: false,
    error: "ผู้ใช้นี้ยังไม่เปิดโหมดไกด์ในหน้าโปรไฟล์ — ให้ไกด์ติ๊กถูกที่ «ลงทะเบียนเป็นไกด์» ก่อน",
  };
}

export type TripActionState = { error?: string } | { ok: true };

export async function createTrip(
  _prev: TripActionState,
  formData: FormData,
): Promise<TripActionState> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ORGANIZER") {
    return { error: "ไม่มีสิทธิ์" };
  }

  const parsed = parseTripForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const v = parsed.data;
  const startAt = parseBangkokDateTimeLocal(v.startAt);
  const endAt = parseBangkokDateTimeLocal(v.endAt);
  if (!startAt || !endAt) return { error: "รูปแบบวันเวลาไม่ถูกต้อง" };
  if (endAt <= startAt) return { error: "เวลาสิ้นสุดต้องหลังเวลาเริ่ม" };

  let bookingClosesAt: Date | null = null;
  if (v.bookingClosesAt?.trim()) {
    const b = parseBangkokDateTimeLocal(v.bookingClosesAt.trim());
    if (!b) return { error: "รูปแบบวันปิดรับจองไม่ถูกต้อง" };
    bookingClosesAt = b;
  }

  const status =
    v.intent === "publish" ? TripStatus.PUBLISHED : TripStatus.DRAFT;

  const rich = tripRichContentFromParsed(v);
  const guideResolved = await resolveGuideUserId(trim(v.guideUserId), null);
  if (!guideResolved.ok) return { error: guideResolved.error };

  const dest = parseDestinationFromParsed(v);
  if (!dest.ok) return { error: dest.error };

  const meetCoords = parseMeetPointCoords(v);
  if (!meetCoords.ok) return { error: meetCoords.error };

  const created = await db.trip.create({
    data: {
      organizerId: session.user.id,
      title: v.title.trim(),
      shortDescription: v.shortDescription.trim(),
      description: v.description.trim(),
      meetPoint: v.meetPoint.trim(),
      meetPointLat: meetCoords.meetPointLat,
      meetPointLng: meetCoords.meetPointLng,
      destinationName: dest.destinationName,
      destinationLat: dest.destinationLat,
      destinationLng: dest.destinationLng,
      startAt,
      endAt,
      maxParticipants: v.maxParticipants,
      pricePerPerson: v.pricePerPerson,
      bookingClosesAt,
      policyNotes: (v.policyNotes ?? "").trim(),
      groupUrl: (v.groupUrl ?? "").trim() || null,
      ...rich,
      status,
      guideUserId: guideResolved.id,
    },
  });

  await assignUniqueShareCodeForTrip(created.id);

  revalidatePath("/organizer/trips");
  revalidatePath("/organizer");
  revalidatePath("/trips");
  return { ok: true };
}

export async function updateTrip(
  tripId: string,
  _prev: TripActionState,
  formData: FormData,
): Promise<TripActionState> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ORGANIZER") {
    return { error: "ไม่มีสิทธิ์" };
  }

  const trip = await db.trip.findFirst({
    where: { id: tripId, organizerId: session.user.id },
    include: { _count: { select: { bookings: true } } },
  });
  if (!trip) return { error: "ไม่พบทริป" };

  const parsed = parseTripForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const v = parsed.data;
  const startAt = parseBangkokDateTimeLocal(v.startAt);
  const endAt = parseBangkokDateTimeLocal(v.endAt);
  if (!startAt || !endAt) return { error: "รูปแบบวันเวลาไม่ถูกต้อง" };
  if (endAt <= startAt) return { error: "เวลาสิ้นสุดต้องหลังเวลาเริ่ม" };

  let bookingClosesAt: Date | null = null;
  if (v.bookingClosesAt?.trim()) {
    const b = parseBangkokDateTimeLocal(v.bookingClosesAt.trim());
    if (!b) return { error: "รูปแบบวันปิดรับจองไม่ถูกต้อง" };
    bookingClosesAt = b;
  }

  const guideResolved = await resolveGuideUserId(
    trim(v.guideUserId),
    trip.guideUserId,
  );
  if (!guideResolved.ok) return { error: guideResolved.error };

  const dest = parseDestinationFromParsed(v);
  if (!dest.ok) return { error: dest.error };

  const meetCoords = parseMeetPointCoords(v);
  if (!meetCoords.ok) return { error: meetCoords.error };

  const hasBookings = trip._count.bookings > 0;
  const isPublished = trip.status === TripStatus.PUBLISHED;
  const rich = tripRichContentFromParsed(v);

  if (hasBookings && isPublished) {
    await db.trip.update({
      where: { id: tripId },
      data: {
        shortDescription: v.shortDescription.trim(),
        description: v.description.trim(),
        meetPoint: v.meetPoint.trim(),
        meetPointLat: meetCoords.meetPointLat,
        meetPointLng: meetCoords.meetPointLng,
        destinationName: dest.destinationName,
        destinationLat: dest.destinationLat,
        destinationLng: dest.destinationLng,
        policyNotes: (v.policyNotes ?? "").trim(),
        groupUrl: (v.groupUrl ?? "").trim() || null,
        ...rich,
        guideUserId: guideResolved.id,
      },
    });
  } else {
    const nextStatus =
      v.intent === "publish" ? TripStatus.PUBLISHED : TripStatus.DRAFT;
    await db.trip.update({
      where: { id: tripId },
      data: {
        title: v.title.trim(),
        shortDescription: v.shortDescription.trim(),
        description: v.description.trim(),
        meetPoint: v.meetPoint.trim(),
        meetPointLat: meetCoords.meetPointLat,
        meetPointLng: meetCoords.meetPointLng,
        destinationName: dest.destinationName,
        destinationLat: dest.destinationLat,
        destinationLng: dest.destinationLng,
        startAt,
        endAt,
        maxParticipants: v.maxParticipants,
        pricePerPerson: v.pricePerPerson,
        bookingClosesAt,
        policyNotes: (v.policyNotes ?? "").trim(),
        groupUrl: (v.groupUrl ?? "").trim() || null,
        ...rich,
        status: nextStatus,
        guideUserId: guideResolved.id,
      },
    });
  }

  revalidatePath("/organizer/trips");
  revalidatePath("/organizer");
  revalidatePath(`/organizer/trips/${tripId}`);
  revalidatePath("/trips");
  revalidatePath(`/trips/${tripId}`);
  if (!trip.shareCode) {
    await assignUniqueShareCodeForTrip(tripId);
  }
  return { ok: true };
}

export async function setTripStatus(
  tripId: string,
  status: TripStatus,
): Promise<TripActionState> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ORGANIZER") {
    return { error: "ไม่มีสิทธิ์" };
  }

  const trip = await db.trip.findFirst({
    where: { id: tripId, organizerId: session.user.id },
  });
  if (!trip) return { error: "ไม่พบทริป" };

  if (
    status !== TripStatus.CLOSED &&
    status !== TripStatus.CANCELLED &&
    status !== TripStatus.PUBLISHED
  ) {
    return { error: "สถานะไม่รองรับ" };
  }

  await db.trip.update({
    where: { id: tripId },
    data: { status },
  });

  if (!trip.shareCode) {
    await assignUniqueShareCodeForTrip(tripId);
  }

  revalidatePath("/organizer/trips");
  revalidatePath("/organizer");
  revalidatePath(`/organizer/trips/${tripId}`);
  revalidatePath("/trips");
  revalidatePath(`/trips/${tripId}`);
  return { ok: true };
}

export async function cancelBookingAsOrganizerForm(formData: FormData) {
  const bookingId = formData.get("bookingId")?.toString();
  if (!bookingId) return;
  await cancelBookingAsOrganizer(bookingId);
}

export async function cancelBookingAsOrganizer(
  bookingId: string,
): Promise<TripActionState> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ORGANIZER") {
    return { error: "ไม่มีสิทธิ์" };
  }

  const booking = await db.booking.findFirst({
    where: { id: bookingId, trip: { organizerId: session.user.id } },
  });
  if (!booking) return { error: "ไม่พบการจอง" };

  await db.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  revalidatePath(`/organizer/trips/${booking.tripId}`);
  revalidatePath("/organizer");
  revalidatePath(`/trips/${booking.tripId}`);
  revalidatePath(`/bookings/${booking.viewToken}`);
  return { ok: true };
}

export async function getTripForOrganizer(tripId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ORGANIZER") return null;
  const now = new Date();

  return db.trip.findFirst({
    where: { id: tripId, organizerId: session.user.id },
    include: {
      bookings: {
        where: {
          OR: [
            { status: "CONFIRMED" },
            { status: "PENDING_PAYMENT", expiresAt: { gte: now } },
          ],
        },
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      },
    },
  });
}

export async function countConfirmedForTrip(tripId: string) {
  return db.booking.count({
    where: { tripId, status: "CONFIRMED" },
  });
}

export async function getTripEditDefaults(tripId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ORGANIZER") return null;

  const trip = await db.trip.findFirst({
    where: { id: tripId, organizerId: session.user.id },
    include: {
      _count: { select: { bookings: true } },
      organizer: { select: { id: true, name: true, bio: true, avatarUrl: true } },
      guide: {
        select: { id: true, name: true, bio: true, avatarUrl: true, email: true },
      },
    },
  });
  if (!trip) return null;

  const used = await countActiveSeats(trip.id);
  return { trip, used, hasBookings: trip._count.bookings > 0 };
}
