import Link from "next/link";
import { CalendarDays, CalendarOff, MapPin } from "lucide-react";
import { formatBangkokTripDates } from "@/lib/datetime";
import type { PublicOrganizerBrochureTrip } from "@/lib/trips-public";

export function PublicOrganizerBrochureTrips({ trips }: { trips: PublicOrganizerBrochureTrip[] }) {
  if (trips.length === 0) {
    return (
      <div className="jad-card flex flex-col items-center gap-4 py-12 text-center sm:py-14">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-light text-brand">
          <CalendarOff className="size-7" strokeWidth={1.5} aria-hidden />
        </div>
        <div>
          <p className="text-base font-semibold text-fg">ยังไม่มีทริปที่เปิดรับ</p>
          <p className="mt-1 max-w-md text-sm text-fg-muted">
            ผู้จัดท่านนี้ยังไม่มีทริปที่เผยแพร่และยังอยู่ในช่วงรับจอง — ลองกลับมาภายหลัง
          </p>
        </div>
      </div>
    );
  }

  return (
    <ul
      className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3"
      role="list"
    >
      {trips.map((t) => (
        <li key={t.id} className="flex min-w-0">
          <Link
            href={`/trips/${t.id}`}
            className="jt-trip-card group min-h-0 w-full min-w-0"
          >
            <div className="relative aspect-5/3 w-full shrink-0 overflow-hidden rounded-lg bg-brand-light/40">
              {t.coverImageUrl?.trim() ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.coverImageUrl.trim()}
                    alt=""
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                </>
              ) : (
                <div
                  className="flex size-full items-center justify-center text-brand/45"
                  aria-hidden
                >
                  <MapPin className="size-8" strokeWidth={1.5} />
                </div>
              )}
            </div>

            <div className="mt-3 flex min-h-0 min-w-0 flex-1 flex-col gap-2">
              <div className="min-w-0">
                <h2 className="line-clamp-2 text-[0.9375rem] font-semibold leading-snug tracking-tight text-fg transition-colors group-hover:text-brand sm:text-base">
                  {t.title}
                </h2>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-fg-muted sm:text-[13px] sm:leading-relaxed">
                  {t.shortDescription}
                </p>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border border-border/70 bg-canvas-muted/60 px-2.5 py-2 sm:gap-3 sm:px-3 sm:py-2.5">
                <CalendarDays
                  className="mt-0.5 size-4 shrink-0 text-brand-mid opacity-90 sm:size-4.5"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-fg-hint sm:text-[11px]">
                    วันทริป
                  </p>
                  <p className="mt-0.5 text-xs font-medium leading-snug text-fg tabular-nums sm:text-sm">
                    {formatBangkokTripDates(t.startAt, t.endAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/70 pt-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-fg-hint sm:text-[11px]">
                  ราคา
                </p>
                <p className="mt-0.5 text-lg font-bold tabular-nums leading-none text-brand sm:text-xl">
                  ฿{t.pricePerPerson.toLocaleString("th-TH")}
                  <span className="ml-1 text-xs font-medium text-fg-muted sm:text-sm">/ คน</span>
                </p>
              </div>
              <span
                className={
                  t.spotsLeft > 0
                    ? "jad-badge-success shrink-0 px-2.5 py-1 text-[11px] font-semibold leading-none sm:text-xs"
                    : "jad-badge-neutral shrink-0 px-2.5 py-1 text-[11px] font-semibold leading-none sm:text-xs"
                }
              >
                {t.spotsLeft > 0 ? `เหลือ ${t.spotsLeft} ที่` : "เต็ม"}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
