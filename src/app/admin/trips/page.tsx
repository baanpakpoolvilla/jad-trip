import Link from "next/link";
import { db } from "@/lib/db";
import { formatBangkok } from "@/lib/datetime";

export const dynamic = "force-dynamic";

export default async function AdminTripsPage() {
  const trips = await db.trip.findMany({
    orderBy: { startAt: "desc" },
    take: 80,
    include: {
      organizer: { select: { email: true, name: true } },
      _count: { select: { bookings: true } },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-[1.625rem] font-semibold text-fg">ทริปทั้งหมด</h1>
      <div className="jad-card overflow-x-auto p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-canvas text-xs font-medium uppercase tracking-wide text-fg-muted">
            <tr>
              <th className="px-4 py-3">ชื่อ</th>
              <th className="px-4 py-3">ผู้จัด</th>
              <th className="px-4 py-3">วัน</th>
              <th className="px-4 py-3">สถานะ</th>
              <th className="px-4 py-3">จอง</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((t) => (
              <tr key={t.id} className="border-b border-border last:border-0 hover:bg-canvas/80">
                <td className="px-4 py-3 font-medium text-fg">
                  <Link href={`/trips/${t.id}`} className="text-brand hover:text-brand-mid hover:underline">
                    {t.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-fg-muted">
                  {t.organizer.name}
                  <span className="block text-xs text-fg-hint">{t.organizer.email}</span>
                </td>
                <td className="px-4 py-3 text-fg-muted">{formatBangkok(t.startAt)}</td>
                <td className="px-4 py-3 text-fg-muted">{t.status}</td>
                <td className="px-4 py-3 text-fg-muted">{t._count.bookings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
