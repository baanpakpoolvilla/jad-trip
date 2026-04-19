import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getOrganizerPublicBrochureHref } from "@/lib/organizer-brochure-share-code";
import { formatBangkok } from "@/lib/datetime";

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

  const brochureHref = await getOrganizerPublicBrochureHref(session.user.id);

  const trips = await db.trip.findMany({
    where: { organizerId: session.user.id },
    orderBy: { startAt: "desc" },
    include: {
      _count: { select: { bookings: true } },
    },
  });

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
        <Link href="/organizer/trips/new" className="jad-btn-primary shrink-0 text-sm">
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
            <Link href="/organizer/trips/new" className="jad-btn-primary text-sm">
              สร้างทริป
            </Link>
            <Link href={brochureHref} className="jad-btn-secondary text-sm">
              ลิงก์รายการทริป (แชร์)
            </Link>
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {trips.map((t) => (
            <li key={t.id}>
              <Link
                href={`/organizer/trips/${t.id}`}
                className="jad-card-interactive flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-fg">{t.title}</p>
                  <p className="text-xs text-fg-hint">
                    {formatBangkok(t.startAt)} · จอง {t._count.bookings} รายการ
                  </p>
                </div>
                {tripStatusBadge(t.status)}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
