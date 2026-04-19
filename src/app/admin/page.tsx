import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [users, trips, bookings, confirmed] = await Promise.all([
    db.user.count(),
    db.trip.count(),
    db.booking.count(),
    db.booking.count({ where: { status: "CONFIRMED" } }),
  ]);

  return (
    <div className="space-y-8">
      <header className="jad-page-header">
        <p className="jad-section-label">แอดมิน</p>
        <h1 className="jad-page-title">ภาพรวม</h1>
        <p className="text-sm text-fg-muted">ข้อมูลรวมในระบบ</p>
      </header>
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: "ผู้ใช้", value: users, href: "/admin/users" },
          { label: "ทริป", value: trips, href: "/admin/trips" },
          { label: "การจองทั้งหมด", value: bookings, href: "/admin/bookings" },
          { label: "ชำระแล้ว", value: confirmed, href: "/admin/bookings" },
        ].map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="jad-card-interactive block min-w-0 px-2 py-2.5 transition-colors sm:px-4 sm:py-4"
          >
            <p className="line-clamp-2 text-[11px] leading-snug text-fg-muted sm:text-sm">{c.label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-fg sm:mt-2 sm:text-3xl">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
