import Link from "next/link";
import { redirect } from "next/navigation";
import { Pencil } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { organizerBrochureShortPath, organizerPublicProfilePath } from "@/lib/trips-public";
import { formatBangkok } from "@/lib/datetime";
import { CopyTripPostButton, type TripPostData } from "@/components/copy-trip-post-button";

export const dynamic = "force-dynamic";

function tripStatusBadge(status: string) {
  switch (status) {
    case "PUBLISHED":
      return <span className="jad-badge-success">เปิดรับ</span>;
    case "DRAFT":
      return <span className="jad-badge-neutral">ร่าง</span>;
    case "CLOSED":
      return <span className="jad-badge-warning">ปิดรับ</span>;
    case "CANCELLED":
      return <span className="jad-badge-danger">ยกเลิก</span>;
    default:
      return <span className="jad-badge-neutral">{status}</span>;
  }
}

export default async function OrganizerTripsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [trips, userRow] = await Promise.all([
    db.trip.findMany({
      where: { organizerId: session.user.id },
      orderBy: { startAt: "desc" },
      select: {
        id: true,
        title: true,
        shortDescription: true,
        startAt: true,
        endAt: true,
        meetPoint: true,
        destinationName: true,
        pricePerPerson: true,
        maxParticipants: true,
        bookingClosesAt: true,
        shareCode: true,
        status: true,
        highlights: true,
        itinerary: true,
        guideProvides: true,
        departureOptions: true,
        policyNotes: true,
        _count: { select: { bookings: true } },
      },
    }),
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        phone: true,
        brochureShareCode: true,
        socialLine: true,
        socialFacebook: true,
        socialInstagram: true,
        socialTiktok: true,
      },
    }),
  ]);

  const brochureShareCode = userRow?.brochureShareCode ?? "";
  const brochureHref = organizerBrochureShortPath(brochureShareCode);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <header className="jad-page-header min-w-0">
          <p className="jad-section-label">ผู้จัด</p>
          <h1 className="jad-page-title">ทริปของฉัน</h1>
          <p className="text-sm text-fg-muted">
            {trips.length} ทริป · คลิกเพื่อดูผู้จอง
          </p>
        </header>
        <Link href="/organizer/trips/new" prefetch={false} className="jad-btn-primary shrink-0 text-sm">
          สร้างทริป
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="jad-card space-y-3 text-center">
          <p className="text-sm font-medium text-fg">ยังไม่มีทริปในรายการนี้</p>
          <p className="text-sm leading-relaxed text-fg-muted">
            ทริปแต่ละทริปผูกกับบัญชีผู้จัดที่สร้าง — ถ้าทริปถูกสร้างจากบัญชีอื่นหรือโอนจากแอดมิน จะไม่แสดงที่นี่
          </p>
          {session.user.email ? (
            <p className="text-xs text-fg-hint">บัญชีปัจจุบัน: {session.user.email}</p>
          ) : null}
          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-center">
            <Link href="/organizer/trips/new" prefetch={false} className="jad-btn-primary text-sm">
              สร้างทริป
            </Link>
            <Link href={brochureHref} prefetch={false} className="jad-btn-secondary text-sm">
              ลิงก์รายการทริป (แชร์)
            </Link>
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {trips.map((t) => {
            const tripUrl = t.shareCode
              ? `${appUrl}/t/${t.shareCode}`
              : `${appUrl}/trips/${t.id}`;

            const profileUrl = brochureShareCode
              ? `${appUrl}${organizerPublicProfilePath(brochureShareCode)}`
              : null;

            const postData: TripPostData = {
              title: t.title,
              shortDescription: t.shortDescription,
              startAt: formatBangkok(t.startAt),
              endAt: formatBangkok(t.endAt),
              meetPoint: t.meetPoint,
              destinationName: t.destinationName,
              pricePerPerson: t.pricePerPerson,
              maxParticipants: t.maxParticipants,
              bookingClosesAt: t.bookingClosesAt ? formatBangkok(t.bookingClosesAt) : null,
              highlights: t.highlights,
              itinerary: t.itinerary,
              guideProvides: t.guideProvides,
              departureOptions: t.departureOptions,
              policyNotes: t.policyNotes,
              tripUrl,
              organizer: {
                name: userRow?.name ?? "",
                phone: userRow?.phone ?? null,
                socialLine: userRow?.socialLine ?? null,
                socialFacebook: userRow?.socialFacebook ?? null,
                socialInstagram: userRow?.socialInstagram ?? null,
                socialTiktok: userRow?.socialTiktok ?? null,
                profileUrl,
              },
            };

            return (
              <li key={t.id} className="jad-card flex items-center gap-3 p-0 overflow-hidden">
                <Link
                  href={`/organizer/trips/${t.id}`}
                  prefetch={false}
                  className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3.5 transition-colors hover:bg-brand-light/30"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {tripStatusBadge(t.status)}
                      <p className="font-semibold text-fg">{t.title}</p>
                    </div>
                    <p className="text-xs text-fg-hint">
                      {formatBangkok(t.startAt)} · จอง {t._count.bookings} รายการ
                    </p>
                  </div>
                </Link>
                <div className="mr-3 flex shrink-0 items-center gap-1.5">
                  <CopyTripPostButton trip={postData} />
                  <Link
                    href={`/organizer/trips/${t.id}/edit`}
                    prefetch={false}
                    aria-label={`แก้ไขทริป ${t.title}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-fg-muted transition-colors hover:border-brand/40 hover:bg-brand-light/50 hover:text-brand"
                  >
                    <Pencil className="size-3.5" strokeWidth={1.75} aria-hidden />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
