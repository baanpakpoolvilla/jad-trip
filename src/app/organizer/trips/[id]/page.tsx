import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MapPin, Phone, Receipt } from "lucide-react";
import { TripStatus } from "@prisma/client";
import {
  cancelBookingAsOrganizerForm,
  getTripForOrganizer,
  setTripStatus,
} from "@/app/actions/trips";
import { formatBangkok } from "@/lib/datetime";
import { parseDepartureRounds } from "@/lib/departure-options";
import { ConfirmForm } from "@/components/confirm-form";
import { CopyBookingsButton } from "@/components/copy-bookings-button";
import { resolveSlipUrls } from "@/lib/slip-storage";

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

type BookingItem = {
  id: string;
  participantName: string;
  participantEmail: string;
  participantPhone: string;
  status: string;
  createdAt: Date;
  viewToken: string;
  selectedRound: string | null;
};

function BookingList({
  bookings,
  slipUrls,
}: {
  bookings: BookingItem[];
  slipUrls: Record<string, string | undefined>;
}) {
  return (
    <ul className="space-y-1.5">
      {bookings.map((b) => {
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
              {slipUrls[b.id] ? (
                <a
                  href={slipUrls[b.id]!}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`ดูสลิปของ ${b.participantName}`}
                  className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-success/35 bg-success-light px-2.5 text-xs font-medium text-success shadow-sm transition-colors hover:border-success/60 hover:bg-success-light/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/30 focus-visible:ring-offset-2"
                >
                  <Receipt className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                  ดูสลิป
                </a>
              ) : null}
              <Link
                href={`/bookings/${b.viewToken}`}
                className="inline-flex h-8 items-center rounded-lg px-2.5 text-xs font-medium text-brand hover:bg-brand-light/40 hover:text-brand-mid"
              >
                ลิงก์ผู้จอง
              </Link>
              <ConfirmForm
                action={cancelBookingAsOrganizerForm}
                message={`ยกเลิกการจองของ "${b.participantName}" หรือไม่?`}
                className="inline"
              >
                <input type="hidden" name="bookingId" value={b.id} />
                <button
                  type="submit"
                  className="inline-flex h-8 items-center rounded-lg px-2.5 text-xs font-medium text-danger hover:bg-danger-light"
                >
                  ยกเลิก
                </button>
              </ConfirmForm>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default async function OrganizerTripDetailPage({ params }: Props) {
  const { id } = await params;
  const trip = await getTripForOrganizer(id);
  if (!trip) notFound();

  // Generate short-lived signed URLs for slip images — organizer-only access
  const slipUrls = await resolveSlipUrls(
    trip.bookings.map((b) => ({ id: b.id, slipImageUrl: b.slipImageUrl ?? null })),
  );

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

  const confirmedCount = trip.bookings.filter((b) => b.status === "CONFIRMED").length;
  const pendingCount = trip.bookings.filter((b) => b.status === "PENDING_PAYMENT").length;

  // จัดกลุ่มผู้จองตามรอบ — ถ้าทริปมี departureOptions
  const hasMultipleRounds = trip.departureOptions.trim().length > 0;
  const roundLabels = hasMultipleRounds
    ? parseDepartureRounds(trip.startAt, trip.endAt, trip.departureOptions).map((r) => r.label)
    : [];

  type BookingRow = (typeof trip.bookings)[number];

  // จัดกลุ่ม: roundLabel → bookings
  const bookingsByRound: Map<string, BookingRow[]> = new Map();
  const unassignedBookings: BookingRow[] = [];

  if (hasMultipleRounds) {
    for (const label of roundLabels) bookingsByRound.set(label, []);
    for (const b of trip.bookings) {
      if (b.selectedRound && bookingsByRound.has(b.selectedRound)) {
        bookingsByRound.get(b.selectedRound)!.push(b);
      } else {
        unassignedBookings.push(b);
      }
    }
  }

  return (
    <div className="space-y-6">
      <nav aria-label="เส้นทางกลับ">
        <Link href="/organizer/trips" className="jad-back-link">
          <ArrowLeft className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
          รายการทริป
        </Link>
      </nav>

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
                className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent"
                aria-hidden
              />
              <h1 className="jad-page-title absolute bottom-2 left-2 right-2 z-1 mt-0 text-base leading-snug text-white drop-shadow-sm sm:bottom-3 sm:left-3 sm:right-3 sm:text-xl">
                {trip.title}
              </h1>
            </>
          ) : (
            <div className="flex h-full min-h-30 flex-col items-center justify-center gap-2 px-4 text-center sm:min-h-34">
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
          <div className="flex flex-wrap gap-2">
            <Link href={`/organizer/trips/${trip.id}/edit`} className="jad-btn-secondary shrink-0 text-sm">
              แก้ไขทริป
            </Link>
            {trip.shareCode ? (
              <Link
                href={`/trips/${trip.id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 jad-btn-ghost shrink-0 text-sm"
              >
                <ExternalLink className="size-3.5" strokeWidth={1.5} aria-hidden />
                หน้าลูกค้า
              </Link>
            ) : null}
          </div>
        </div>

        {trip.status === TripStatus.DRAFT ? (
          <ConfirmForm
            action={publishTrip}
            message="เผยแพร่ทริปนี้ เพื่อเปิดรับจองหรือไม่?"
          >
            <button type="submit" className="jad-btn-primary w-full sm:w-auto">
              เผยแพร่ทริป (เปิดรับจอง)
            </button>
          </ConfirmForm>
        ) : null}

        {(trip.status === TripStatus.PUBLISHED || trip.status === TripStatus.DRAFT) && (
          <div className="grid grid-cols-2 gap-2">
            {trip.status === TripStatus.PUBLISHED ? (
              <ConfirmForm
                action={closeTrip}
                message="ปิดรับจองทริปนี้หรือไม่?\n\nผู้จองใหม่จะไม่สามารถจองได้อีก แต่การจองที่มีอยู่แล้วยังคงอยู่"
                className="min-w-0"
              >
                <button type="submit" className="jad-btn-secondary w-full border-warning text-warning hover:bg-warning-light">
                  ปิดรับจอง
                </button>
              </ConfirmForm>
            ) : null}
            <ConfirmForm
              action={cancelTrip}
              message={`ยกเลิกทริป "${trip.title}" หรือไม่?\n\nการดำเนินการนี้ไม่สามารถย้อนกลับได้`}
              className={trip.status === TripStatus.DRAFT ? "col-span-2 min-w-0" : "min-w-0"}
            >
              <button
                type="submit"
                className="jad-btn-secondary w-full border-danger text-danger hover:bg-danger-light"
              >
                ยกเลิกทริป
              </button>
            </ConfirmForm>
          </div>
        )}
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-fg">ผู้จอง</h2>
            <p className="mt-0.5 text-xs text-fg-muted">
              จองแล้ว {confirmedCount} คน
              {pendingCount > 0 ? ` · รอชำระ ${pendingCount} คน` : ""}
              {" · "}สูงสุด {trip.maxParticipants} คน
            </p>
          </div>
          <CopyBookingsButton
            bookings={trip.bookings.map((b) => ({
              name: b.participantName,
              phone: b.participantPhone,
              status: b.status,
              round: b.selectedRound ?? undefined,
            }))}
            tripTitle={trip.title}
          />
        </div>

        {trip.bookings.length === 0 ? (
          <p className="text-sm text-fg-muted">ยังไม่มีผู้จอง</p>
        ) : hasMultipleRounds ? (
          /* แสดงแยกรอบ */
          <div className="space-y-5">
            {roundLabels.map((label, roundIdx) => {
              const bookings = bookingsByRound.get(label) ?? [];
              const roundConfirmed = bookings.filter((b) => b.status === "CONFIRMED").length;
              const roundPending = bookings.filter((b) => b.status === "PENDING_PAYMENT").length;
              return (
                <div key={label} className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-sm font-semibold text-fg">
                      รอบที่ {roundIdx + 1} · {label}
                    </h3>
                    <span className="text-xs text-fg-hint">
                      จองแล้ว {roundConfirmed} คน
                      {roundPending > 0 ? ` · รอชำระ ${roundPending} คน` : ""}
                    </span>
                  </div>
                  {bookings.length === 0 ? (
                    <p className="text-xs text-fg-hint italic">ยังไม่มีผู้จองรอบนี้</p>
                  ) : (
                    <BookingList bookings={bookings} slipUrls={slipUrls} />
                  )}
                </div>
              );
            })}
            {unassignedBookings.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-sm font-semibold text-fg-muted">ไม่ระบุรอบ</h3>
                  <span className="text-xs text-fg-hint">{unassignedBookings.length} คน</span>
                </div>
                <BookingList bookings={unassignedBookings} slipUrls={slipUrls} />
              </div>
            ) : null}
          </div>
        ) : (
          /* แสดงแบบเดิม — ทริปรอบเดียว */
          <BookingList bookings={trip.bookings} slipUrls={slipUrls} />
        )}
      </section>
    </div>
  );
}
