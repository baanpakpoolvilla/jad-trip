import Link from "next/link";
import { CalendarOff, ChevronRight, MapPin } from "lucide-react";
import { formatBangkok } from "@/lib/datetime";
import { listPublishedTripsForPublic } from "@/lib/trips-public";

export const dynamic = "force-dynamic";

export default async function TripsPage() {
  const trips = await listPublishedTripsForPublic();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="jad-section-label">ค้นหาทริป</p>
        <h1 className="jad-page-title">ทริปที่เปิดรับ</h1>
        <p className="max-w-xl text-sm leading-relaxed text-fg-muted sm:text-base">
          แสดงเฉพาะทริปที่ยังมีที่ว่างและยังไม่ปิดรับจอง — แตะการ์ดเพื่อดูรายละเอียด
        </p>
      </header>

      {trips.length === 0 ? (
        <div className="jad-card flex flex-col items-center gap-4 py-12 text-center sm:py-14">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-light text-brand">
            <CalendarOff className="size-7" strokeWidth={1.25} aria-hidden />
          </div>
          <div>
            <p className="text-base font-semibold text-fg">ยังไม่มีทริปที่เปิดรับ</p>
            <p className="mt-1 text-sm text-fg-muted">ลองกลับมาใหม่ภายหลัง หรือติดต่อผู้จัดทริปโดยตรง</p>
          </div>
          <Link href="/" className="jad-btn-secondary min-h-11 px-6">
            กลับหน้าแรก
          </Link>
        </div>
      ) : (
        <ul className="space-y-4" role="list">
          {trips.map((t) => (
            <li key={t.id}>
              <Link
                href={`/trips/${t.id}`}
                className="jad-trip-row group block focus:outline-none"
              >
                {t.coverImageUrl?.trim() ? (
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-canvas sm:size-24">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={t.coverImageUrl.trim()}
                      alt=""
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div
                    className="flex size-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-border bg-brand-light/50 text-brand/50 sm:size-24"
                    aria-hidden
                  >
                    <MapPin className="size-7" strokeWidth={1.25} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold leading-snug text-fg transition-colors group-hover:text-brand sm:text-xl">
                    {t.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-fg-muted">
                    {t.shortDescription}
                  </p>
                  <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-fg-hint">
                    <span>{formatBangkok(t.startAt)}</span>
                    <span aria-hidden className="text-border">
                      ·
                    </span>
                    <span>{t.organizer.name}</span>
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end justify-between self-stretch pl-1 sm:pl-2">
                  <div className="text-right">
                    <p className="text-lg font-bold tabular-nums text-brand sm:text-xl">
                      ฿{t.pricePerPerson.toLocaleString("th-TH")}
                    </p>
                    <p className="text-xs text-fg-muted">ต่อคน</p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="jad-badge-success">เหลือ {t.spotsLeft}</span>
                    <ChevronRight
                      className="size-5 text-fg-hint transition-transform group-hover:translate-x-0.5 sm:size-6"
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
