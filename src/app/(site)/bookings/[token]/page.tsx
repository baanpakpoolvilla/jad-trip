import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingPayPanel } from "@/components/booking-pay-panel";
import { BookingSteps } from "@/components/booking-steps";
import { TripDetailsShareButton } from "@/components/trip-details-share-button";
import { getBookingByToken } from "@/app/actions/bookings";
import { formatBangkok } from "@/lib/datetime";
import { buildPromptPayQrDataUrl } from "@/lib/promptpay-qr";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

function ReceiptStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "CONFIRMED":
      return (
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex size-10 items-center justify-center rounded-full bg-success/15">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-5 text-success" aria-hidden>
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </div>
          <span className="text-xs font-semibold text-success">ชำระเงินแล้ว</span>
        </div>
      );
    case "PENDING_PAYMENT":
      return (
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex size-10 items-center justify-center rounded-full bg-warning/15">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 text-warning" aria-hidden>
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <span className="text-xs font-semibold text-warning">รอชำระเงิน</span>
        </div>
      );
    case "EXPIRED":
      return (
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex size-10 items-center justify-center rounded-full bg-danger/15">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 text-danger" aria-hidden>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <span className="text-xs font-semibold text-danger">หมดเวลาชำระ</span>
        </div>
      );
    default:
      return (
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex size-10 items-center justify-center rounded-full bg-fg-hint/10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 text-fg-muted" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
          <span className="text-xs font-semibold text-fg-muted">ยกเลิกแล้ว</span>
        </div>
      );
  }
}

