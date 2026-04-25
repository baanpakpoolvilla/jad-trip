import Link from "next/link";
import { redirect } from "next/navigation";
import { BookingStatus, TripStatus } from "@prisma/client";
import { Bell, CreditCard, PlusCircle, UserRound } from "lucide-react";
import { safeAuth, getOrganizerUser } from "@/lib/auth-session";
import { db } from "@/lib/db";
import { formatBangkok } from "@/lib/datetime";
import { OrganizerBrochureLinkCopy } from "@/components/organizer-brochure-link-copy";
import { organizerBrochureShortPath } from "@/lib/trips-public";

export const dynamic = "force-dynamic";

function tripStatusBadge(status: TripStatus) {
  switch (status) {
    case TripStatus.PUBLISHED:
      return <span className="jad-badge-success">เปิดรับ</span>;
    case TripStatus.DRAFT:
      return <span className="jad-badge-neutral">ร่าง</span>;
    case TripStatus.CLOSED:
      return <span className="jad-badge-warning">ปิดรับ</span>;
    case TripStatus.CANCELLED:
      return <span className="jad-badge-danger">ยกเลิก</span>;
    default:
      return <span className="jad-badge-neutral">{status}</span>;
  }
}

function countByStatus<T extends string>(
  rows: { status: T; _count: { _all: number } }[],
  status: T,
): number {
  return rows.find((r) => r.status === status)?._count._all ?? 0;
}

