import Link from "next/link";
import { notFound } from "next/navigation";
import { TripStatus } from "@prisma/client";
import {
  cancelBookingAsOrganizerForm,
  getTripForOrganizer,
  setTripStatus,
} from "@/app/actions/trips";
import { formatBangkok } from "@/lib/datetime";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

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
      <Link
        href="/organizer/trips"
        className="text-sm font-medium text-brand hover:text-brand-mid"
      >
        ← กลับรายการทริป
      </Link>

      <div className="jad-card space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-fg-hint">
              {trip.status}
            </p>
            <h1 className="mt-1 text-[1.625rem] font-semibold leading-snug text-fg">
              {trip.title}
            </h1>
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
          <div className="flex flex-col gap-2 sm:flex-row">
            {trip.status === TripStatus.PUBLISHED ? (
              <form action={closeTrip} className="flex-1">
                <button type="submit" className="jad-btn-secondary w-full border-warning text-warning hover:bg-warning-light">
                  ปิดรับจอง
                </button>
              </form>
            ) : null}
            <form action={cancelTrip} className="flex-1">
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
        <h2 className="text-lg font-semibold text-fg">ผู้จอง</h2>
        {trip.bookings.length === 0 ? (
          <p className="text-sm text-fg-muted">ยังไม่มีการจอง</p>
        ) : (
          <ul className="space-y-2">
            {trip.bookings.map((b) => (
              <li key={b.id} className="jad-card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-fg">{b.participantName}</p>
                  <p className="text-xs text-fg-muted">
                    {b.participantEmail} · {b.participantPhone}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {bookingStatusBadge(b.status)}
                    <span className="text-xs text-fg-hint">
                      สร้าง {formatBangkok(b.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/bookings/${b.viewToken}`}
                    className="text-xs font-medium text-brand hover:text-brand-mid"
                  >
                    เปิดลิงก์ผู้จอง
                  </Link>
                  {(b.status === "PENDING_PAYMENT" || b.status === "CONFIRMED") && (
                    <form action={cancelBookingAsOrganizerForm}>
                      <input type="hidden" name="bookingId" value={b.id} />
                      <button type="submit" className="jad-btn-ghost px-3 py-1.5 text-xs">
                        ยกเลิกการจอง
                      </button>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