export default async function BookingPage({ params }: Props) {
  const { token } = await params;
  const data = await getBookingByToken(token);
  if (!data) notFound();

  const { booking, spotsLeftDisplay } = data;
  const { trip } = booking;

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
      {booking.status === "PENDING_PAYMENT" ? <BookingSteps current="pay" /> : null}
      <header className="jad-page-header">
        <h1 className="jad-page-title">การจองของคุณ</h1>
      </header>
      {/* ใบเสร็จแบบย่อ */}
      <div className="jad-card overflow-hidden p-0">
        {/* header */}
        <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-fg-hint">ใบยืนยันการจอง</p>
            <p className="mt-1 truncate text-base font-bold text-fg">{trip.title}</p>
            <p className="mt-0.5 text-xs text-fg-muted">
              {formatBangkok(trip.startAt, { dateStyle: "medium" })}
            </p>
          </div>
          <ReceiptStatusBadge status={booking.status} />
        </div>

        {/* dashed divider */}
        <div className="relative mx-5">
          <div className="border-t border-dashed border-border" />
          <div className="absolute -left-8 top-1/2 size-4 -translate-y-1/2 rounded-full bg-canvas" />
          <div className="absolute -right-8 top-1/2 size-4 -translate-y-1/2 rounded-full bg-canvas" />
        </div>

        {/* rows */}
        <dl className="divide-y divide-border/60 px-5 text-sm">
          <div className="flex justify-between gap-4 py-2.5">
            <dt className="text-fg-muted">ผู้จอง</dt>
            <dd className="text-right font-medium text-fg">{booking.participantName}</dd>
          </div>
          <div className="flex justify-between gap-4 py-2.5">
            <dt className="text-fg-muted">โทรศัพท์</dt>
            <dd className="text-right text-fg">{booking.participantPhone}</dd>
          </div>
          {booking.participantEmail.trim() ? (
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-fg-muted">อีเมล</dt>
              <dd className="text-right text-fg">{booking.participantEmail}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4 py-2.5">
            <dt className="text-fg-muted">ราคา / ที่นั่ง</dt>
            <dd className="text-right font-semibold text-fg">
              ฿{trip.pricePerPerson.toLocaleString("th-TH")}
            </dd>
          </div>
          {booking.paidAt ? (
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-fg-muted">ชำระเมื่อ</dt>
              <dd className="text-right text-fg">
                {formatBangkok(booking.paidAt, { dateStyle: "short", timeStyle: "short" })}
              </dd>
            </div>
          ) : null}
        </dl>

        {/* dashed divider */}
        <div className="relative mx-5 mt-1">
          <div className="border-t border-dashed border-border" />
          <div className="absolute -left-8 top-1/2 size-4 -translate-y-1/2 rounded-full bg-canvas" />
          <div className="absolute -right-8 top-1/2 size-4 -translate-y-1/2 rounded-full bg-canvas" />
        </div>

        {/* ref */}
        <div className="px-5 py-3">
          <p className="text-center font-mono text-[10px] tracking-widest text-fg-hint">
            REF: {booking.viewToken.slice(0, 8).toUpperCase()}
          </p>
        </div>

        {/* payment panel */}
        <div className="border-t border-border px-5 pb-5 pt-4">
          <BookingPayPanel
            viewToken={booking.viewToken}
            tripId={trip.id}
            status={booking.status}
            expiresAtIso={booking.expiresAt.toISOString()}
            price={trip.pricePerPerson}
            tripTitle={trip.title}
            promptPayQrDataUrl={promptPayQrDataUrl}
            organizerHasPromptPay={organizerHasPromptPay}
            payoutQrImageUrl={trip.organizer.payoutQrImageUrl}
            payoutBankName={trip.organizer.payoutBankName}
            payoutBankAccountName={trip.organizer.payoutBankAccountName}
            payoutBankAccountNumber={trip.organizer.payoutBankAccountNumber}
          />
        </div>

        {booking.status === "CONFIRMED" ? null : (
          <p className="border-t border-border px-5 py-3 text-xs leading-relaxed text-fg-hint">
            หลังชำระแล้วหากต้องการยกเลิกหรือคืนเงิน โปรดติดต่อผู้จัดทริปโดยตรง
            {trip.organizer.phone ? ` (${trip.organizer.phone})` : ""}
          </p>
        )}
      </div>

      {booking.status === "CONFIRMED" && (
        <div className="jad-card space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="jad-section-label">รายละเอียดทริปสำหรับผู้เดินทาง</p>
            <TripDetailsShareButton
              tripTitle={trip.title}
              dateRange={`${formatBangkok(trip.startAt)} — ${formatBangkok(trip.endAt)}`}
              meetPoint={trip.meetPoint ?? undefined}
              packingList={trip.packingList ?? undefined}
              policyNotes={trip.policyNotes ?? undefined}
              bookingUrl={`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/bookings/${booking.viewToken}`}
              shortBookingUrl={`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/b/${booking.viewToken.slice(0, 12)}`}
            />
          </div>
          <dl className="divide-y divide-border text-sm">
            <div className="py-3 first:pt-0">
              <dt className="text-xs font-medium uppercase tracking-wide text-fg-muted">📅 วันเดินทาง</dt>
              <dd className="mt-1 font-semibold text-fg">
                {formatBangkok(trip.startAt)}
                <span className="mx-1.5 text-fg-hint">—</span>
                {formatBangkok(trip.endAt)}
              </dd>
            </div>
            {trip.meetPoint?.trim() ? (
              <div className="py-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-fg-muted">📍 จุดนัดพบ</dt>
                <dd className="mt-1 whitespace-pre-wrap leading-relaxed text-fg">{trip.meetPoint.trim()}</dd>
              </div>
            ) : null}
            {trip.packingList?.trim() ? (
              <div className="py-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-fg-muted">🎒 สิ่งที่ต้องเตรียม</dt>
                <dd className="mt-2">
                  <ul className="space-y-1">
                    {trip.packingList.trim().split("\n").filter(Boolean).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-fg">
                        <span className="mt-0.5 shrink-0 font-medium text-fg-hint">–</span>
                        <span>{item.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ) : null}
            {trip.policyNotes?.trim() ? (
              <div className="py-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-fg-muted">📋 นโยบาย / ข้อควรทราบ</dt>
                <dd className="mt-1 whitespace-pre-wrap leading-relaxed text-fg-muted">{trip.policyNotes.trim()}</dd>
              </div>
            ) : null}
          </dl>
          {trip.groupUrl?.trim() ? (
            <a
              href={trip.groupUrl.trim()}
              target="_blank"
              rel="noreferrer noopener"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-mid active:scale-[0.98]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0" aria-hidden>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              เข้ากลุ่มทริป
            </a>
          ) : null}
          <div className="rounded-lg border border-border bg-canvas-muted/40 px-4 py-3 text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">ติดต่อผู้จัดทริป</p>
            <p className="mt-1 font-semibold text-fg">{trip.organizer.name}</p>
            {(trip.organizer.phone || trip.organizer.socialLine) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {trip.organizer.phone ? (
                  <a
                    href={`tel:${trip.organizer.phone}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 font-medium text-fg hover:bg-canvas transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0 text-fg-muted" aria-hidden>
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.6 4.87 2 2 0 0 1 3.58 2.5h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 10.1a16 16 0 0 0 6 6l1.06-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 17z"/>
                    </svg>
                    {trip.organizer.phone}
                  </a>
                ) : null}
                {trip.organizer.socialLine?.trim() ? (
                  <a
                    href={trip.organizer.socialLine.trim().startsWith("http") ? trip.organizer.socialLine.trim() : `https://line.me/ti/p/~${trip.organizer.socialLine.trim()}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#06C755]/30 bg-[#06C755]/10 px-3 py-2 font-medium text-[#06C755] hover:bg-[#06C755]/20 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4 shrink-0" aria-hidden>
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.070 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                    </svg>
                    แอด LINE
                  </a>
                ) : null}
              </div>
            )}
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