export default async function OrganizerDashboardPage() {
  const session = await safeAuth(); // cached — reuses layout's auth result
  if (!session?.user?.id) redirect("/login");

  const organizerId = session.user.id;
  const now = new Date();

  // รวมทุก query เข้า Promise.all เดียว:
  // เดิม: Promise.all([..., tripIds, ...]) → bookingGroups (2 round-trips แบบ sequential)
  // ใหม่: raw SQL join Trip+Booking ทำให้ bookingGroups อยู่ใน round-trip เดียวกัน
  // userRow ใช้ cache เดียวกับ layout — ไม่มี DB hit เพิ่ม
  const [tripGroups, bookingGroups, upcomingTrips, recentTrips, userRow] = await Promise.all([
    db.trip.groupBy({
      by: ["status"],
      where: { organizerId },
      _count: { _all: true },
    }),
    db.$queryRaw<{ status: string; count: bigint }[]>`
      SELECT b.status, COUNT(*) AS count
      FROM "Booking" b
      INNER JOIN "Trip" t ON b."tripId" = t.id
      WHERE t."organizerId" = ${organizerId}
        AND (
          b.status = 'CONFIRMED'
          OR (b.status = 'PENDING_PAYMENT' AND b."expiresAt" >= ${now})
        )
      GROUP BY b.status
    `,
    db.trip.findMany({
      where: {
        organizerId,
        status: TripStatus.PUBLISHED,
        startAt: { gte: now },
      },
      orderBy: { startAt: "asc" },
      take: 4,
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                OR: [
                  { status: BookingStatus.CONFIRMED },
                  { status: BookingStatus.PENDING_PAYMENT, expiresAt: { gte: now } },
                ],
              },
            },
          },
        },
      },
    }),
    db.trip.findMany({
      where: { organizerId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { _count: { select: { bookings: true } } },
    }),
    getOrganizerUser(organizerId), // cached — reuses layout's DB result
  ]);

  const totalTrips = tripGroups.reduce((s, g) => s + g._count._all, 0);
  const published = countByStatus(tripGroups, TripStatus.PUBLISHED);
  const drafts = countByStatus(tripGroups, TripStatus.DRAFT);
  const confirmed = Number(bookingGroups.find((r) => r.status === BookingStatus.CONFIRMED)?.count ?? 0);
  const pendingPay = Number(bookingGroups.find((r) => r.status === BookingStatus.PENDING_PAYMENT)?.count ?? 0);
  const activeBookings = pendingPay + confirmed;

  const displayName = session.user.name?.trim() || "ผู้จัด";
  const brochureShareCode = userRow?.brochureShareCode ?? "";
  const brochureShortPath = organizerBrochureShortPath(brochureShareCode);
  const appBaseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");

  return (
    <div className="space-y-5 sm:space-y-8">
      <header className="jad-page-header">
        <p className="jad-section-label">ผู้จัด</p>
        <h1 className="jad-page-title">แดชบอร์ด</h1>
        <p className="text-sm text-fg-muted">
          สวัสดี {displayName} — สรุปทริปและการจองของคุณ
        </p>
      </header>

      <section className="jad-card space-y-1.5 border-brand/20 bg-brand-light/40 py-3 sm:space-y-2 sm:py-3">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <h2 className="text-sm font-semibold text-brand">ลิงก์แชร์รายการทริป</h2>
          <Link
            href={brochureShortPath}
            prefetch={false}
            className="text-xs font-medium text-brand hover:text-brand-mid sm:text-sm"
          >
            เปิดหน้าลูกค้า →
          </Link>
        </div>
        <p className="text-[11px] leading-snug text-fg-muted">สาธารณะ · ไม่มีเมนูแดชบอร์ด · แชร์ไลน์/โพสต์ได้</p>
        <OrganizerBrochureLinkCopy brochureShortPath={brochureShortPath} appBaseUrl={appBaseUrl} />
        <p className="text-[11px] leading-snug text-fg-muted">
          โปรไฟล์สาธารณะ (ชื่อ รูป แนะนำตัว — ไม่มีอีเมล/เบอร์):{" "}
          <Link
            href={`${brochureShortPath}/profile`}
            prefetch={false}
            className="font-medium text-brand hover:text-brand-mid hover:underline"
          >
            เปิดหน้าโปรไฟล์ →
          </Link>
        </p>
      </section>

      <div className="space-y-1.5 sm:space-y-2">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
          {[
            { label: "ทริปทั้งหมด", value: totalTrips, href: "/organizer/trips" },
            { label: "เปิดรับจอง", value: published, href: "/organizer/trips" },
            { label: "ร่าง", value: drafts, href: "/organizer/trips" },
          ].map((c) => (
            <Link
              key={c.label}
              href={c.href}
              prefetch={false}
              className="jad-card-interactive block transition-colors"
            >
              <p className="text-xs text-fg-muted sm:text-sm">{c.label}</p>
              <p className="mt-1.5 text-2xl font-semibold tabular-nums text-fg sm:mt-2 sm:text-3xl">{c.value}</p>
            </Link>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-3">
          {[
            { label: "จองที่ active", value: activeBookings, href: "/organizer/trips", highlight: activeBookings > 0 },
            { label: "ยืนยันแล้ว", value: confirmed, href: "/organizer/trips", highlight: false },
          ].map((c) => (
            <Link
              key={c.label}
              href={c.href}
              prefetch={false}
              className="jad-card-interactive block transition-colors"
            >
              <p className="text-xs text-fg-muted sm:text-sm">{c.label}</p>
              <p className={`mt-1.5 text-2xl font-semibold tabular-nums sm:mt-2 sm:text-3xl ${c.highlight ? "text-brand" : "text-fg"}`}>
                {c.value}
              </p>
            </Link>
          ))}
        </div>
        <p className="text-[11px] text-fg-hint">&quot;จองที่ active&quot; = รอชำระ + ยืนยันแล้ว</p>
      </div>

      <section className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
        <Link
          href="/organizer/trips/new"
          prefetch={false}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-2 text-center text-[13px] font-medium leading-tight text-fg shadow-sm transition-colors hover:border-brand/35 hover:bg-brand-light/60 sm:min-h-0 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <PlusCircle className="size-4 shrink-0 text-brand" strokeWidth={1.5} aria-hidden />
          <span className="leading-tight">สร้างทริปใหม่</span>
        </Link>
        <Link
          href="/organizer/payments"
          prefetch={false}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-2 text-center text-[13px] font-medium leading-tight text-fg shadow-sm transition-colors hover:border-brand/35 hover:bg-brand-light/60 sm:min-h-0 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <CreditCard className="size-4 shrink-0 text-brand" strokeWidth={1.5} aria-hidden />
          รับเงิน
        </Link>
        <Link
          href="/organizer/notifications"
          prefetch={false}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-2 text-center text-[13px] font-medium leading-tight text-fg shadow-sm transition-colors hover:border-brand/35 hover:bg-brand-light/60 sm:min-h-0 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <Bell className="size-4 shrink-0 text-brand" strokeWidth={1.5} aria-hidden />
          แจ้งเตือน
        </Link>
        <Link
          href="/organizer/profile"
          prefetch={false}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-2 text-center text-[13px] font-medium leading-tight text-fg shadow-sm transition-colors hover:border-brand/35 hover:bg-brand-light/60 sm:min-h-0 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <UserRound className="size-4 shrink-0 text-brand" strokeWidth={1.5} aria-hidden />
          โปรไฟล์
        </Link>
      </section>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-2">
            <h2 className="text-lg font-semibold text-fg">ทริปที่กำลังจะถึง</h2>
            <Link href="/organizer/trips" prefetch={false} className="text-sm font-medium text-brand hover:underline">
              ดูทั้งหมด
            </Link>
          </div>
          {upcomingTrips.length === 0 ? (
            <p className="text-sm text-fg-muted">
              ยังไม่มีทริปสถานะเปิดรับที่วันที่เริ่มอยู่ข้างหน้า —{" "}
              <Link href="/organizer/trips/new" prefetch={false} className="font-medium text-brand hover:underline">
                สร้างทริป
              </Link>
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              {upcomingTrips.map((t) => (
                <li key={t.id} className="min-w-0">
                  <Link
                    href={`/organizer/trips/${t.id}`}
                    prefetch={false}
                    className="jad-card-interactive flex h-full min-h-26 flex-col gap-2 lg:min-h-0 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-semibold leading-snug text-fg lg:text-base">
                        {t.title}
                      </p>
                      <p className="mt-1 text-[11px] leading-snug text-fg-hint lg:text-xs">
                        {formatBangkok(t.startAt)} · ผู้จอง {t._count.bookings} / {t.maxParticipants} คน
                        {t.maxParticipants - t._count.bookings > 0 ? (
                          <span className="ml-1 text-success">
                            (ว่าง {t.maxParticipants - t._count.bookings})
                          </span>
                        ) : (
                          <span className="ml-1 text-warning">(เต็ม)</span>
                        )}
                      </p>
                    </div>
                    <div className="mt-auto shrink-0 lg:mt-0">{tripStatusBadge(t.status)}</div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-end justify-between gap-2">
            <h2 className="text-lg font-semibold text-fg">อัปเดตล่าสุด</h2>
            <Link href="/organizer/trips" prefetch={false} className="text-sm font-medium text-brand hover:underline">
              รายการทริป
            </Link>
          </div>
          {recentTrips.length === 0 ? (
            <p className="text-sm text-fg-muted">ยังไม่มีทริป</p>
          ) : (
            <ul className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              {recentTrips.map((t) => (
                <li key={t.id} className="min-w-0">
                  <Link
                    href={`/organizer/trips/${t.id}`}
                    prefetch={false}
                    className="jad-card-interactive flex h-full min-h-26 flex-col gap-2 lg:min-h-0 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-medium leading-snug text-fg lg:text-base">
                        {t.title}
                      </p>
                      <p className="mt-1 text-[11px] leading-snug text-fg-hint lg:text-xs">
                        แก้ไขล่าสุด {formatBangkok(t.updatedAt)} · จอง {t._count.bookings} รายการ
                      </p>
                    </div>
                    <div className="mt-auto shrink-0 lg:mt-0">{tripStatusBadge(t.status)}</div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
