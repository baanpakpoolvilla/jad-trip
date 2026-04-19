import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
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
  if (!session?.user?.id) return null;

  const trips = await db.trip.findMany({
    where: { organizerId: session.user.id },
    orderBy: { startAt: "desc" },
    include: {
      _count: { select: { bookings: true } },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-[1.625rem] font-semibold text-fg">ทริปของฉัน</h1>
          <p className="mt-1 text-sm text-fg-muted">
            {trips.length} ทริป · คลิกเพื่อดูผู้จอง
          </p>
        </div>
        <Link href="/organizer/trips/new" className="jad-btn-primary shrink-0 text-sm">
          สร้างทริป
        </Link>
      </div>

      {trips.length === 0 ? (
        <p className="jad-card text-center text-sm text-fg-muted">
          ยังไม่มีทริป — เริ่มจากปุ่ม &quot;สร้างทริป&quot;
        </p>
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
