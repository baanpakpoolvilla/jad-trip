import { CalendarDays, MapPin, Navigation2, Users } from "lucide-react";
import { formatBangkokTripDates } from "@/lib/datetime";
import type { PublicOrganizerPortfolioTrip } from "@/lib/trips-public";

export function PublicOrganizerPortfolioTrips({
  trips,
}: {
  trips: PublicOrganizerPortfolioTrip[];
}) {
  if (trips.length === 0) return null;

  return (
    <section className="space-y-4">
      <div>
        <p className="jad-section-label">ผลงาน</p>
        <h2 className="text-lg font-semibold text-fg">ทริปที่ผ่านมา</h2>
        <p className="mt-1 text-sm text-fg-muted">ทริปที่จัดสำเร็จแล้ว</p>
      </div>

      <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3" role="list">
        {trips.map((t) => (
          <li key={t.id} className="flex min-w-0">
            <div className="jt-trip-card w-full min-w-0 opacity-90">
              <div className="relative aspect-5/3 w-full shrink-0 overflow-hidden rounded-lg bg-brand-light/40">
                {t.coverImageUrl?.trim() ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.coverImageUrl.trim()}
                    alt=""
                    className="size-full object-cover grayscale-20"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="flex size-full items-center justify-center text-brand/45"
                    aria-hidden
                  >
                    <MapPin className="size-8" strokeWidth={1.5} />
                  </div>
                )}
                <div className="absolute right-2 top-2">
                  <span className="jad-badge-neutral px-2 py-0.5 text-[11px] font-semibold leading-none">
                    จบแล้ว
                  </span>
                </div>
              </div>

              <div className="mt-3 flex min-h-0 min-w-0 flex-1 flex-col gap-2">
                <h3 className="line-clamp-2 text-[0.9375rem] font-semibold leading-snug tracking-tight text-fg sm:text-base">
                  {t.title}
                </h3>

                <p className="line-clamp-2 text-xs leading-relaxed text-fg-muted sm:text-[13px] sm:leading-relaxed">
                  {t.shortDescription}
                </p>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-muted">
                  <span className="flex items-center gap-1">
                    <CalendarDays
                      className="size-3.5 shrink-0 text-brand-mid/70"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <span className="tabular-nums">
                      {formatBangkokTripDates(t.startAt, t.endAt)}
                    </span>
                  </span>
                  {(t.destinationName?.trim() || t.meetPoint?.trim()) ? (
                    <>
                      <span className="text-border" aria-hidden>
                        ·
                      </span>
                      <span className="flex min-w-0 items-center gap-1">
                        <Navigation2
                          className="size-3.5 shrink-0 text-brand-mid/70"
                          strokeWidth={1.5}
                          aria-hidden
                        />
                        <span className="line-clamp-1">
                          {t.destinationName?.trim() ||
                            (t.meetPoint?.trim().split(/\s*[—–-]\s*/)[0]?.trim() ?? "")}
                        </span>
                      </span>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/70 pt-3">
                <p className="tabular-nums leading-none">
                  <span className="text-xl font-bold text-fg-muted sm:text-2xl">
                    ฿{t.pricePerPerson.toLocaleString("th-TH")}
                  </span>
                  <span className="ml-1 text-xs font-medium text-fg-hint">/ คน</span>
                </p>
                {t.confirmedCount > 0 ? (
                  <span className="flex items-center gap-1 text-xs text-fg-hint">
                    <Users className="size-3.5" strokeWidth={1.5} aria-hidden />
                    {t.confirmedCount} คนร่วมทริป
                  </span>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
