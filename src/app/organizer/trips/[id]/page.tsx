import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Phone } from "lucide-react";
import { TripStatus } from "@prisma/client";
import {
  cancelBookingAsOrganizerForm,
  getTripForOrganizer,
  setTripStatus,
} from "@/app/actions/trips";
import { formatBangkok } from "@/lib/datetime";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

function tripStatusLabel(status: TripStatus): string {
  switch (status) {
    case TripStatus.DRAFT:
      return "ฉบับร่าง";
    case TripStatus.PUBLISHED:
      return "เผยแพร่แล้ว (เปิดรับจอง)";
    case TripStatus.CLOSED:
      return "ปิดรับจองแล้ว";
    case TripStatus.CANCELLED:
      return "ยกเลิกแล้ว";
    default:
      return status;
  }
}

/** ลิงก์โทรออก — คืน null ถ้าไม่มีตัวเลขให้โทร */
function bookingTelHref(phone: string): string | null {
  const compact = phone.replace(/[\s\-.()/]/g, "");
  if (!/\d/.test(compact)) return null;
  return `tel:${compact}`;
}

function bookingStatusBadge(s: string) {
  switch (s) {
    case "PENDING_PAYMENT":
      return <span className="jad-badge-warning">รอชำระ</span>;
    case "CONFIRMED":
      return <span className="jad-badge-success">จองแล้ว</span>;
    case "CANCELLED":
      return <span className="jad-badge-danger">ยกเลิก</span>;
    case "EXPIRED":
      return <span className="jad-badge-neutral">หมดเวลา</span>;
    default:
      return <span className="jad-badge-neutral">{s}</span>;
  }
}

export default async function OrganizerTripDetailPage({ params }: Props) {
  const { id } = await params;
  const trip = await getTripForOrganizer(id);
  if (!trip) notFound();

  async function closeTrip() {
    "use server";
    await setTripStatus(id, TripStatus.CLOSED);
  }

  async function cancelTrip() {
    "use server";
    await setTripStatus(id, TripStatus.CANCELLED);
  }

  async function publishTrip() {
    "use server";
    await setTripStatus(id, TripStatus.PUBLISHED);
  }

  return (
    <div className="space-y-6">
      <Link href="/organizer/trips" className="jad-back-link">
        ← รายการทริป
      </Link>

      <div className="jad-card space-y-4">
        <div className="relative aspect-5/3 w-full overflow-hidden rounded-lg bg-brand-light/35">
          {trip.coverImageUrl?.trim() ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- URL จากอัปโหลดผู้จัด */}
              <img
                src={trip.coverImageUrl.trim()}
                alt=""
                className="absolute inset-0 size-full object-cover"
                loading="eager"
                decoding="async"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
                aria-hidden
              />
              <h1 className="jad-page-title absolute bottom-2 left-2 right-2 z-[1] mt-0 text-base leading-snug text-white drop-shadow-sm sm:bottom-3 sm:left-3 sm:right-3 sm:text-xl">
                {trip.title}
              </h1>
            </>
          ) : (
            <div className="flex h-full min-h-[7.5rem] flex-col items-center justify-center gap-2 px-4 text-center sm:min-h-[8.5rem]">
              <MapPin className="size-9 text-brand/40" strokeWidth={1.5} aria-hidden />
              <p className="text-xs text-fg-muted">ยังไม่มีรูปปกทริป</p>
              <Link
                href={`/organizer/trips/${trip.id}/edit`}
                className="jad-btn-secondary px-3 py-1.5 text-xs sm:text-sm"
              >
                เพิ่มรูปปก
              </Link>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-fg-hint">
              {tripStatusLabel(trip.status)}
            </p>
            {!trip.coverImageUrl?.trim() ? <h1 className="jad-page-title mt-1">{trip.title}</h1> : null}
            <p className="mt-1 text-sm text-fg-muted">
              {formatBangkok(trip.startAt)} · ฿{trip.pricePerPerson.toLocaleString("th-TH")}{" "}
              / คน · สูงสุด {trip.maxParticipants} คน
            </p>
          </div>
          <Link href={`/organizer/trips/${trip.id}/edit`} className="jad-btn-secondary shrink-0 text-sm">
            แก้ไขทริป
          </Link>
        </div>

        {trip.status === TripStatus.DRAFT ? (
          <form action={publishTrip}>
            <button type="submit" className="jad-btn-primary w-full sm:w-auto">
              เผยแพร่ทริป (เปิดรับจอง)
            </button>
          </form>
        ) : null}

        {(trip.status === TripStatus.PUBLISHED || trip.status === TripStatus.DRAFT) && (
          <div className="grid grid-cols-2 gap-2">
            {trip.status === TripStatus.PUBLISHED ? (
              <form action={closeTrip} className="min-w-0">
                <button type="submit" className="jad-btn-secondary w-full border-warning text-warning hover:bg-warning-light">
                  ปิดรับจอง
                </button>
              </form>
            ) : null}
            <form
              action={cancelTrip}
              className={trip.status === TripStatus.DRAFT ? "col-span-2 min-w-0" : "min-w-0"}
            >
              <button
                type="submit"
                className="jad-btn-secondary w-full border-danger text-danger hover:bg-danger-light"
              >
                ยกเลิกทริป
              </button>
            </form>
          </div>
        )}
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-fg">ผู้จอง</h2>
          <p className="mt-0.5 text-xs text-fg-muted">เฉพาะที่ชำระเงินแล้ว (จองแล้ว)</p>
        </div>
        {trip.bookings.length === 0 ? (
          <p className="text-sm text-fg-muted">ยังไม่มีผู้จองที่ชำระเงินสำเร็จ</p>
        ) : (
          <ul className="space-y-1.5">
            {trip.bookings.map((b) => {
              const tel = bookingTelHref(b.participantPhone);
              return (
                <li
                  key={b.id}
                  className="jad-card grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 p-3 sm:p-3.5"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <p className="text-sm font-medium leading-tight text-fg">{b.participantName}</p>
                      {bookingStatusBadge(b.status)}
                      <span className="text-[11px] leading-tight text-fg-hint">
                        สร้าง {formatBangkok(b.createdAt)}
                      </span>
                    </div>
                    <p className="truncate text-[11px] leading-snug text-fg-muted sm:text-xs">
                      {[b.participantEmail.trim(), b.participantPhone.trim()]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="flex max-w-full flex-wrap items-center justify-end gap-1.5 justify-self-end">
                    {tel ? (
                      <a
                        href={tel}
                        aria-label={`โทรหา ${b.participantName}`}
                        className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-fg shadow-sm transition-colors hover:border-brand/40 hover:bg-brand-light/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mid/25 focus-visible:ring-offset-2"
                      >
                        <Phone className="size-3.5 shrink-0 text-brand" strokeWidth={1.75} aria-hidden />
                        โทร
                      </a>
                    ) : null}
                    <Link
                      href={`/bookings/${b.viewToken}`}
                      className="inline-flex h-8 items-center rounded-lg px-2.5 text-xs font-medium text-brand hover:bg-brand-light/40 hover:text-brand-mid"
                    >
                      ลิงก์ผู้จอง
                    </Link>
                    <form action={cancelBookingAsOrganizerForm} className="inline">
                      <input type="hidden" name="bookingId" value={b.id} />
                      <button
                        type="submit"
                        className="inline-flex h-8 items-center rounded-lg px-2.5 text-xs font-medium text-danger hover:bg-danger-light"
                      >
                        ยกเลิกการจอง
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
