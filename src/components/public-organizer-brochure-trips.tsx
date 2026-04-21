import Link from "next/link";
import { ArrowRight, CalendarDays, CalendarOff, MapPin, Navigation2 } from "lucide-react";
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
              <div className="flex items-start justify-between gap-2">
                <h2 className="line-clamp-2 text-[0.9375rem] font-semibold leading-snug tracking-tight text-fg transition-colors group-hover:text-brand sm:text-base">
                  {t.title}
                </h2>
                <span
                  className={
                    t.spotsLeft > 0
                      ? "jad-badge-success mt-0.5 shrink-0 px-2 py-0.5 text-[11px] font-semibold leading-none"
                      : "jad-badge-neutral mt-0.5 shrink-0 px-2 py-0.5 text-[11px] font-semibold leading-none"
                  }
                >
                  {t.spotsLeft > 0 ? `เหลือ ${t.spotsLeft} ที่` : "เต็ม"}
                </span>
              </div>

              <p className="line-clamp-2 text-xs leading-relaxed text-fg-muted sm:text-[13px] sm:leading-relaxed">
                {t.shortDescription}
              </p>

              {/* meta row: date · location */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-muted">
                <span className="flex items-center gap-1">
                  <CalendarDays className="size-3.5 shrink-0 text-brand-mid/70" strokeWidth={1.5} aria-hidden />
                  <span className="tabular-nums">{formatBangkokTripDates(t.startAt, t.endAt)}</span>
                </span>
                {(t.destinationName?.trim() || t.meetPoint?.trim()) ? (
                  <>
                    <span className="text-border" aria-hidden>·</span>
                    <span className="flex min-w-0 items-center gap-1">
                      <Navigation2 className="size-3.5 shrink-0 text-brand-mid/70" strokeWidth={1.5} aria-hidden />
                      <span className="line-clamp-1">
                        {t.destinationName?.trim() ||
                          (t.meetPoint?.trim().split(/\s*[—–-]\s*/)[0]?.trim() ?? "")}
                      </span>
                    </span>
                  </>
                ) : null}
              </div>
            </div>

            {/* price footer */}
            <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/70 pt-3">
              <p className="tabular-nums leading-none">
                <span className="text-xl font-bold text-brand sm:text-2xl">
                  ฿{t.pricePerPerson.toLocaleString("th-TH")}
                </span>
                <span className="ml-1 text-xs font-medium text-fg-muted">/ คน</span>
              </p>
              <span className="flex items-center gap-1 text-xs font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100">
                จองเลย <ArrowRight className="size-3.5" strokeWidth={2} aria-hidden />
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
