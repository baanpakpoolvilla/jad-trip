import { TripStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { countActiveSeats, expireStaleBookingsGlobal } from "@/lib/bookings";
import { assignUniqueShareCodeForTrip } from "@/lib/trip-share-code";

/** ลิงก์สาธารณะรายการทริปของผู้จัดหนึ่งคน — แชร์ให้ผู้จอง (ไม่มีแดชบอร์ด) */
export function organizerTripsBrochurePath(organizerUserId: string) {
  const o = encodeURIComponent(organizerUserId.trim());
  return `/trips?o=${o}`;
}

/** ลิงก์ย่อรายการทริปผู้จัด — redirect ไป `organizerTripsBrochurePath` */
export function organizerBrochureShortPath(brochureShareCode: string) {
  const c = brochureShareCode.trim().toLowerCase();
  return `/o/${c}`;
}

/** โปรไฟล์ผู้จัดแบบสาธารณะ (ไม่มีอีเมล/เบอร์/ข้อมูลรับเงิน) */
export function organizerPublicProfilePath(brochureShareCode: string) {
  return `${organizerBrochureShortPath(brochureShareCode)}/profile`;
}

export type PublicOrganizerProfile = {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string | null;
  isGuide: boolean;
  socialWebsite: string | null;
  socialLine: string | null;
  socialFacebook: string | null;
  socialInstagram: string | null;
  socialTiktok: string | null;
  socialYoutube: string | null;
  socialX: string | null;
};

/** โหลดข้อมูลโปรไฟล์สาธารณะจากรหัสย่อ 8 ตัว — ไม่พบรหัสหรือไม่มีผู้ใช้จะได้ `null` */
export async function getPublicOrganizerProfileByBrochureShareCode(
  shareCode: string,
): Promise<PublicOrganizerProfile | null> {
  const normalized = shareCode.trim().toLowerCase();
  if (!/^[a-z0-9]{8}$/.test(normalized)) return null;

  const user = await db.user.findFirst({
    where: { brochureShareCode: normalized },
    select: {
      id: true,
      name: true,
      bio: true,
      avatarUrl: true,
      isGuide: true,
      socialWebsite: true,
      socialLine: true,
      socialFacebook: true,
      socialInstagram: true,
      socialTiktok: true,
      socialYoutube: true,
      socialX: true,
    },
  });
  return user ?? null;
}

/** หา organizer id จากรหัสย่อ (เฉพาะผู้จัดที่มีรหัส) */
export async function getOrganizerIdByBrochureShareCode(shareCode: string): Promise<string | null> {
  const normalized = shareCode.trim().toLowerCase();
  if (!/^[a-z0-9]{8}$/.test(normalized)) return null;

  const user = await db.user.findFirst({
    where: { brochureShareCode: normalized },
    select: { id: true },
  });
  return user?.id ?? null;
}

/** ลิงก์แชร์รายการทริปจากข้อมูล organizer — ใช้ `/o/…` ถ้ามีรหัสย่อแล้ว */
export function organizerPublicBrochureHrefFromOrganizer(organizer: {
  id: string;
  brochureShareCode: string | null;
}): string {
  if (organizer.brochureShareCode?.trim()) {
    return organizerBrochureShortPath(organizer.brochureShareCode);
  }
  return organizerTripsBrochurePath(organizer.id);
}

export async function getOrganizerBrochureHost(
  organizerUserId: string,
): Promise<{ id: string; name: string } | null> {
  const id = organizerUserId.trim();
  if (!id) return null;
  const user = await db.user.findFirst({
    where: { id },
    select: { id: true, name: true },
  });
  return user ? { id: user.id, name: user.name } : null;
}

/** รหัสย่อ `/o/…` ถ้ามี — ใช้สร้างลิงก์โปรไฟล์สาธารณะ */
export async function getOrganizerBrochureShareCodeById(
  organizerUserId: string,
): Promise<string | null> {
  const id = organizerUserId.trim();
  if (!id) return null;
  const user = await db.user.findFirst({
    where: { id },
    select: { brochureShareCode: true },
  });
  const c = user?.brochureShareCode?.trim().toLowerCase();
  return c && /^[a-z0-9]{8}$/.test(c) ? c : null;
}

/** ทริป PUBLISHED ของผู้จัด — แสดงในหน้า /trips?o=… สำหรับผู้จอง */
export type PublicOrganizerBrochureTrip = {
  id: string;
  title: string;
  shortDescription: string;
  startAt: Date;
  endAt: Date;
  pricePerPerson: number;
  coverImageUrl: string | null;
  spotsLeft: number;
};

export async function listPublishedTripsForOrganizerBrochure(
  organizerUserId: string,
): Promise<PublicOrganizerBrochureTrip[]> {
  await expireStaleBookingsGlobal();
  const now = new Date();
  const organizerId = organizerUserId.trim();
  if (!organizerId) return [];

  const host = await getOrganizerBrochureHost(organizerId);
  if (!host) return [];

  const trips = await db.trip.findMany({
    where: {
      organizerId,
      status: TripStatus.PUBLISHED,
      OR: [{ bookingClosesAt: null }, { bookingClosesAt: { gte: now } }],
    },
    orderBy: { startAt: "asc" },
    select: {
      id: true,
      title: true,
      shortDescription: true,
      startAt: true,
      endAt: true,
      pricePerPerson: true,
      coverImageUrl: true,
      maxParticipants: true,
    },
  });

  const out: PublicOrganizerBrochureTrip[] = [];
  for (const t of trips) {
    const used = await countActiveSeats(t.id);
    const spotsLeft = Math.max(0, t.maxParticipants - used);
    out.push({
      id: t.id,
      title: t.title,
      shortDescription: t.shortDescription,
      startAt: t.startAt,
      endAt: t.endAt,
      pricePerPerson: t.pricePerPerson,
      coverImageUrl: t.coverImageUrl,
      spotsLeft,
    });
  }
  return out;
}

export async function getPublishedTripById(id: string) {
  await expireStaleBookingsGlobal();
  const trip = await db.trip.findFirst({
    where: { id, status: TripStatus.PUBLISHED },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          bio: true,
          avatarUrl: true,
          brochureShareCode: true,
        },
      },
      guide: {
        select: {
          id: true,
          name: true,
          phone: true,
          bio: true,
          avatarUrl: true,
        },
      },
    },
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
