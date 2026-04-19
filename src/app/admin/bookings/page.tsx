import Link from "next/link";
import { db } from "@/lib/db";
import { formatBangkok } from "@/lib/datetime";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const bookings = await db.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      trip: { select: { id: true, title: true } },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-[1.625rem] font-semibold text-fg">การจองล่าสุด</h1>
      <div className="jad-card overflow-x-auto p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-canvas text-xs font-medium uppercase tracking-wide text-fg-muted">
            <tr>
              <th className="px-4 py-3">ทริป</th>
              <th className="px-4 py-3">ผู้จอง</th>
              <th className="px-4 py-3">สถานะ</th>
              <th className="px-4 py-3">เวลา</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-border last:border-0 hover:bg-canvas/80">
                <td className="px-4 py-3 font-medium text-fg">
                  <Link href={`/trips/${b.trip.id}`} className="text-brand hover:text-brand-mid hover:underline">
                    {b.trip.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-fg-muted">
                  {b.participantName}
                  <span className="block text-xs text-fg-hint">{b.participantEmail}</span>
                </td>
                <td className="px-4 py-3 text-fg-muted">{b.status}</td>
                <td className="px-4 py-3 text-fg-muted">{formatBangkok(b.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
