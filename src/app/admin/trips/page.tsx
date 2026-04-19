import Link from "next/link";
import { db } from "@/lib/db";
import { formatBangkok } from "@/lib/datetime";
import { reassignTripOrganizer } from "@/app/actions/admin-trips";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ e?: string | string[]; ok?: string | string[] }>;
};

function first(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return typeof v === "string" ? v : v[0];
}

export default async function AdminTripsPage({ searchParams }: Props) {
  const raw = await searchParams;
  const flash = { e: first(raw.e), ok: first(raw.ok) };

  const trips = await db.trip.findMany({
    orderBy: { startAt: "desc" },
    take: 80,
    include: {
      organizer: { select: { email: true, name: true } },
      _count: { select: { bookings: true } },
    },
  });

  return (
    <div className="space-y-6">
      <header className="jad-page-header">
        <p className="jad-section-label">แอดมิน</p>
        <h1 className="jad-page-title">ทริปทั้งหมด</h1>
        <p className="text-sm text-fg-muted">
          ทริปแต่ละทริปผูกกับ <span className="font-medium text-fg">organizerId</span> — ถ้าล็อกอินผู้จัดคนอื่นจะไม่เห็นในหน้าจัดการ; ใช้แบบฟอร์มโอนด้านล่าง (อีเมลผู้จัด ORGANIZER เท่านั้น)
        </p>
      </header>

      {flash.e ? (
        <p className="jad-alert-error text-sm" role="alert">
          {flash.e}
        </p>
      ) : null}
      {flash.ok === "1" ? (
        <p className="rounded-lg border border-success/25 bg-success-light px-4 py-3 text-sm text-success" role="status">
          โอนทริปแล้ว — ผู้จัดใหม่จะเห็นใน &quot;ทริปของฉัน&quot;
        </p>
      ) : null}

      <div className="jad-card overflow-x-auto p-0">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead className="border-b border-border bg-canvas text-xs font-medium uppercase tracking-wide text-fg-muted">
            <tr>
              <th className="px-4 py-3">ชื่อ</th>
              <th className="px-4 py-3">ผู้จัด</th>
              <th className="px-4 py-3">วัน</th>
              <th className="px-4 py-3">สถานะ</th>
              <th className="px-4 py-3">จอง</th>
              <th className="px-4 py-3">โอนให้ผู้จัด</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((t) => (
              <tr key={t.id} className="border-b border-border last:border-0 hover:bg-canvas/80">
                <td className="px-4 py-3 font-medium text-fg">
                  <Link href={`/trips/${t.id}`} className="text-brand hover:text-brand-mid hover:underline">
                    {t.title}
                  </Link>
                  <span className="mt-1 block font-mono text-[10px] font-normal text-fg-hint">{t.id}</span>
                </td>
                <td className="px-4 py-3 text-fg-muted">
                  {t.organizer.name}
                  <span className="block text-xs text-fg-hint">{t.organizer.email}</span>
                </td>
                <td className="px-4 py-3 text-fg-muted">{formatBangkok(t.startAt)}</td>
                <td className="px-4 py-3 text-fg-muted">{t.status}</td>
                <td className="px-4 py-3 text-fg-muted">{t._count.bookings}</td>
                <td className="px-4 py-3 align-top">
                  <form action={reassignTripOrganizer} className="flex max-w-[220px] flex-col gap-2">
                    <input type="hidden" name="tripId" value={t.id} />
                    <input
                      name="organizerEmail"
                      type="email"
                      required
                      autoComplete="off"
                      placeholder="อีเมลผู้จัด"
                      className="jad-input py-2 text-xs"
                    />
                    <button type="submit" className="jad-btn-secondary py-2 text-xs">
                      โอน
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
