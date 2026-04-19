import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingPayPanel } from "@/components/booking-pay-panel";
import { getBookingByToken } from "@/app/actions/bookings";
import { formatBangkok } from "@/lib/datetime";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

function statusPill(status: string) {
  switch (status) {
    case "PENDING_PAYMENT":
      return <span className="jad-badge-warning">รอชำระเงิน</span>;
    case "CONFIRMED":
      return <span className="jad-badge-success">จองแล้ว (ชำระครบ)</span>;
    case "EXPIRED":
      return <span className="jad-badge-danger">หมดเวลาชำระ</span>;
    case "CANCELLED":
      return <span className="jad-badge-danger">ยกเลิกแล้ว</span>;
    default:
      return <span className="jad-badge-neutral">{status}</span>;
  }
}

export default async function BookingPage({ params }: Props) {
  const { token } = await params;
  const data = await getBookingByToken(token);
  if (!data) notFound();

  const { booking, spotsLeftDisplay } = data;
  const { trip } = booking;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-fg">การจองของคุณ</h1>
      <div className="jad-card space-y-4">
        <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">ทริป</p>
        <p className="text-lg font-semibold text-fg">{trip.title}</p>
        <p className="text-sm text-fg-muted">{formatBangkok(trip.startAt)}</p>
        <dl className="space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-fg-muted">ชื่อผู้จอง</dt>
            <dd className="text-right font-medium text-fg">{booking.participantName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-fg-muted">อีเมล</dt>
            <dd className="text-right text-fg">{booking.participantEmail}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-fg-muted">โทร</dt>
            <dd className="text-right text-fg">{booking.participantPhone}</dd>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <dt className="text-fg-muted">สถานะ</dt>
            <dd className="text-right">{statusPill(booking.status)}</dd>
          </div>
        </dl>

        <div className="border-t border-border pt-4">
          <BookingPayPanel
            viewToken={booking.viewToken}
            status={booking.status}
            expiresAtIso={booking.expiresAt.toISOString()}
            price={trip.pricePerPerson}
            tripTitle={trip.title}
          />
        </div>

        <p className="border-t border-border pt-4 text-xs leading-relaxed text-fg-hint">
          หลังชำระแล้วหากต้องการยกเลิกหรือคืนเงิน โปรดติดต่อผู้จัดทริปโดยตรง
          {trip.organizer.phone ? ` (${trip.organizer.phone})` : ""}
        </p>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <Link href={`/trips/${trip.id}`} className="font-medium text-brand hover:text-brand-mid">
          ดูหน้าทริป
        </Link>
        <p className="text-fg-hint">ที่เหลือในทริป (ประมาณการ): {spotsLeftDisplay} ที่</p>
      </div>
    </div>
  );
}
