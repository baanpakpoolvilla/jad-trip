import Link from "next/link";
import { CalendarOff, MapPin } from "lucide-react";
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

            <div className="mt-2 flex min-h-0 flex-1 flex-col gap-0.5">
              <h2 className="line-clamp-2 text-[0.8125rem] font-semibold leading-snug text-fg transition-colors group-hover:text-brand sm:text-sm">
                {t.title}
              </h2>
              <p className="line-clamp-2 text-[11px] leading-snug text-fg-muted sm:text-xs">
                {t.shortDescription}
              </p>
              <p className="mt-1 line-clamp-1 text-[10px] text-fg-hint sm:text-[11px]">
                <span className="tabular-nums">{formatBangkokTripDates(t.startAt, t.endAt)}</span>
              </p>
            </div>

            <div className="mt-2 flex items-end justify-between gap-2 border-t border-border/60 pt-2">
              <div className="min-w-0">
                <p className="text-base font-bold tabular-nums leading-none text-brand sm:text-lg">
                  ฿{t.pricePerPerson.toLocaleString("th-TH")}
                </p>
                <p className="mt-0.5 text-[10px] text-fg-muted">ต่อคน</p>
              </div>
              <span className="jad-badge-success shrink-0 py-0.5 text-[10px] leading-none sm:text-xs">
                {t.spotsLeft > 0 ? `เหลือ ${t.spotsLeft}` : "เต็ม"}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
