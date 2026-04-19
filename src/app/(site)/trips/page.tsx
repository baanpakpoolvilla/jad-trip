import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatBangkok } from "@/lib/datetime";
import { listPublishedTripsForPublic } from "@/lib/trips-public";

export const dynamic = "force-dynamic";

export default async function TripsPage() {
  const trips = await listPublishedTripsForPublic();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[1.625rem] font-semibold leading-snug text-fg">ทริปที่เปิดรับ</h1>
        <p className="mt-1 text-sm text-fg-muted">
          แสดงเฉพาะทริปที่ยังมีที่ว่างและยังไม่ปิดรับ
        </p>
      </div>

      {trips.length === 0 ? (
        <p className="jad-card text-center text-sm text-fg-muted">
          ยังไม่มีทริปที่เปิดรับในขณะนี้
        </p>
      ) : (
        <ul className="space-y-3">
          {trips.map((t) => (
            <li key={t.id}>
              <Link href={`/trips/${t.id}`} className="jad-card-interactive block">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold text-fg">{t.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-fg-muted">
                      {t.shortDescription}
                    </p>
                    <p className="mt-2 text-xs text-fg-hint">
                      {formatBangkok(t.startAt)} — โดย {t.organizer.name}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                    <p className="text-sm font-semibold text-brand">
                      ฿{t.pricePerPerson.toLocaleString("th-TH")}
                    </p>
                    <p className="text-xs text-fg-muted">ต่อคน</p>
                    <span className="jad-badge-success mt-1">เหลือ {t.spotsLeft} ที่</span>
                    <ChevronRight
                      className="mt-1 size-5 text-fg-hint sm:hidden"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
