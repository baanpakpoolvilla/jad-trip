import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingPayPanel } from "@/components/booking-pay-panel";
import { getBookingByToken } from "@/app/actions/bookings";
import { formatBangkok } from "@/lib/datetime";
import { buildPromptPayQrDataUrl } from "@/lib/promptpay-qr";

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

  const stripeCheckoutAvailable = Boolean(process.env.STRIPE_SECRET_KEY?.trim());

  const organizerHasPromptPay = Boolean(
    trip.organizer.payoutPromptPayId?.trim().length,
  );

  let promptPayQrDataUrl: string | null = null;
  if (
    booking.status === "PENDING_PAYMENT" &&
    organizerHasPromptPay &&
    trip.organizer.payoutPromptPayId
  ) {
    try {
      promptPayQrDataUrl = await buildPromptPayQrDataUrl(
        trip.organizer.payoutPromptPayId,
        trip.pricePerPerson,
      );
    } catch {
      promptPayQrDataUrl = null;
    }
  }

  return (
    <div className="space-y-6">
      <header className="jad-page-header">
        <h1 className="jad-page-title">การจองของคุณ</h1>
      </header>
      <div className="jad-card space-y-4">
        <p className="jad-section-label">ทริป</p>
        <p className="text-lg font-semibold text-fg">{trip.title}</p>
        <p className="text-sm text-fg-muted">{formatBangkok(trip.startAt)}</p>
        <dl className="space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-fg-muted">ชื่อผู้จอง</dt>
            <dd className="text-right font-medium text-fg">{booking.participantName}</dd>
          </div>
          {booking.participantEmail.trim() ? (
            <div className="flex justify-between gap-4">
              <dt className="text-fg-muted">อีเมล</dt>
              <dd className="text-right text-fg">{booking.participantEmail}</dd>
            </div>
          ) : null}
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
            stripeCheckoutAvailable={stripeCheckoutAvailable}
            promptPayQrDataUrl={promptPayQrDataUrl}
            organizerHasPromptPay={organizerHasPromptPay}
            payoutQrImageUrl={trip.organizer.payoutQrImageUrl}
            payoutBankName={trip.organizer.payoutBankName}
            payoutBankAccountName={trip.organizer.payoutBankAccountName}
            payoutBankAccountNumber={trip.organizer.payoutBankAccountNumber}
          />
        </div>

        <p className="border-t border-border pt-4 text-xs leading-relaxed text-fg-hint">
          หลังชำระแล้วหากต้องการยกเลิกหรือคืนเงิน โปรดติดต่อผู้จัดทริปโดยตรง
          {trip.organizer.phone ? ` (${trip.organizer.phone})` : ""}
        </p>
      </div>

      {booking.status === "CONFIRMED" && (
        <div className="jad-card space-y-4">
          <p className="jad-section-label">รายละเอียดทริปสำหรับผู้เดินทาง</p>
          <dl className="space-y-3 text-sm">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium uppercase tracking-wide text-fg-muted">วันเดินทาง</dt>
              <dd className="font-medium text-fg">
                {formatBangkok(trip.startAt)}
                {" — "}
                {formatBangkok(trip.endAt)}
              </dd>
            </div>
            {trip.meetPoint?.trim() ? (
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs font-medium uppercase tracking-wide text-fg-muted">จุดนัดพบ</dt>
                <dd className="whitespace-pre-wrap text-fg">{trip.meetPoint.trim()}</dd>
              </div>
            ) : null}
            {trip.packingList?.trim() ? (
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs font-medium uppercase tracking-wide text-fg-muted">สิ่งที่ต้องเตรียม</dt>
                <dd className="whitespace-pre-wrap text-fg">{trip.packingList.trim()}</dd>
              </div>
            ) : null}
            {trip.policyNotes?.trim() ? (
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs font-medium uppercase tracking-wide text-fg-muted">นโยบาย / ข้อควรทราบ</dt>
                <dd className="whitespace-pre-wrap text-fg">{trip.policyNotes.trim()}</dd>
              </div>
            ) : null}
          </dl>
          <div className="rounded-lg border border-border bg-canvas-muted/40 px-3 py-3 text-sm">
            <p className="font-medium text-fg-muted">ติดต่อผู้จัดทริป</p>
            <p className="mt-1 font-semibold text-fg">{trip.organizer.name}</p>
            {trip.organizer.phone ? (
              <p className="text-fg-muted">{trip.organizer.phone}</p>
            ) : null}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 text-sm">
        <Link href={`/trips/${trip.id}`} className="font-medium text-brand hover:text-brand-mid">
          ดูหน้าทริป
        </Link>
        {booking.status !== "CONFIRMED" ? (
          <p className="text-fg-hint">ที่เหลือในทริป (ประมาณการ): {spotsLeftDisplay} ที่</p>
        ) : null}
      </div>
    </div>
  );
}
