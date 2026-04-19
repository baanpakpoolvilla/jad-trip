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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "ผู้ใช้", value: users, href: "/admin/users" },
          { label: "ทริป", value: trips, href: "/admin/trips" },
          { label: "การจองทั้งหมด", value: bookings, href: "/admin/bookings" },
          { label: "ชำระแล้ว", value: confirmed, href: "/admin/bookings" },
        ].map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="jad-card-interactive block transition-colors"
          >
            <p className="text-sm text-fg-muted">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-fg">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
