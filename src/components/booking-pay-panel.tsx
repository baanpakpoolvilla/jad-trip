"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cancelBookingAsParticipant } from "@/app/actions/bookings";

type Props = {
  viewToken: string;
  tripId: string;
  status: "PENDING_PAYMENT" | "CONFIRMED" | "EXPIRED" | "CANCELLED";
  expiresAtIso: string;
  price: number;
  tripTitle: string;
  /** data URL ของ QR พร้อมเพย์ — สร้างฝั่งเซิร์ฟเวอร์ */
  promptPayQrDataUrl: string | null;
  /** มีเลขพร้อมเพย์ — ใช้สร้าง QR และตรวจสลิปอัตโนมัติ */
  organizerHasPromptPay: boolean;
  /** รูป QR ที่ผู้อัปโหลด (path ใน public) */
  payoutQrImageUrl: string | null;
  payoutBankName: string | null;
  payoutBankAccountName: string | null;
  payoutBankAccountNumber: string | null;
};

function useCountdown(target: Date | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return useMemo(() => {
    if (!target) return null;
    const ms = target.getTime() - now;
    if (ms <= 0) return 0;
    return Math.ceil(ms / 1000);
  }, [target, now]);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result;
      if (typeof r === "string") resolve(r);
      else reject(new Error("อ่านไฟล์ไม่สำเร็จ"));
    };
    reader.onerror = () => reject(new Error("อ่านไฟล์ไม่สำเร็จ"));
    reader.readAsDataURL(file);
  });
}

export function BookingPayPanel({
  viewToken,
  tripId,
  status,
  expiresAtIso,
  price,
  tripTitle,
  promptPayQrDataUrl,
  organizerHasPromptPay,
  payoutQrImageUrl,
  payoutBankName,
  payoutBankAccountName,
  payoutBankAccountNumber,
}: Props) {
  const router = useRouter();
  const [slipError, setSlipError] = useState<string | null>(null);
  const [slipBusy, setSlipBusy] = useState(false);
  const [slipPreviewUrl, setSlipPreviewUrl] = useState<string | null>(null);
  const [cancelErr, setCancelErr] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  async function copyAccountNumber(text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  }

  const hasTransferExtras = Boolean(
    payoutQrImageUrl?.trim() ||
      payoutBankName?.trim() ||
      payoutBankAccountName?.trim() ||
      payoutBankAccountNumber?.trim(),
  );
  const hasAnyPaymentChannel = organizerHasPromptPay || hasTransferExtras;

  const expiresAt =
    status === "PENDING_PAYMENT" ? new Date(expiresAtIso) : null;
  const secondsLeft = useCountdown(expiresAt);

  useEffect(() => {
    if (secondsLeft === 0 && status === "PENDING_PAYMENT") {
      router.refresh();
    }
  }, [secondsLeft, status, router]);

  async function verifySlip(file: File) {
    setSlipError(null);
    if (file.size > 4 * 1024 * 1024) {
      setSlipError("ไฟล์ใหญ่เกิน 4 MB — ลองบีบอัดรูปหรือใช้ JPEG");
      return;
    }
    setSlipBusy(true);
    try {
      const base64 = await fileToBase64(file);
      setSlipPreviewUrl(base64);
      const res = await fetch("/api/bookings/verify-slip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ viewToken, base64 }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setSlipError(data.error ?? "ตรวจสลิปไม่สำเร็จ");
        setSlipBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setSlipError("เครือข่ายผิดพลาด");
    }
    setSlipBusy(false);
  }

  async function cancel() {
    const confirmed = window.confirm(
      "ยืนยันยกเลิกการจองนี้หรือไม่?\n\nหากยกเลิกแล้วอาจต้องจองใหม่ และที่นั่งไม่รับประกันว่าจะว่างอยู่",
    );
    if (!confirmed) return;
    setCancelErr(null);
    setCancelling(true);
    const r = await cancelBookingAsParticipant(viewToken);
    setCancelling(false);
    if ("error" in r) {
      setCancelErr(r.error);
      return;
    }
    router.push(`/trips/${r.tripId}`);
  }

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {status === "PENDING_PAYMENT" && secondsLeft !== null ? (
        <div className="rounded-lg border border-warning/30 bg-warning-light px-4 py-3 text-center text-sm text-warning">
          {secondsLeft > 0 ? (
            <>
              เหลือเวลาชำระ{" "}
              <span className="font-mono text-base font-semibold tabular-nums" suppressHydrationWarning>
                {fmt(secondsLeft)}
              </span>
            </>
          ) : (
            "กำลังตรวจสอบสถานะ…"
          )}
        </div>
      ) : null}

      {status === "PENDING_PAYMENT" && secondsLeft !== null && secondsLeft > 0 ? (
        <div
          className="space-y-4 rounded-xl border border-border bg-canvas-muted/40 p-4"
          data-payment="promptpay-slip"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
              ช่องทางชำระเงิน
            </p>
            <p className="mt-1 text-lg font-semibold text-fg">
              ยอดที่ต้องชำระ ฿{price.toLocaleString("th-TH")}
            </p>
            <p className="mt-1 text-xs text-fg-hint">
              สแกน QR หรือโอนตามข้อมูลด้านล่าง จากนั้นอัปโหลดสลิป
            </p>
          </div>

          {!hasAnyPaymentChannel ? (
            <p className="rounded-lg border border-warning/30 bg-warning-light px-3 py-2 text-sm text-warning">
              ผู้จัดยังไม่ได้ตั้งช่องทางรับเงิน — โปรดติดต่อผู้จัด หรือรีเฟรชหลังผู้จัดบันทึกที่เมนู{" "}
              <span className="font-medium">รับเงิน</span>
            </p>
          ) : null}

          {!organizerHasPromptPay && hasTransferExtras ? (
            <p className="rounded-lg border border-warning/30 bg-warning-light px-3 py-2 text-sm text-warning">
              ผู้จัดยังไม่ได้ตั้งเลขพร้อมเพย์ — การตรวจสลิปอัตโนมัติอาจใช้ไม่ได้จนกว่าจะมีเลขพร้อมเพย์
            </p>
          ) : null}

          {hasTransferExtras ? (
            <div className="space-y-3 rounded-lg border border-border bg-canvas px-3 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
                โอนเข้าบัญชี / QR จากผู้จัด
              </p>
              <dl className="space-y-2 text-sm">
                {payoutBankName?.trim() ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-fg-muted">ธนาคาร</dt>
                    <dd className="text-right font-medium text-fg">{payoutBankName.trim()}</dd>
                  </div>
                ) : null}
                {payoutBankAccountName?.trim() ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-fg-muted">ชื่อบัญชี</dt>
                    <dd className="text-right font-medium text-fg">{payoutBankAccountName.trim()}</dd>
                  </div>
                ) : null}
                {payoutBankAccountNumber?.trim() ? (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-fg-muted">เลขบัญชี</dt>
                    <dd className="flex items-center gap-2">
                      <span className="font-mono font-medium tabular-nums text-fg">
                        {payoutBankAccountNumber.trim()}
                      </span>
                      <button
                        type="button"
                        onClick={() => void copyAccountNumber(payoutBankAccountNumber.trim())}
                        className="shrink-0 rounded-md p-1 text-fg-hint transition-colors hover:bg-canvas hover:text-fg"
                        aria-label="คัดลอกเลขบัญชี"
                      >
                        {copiedAccount ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 text-success" aria-hidden>
                            <path d="M20 6 9 17l-5-5"/>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5" aria-hidden>
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                          </svg>
                        )}
                      </button>
                    </dd>
                  </div>
                ) : null}
              </dl>
              {payoutQrImageUrl?.trim() ? (
                <div className="flex flex-col items-center gap-2 border-t border-border pt-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={payoutQrImageUrl.trim()}
                    alt="QR รับเงินจากผู้จัด"
                    className="size-[220px] rounded-lg border border-border bg-white p-2 object-contain"
                  />
                  <p className="text-center text-xs text-fg-hint">สแกน QR จากผู้จัด (โอนยอดเต็มตามที่แสดง)</p>
                </div>
              ) : null}
            </div>
          ) : null}

          {organizerHasPromptPay && promptPayQrDataUrl ? (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
                พร้อมเพย์ (QR อัตโนมัติ)
              </p>
              <div className="flex flex-col items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={promptPayQrDataUrl}
                  alt="QR พร้อมเพย์"
                  className="size-[220px] rounded-lg border border-border bg-white p-2"
                />
                <p className="text-center text-xs text-fg-hint">
                  สแกน QR ในแอปธนาคารเพื่อโอนยอดเต็มตามที่แสดง
                </p>
              </div>
            </div>
          ) : organizerHasPromptPay && !promptPayQrDataUrl ? (
            <p className="text-center text-sm text-fg-muted">
              สร้าง QR พร้อมเพย์ไม่สำเร็จ — โปรดติดต่อผู้จัด
            </p>
          ) : !hasTransferExtras ? (
            <div className="flex h-[220px] w-full max-w-[220px] flex-col items-center justify-center gap-2 self-center rounded-lg border border-dashed border-border bg-white/60 px-3 text-center text-xs text-fg-muted">
              <span>ยังไม่มี QR พร้อมเพย์</span>
              <span className="text-fg-hint">รอผู้จัดตั้งเลขรับเงินในระบบ</span>
            </div>
          ) : null}

          {slipError ? <p className="jad-alert-error">{slipError}</p> : null}

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
              อัปโหลดสลิปโอนเงิน (JPEG / PNG / WebP)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={slipBusy}
              className="jad-input mt-2 file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-brand-mid"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                setSlipPreviewUrl(null);
                await verifySlip(f);
              }}
            />
            {slipPreviewUrl && !slipBusy ? (
              <div className="mt-3 flex flex-col items-start gap-1">
                <p className="text-[11px] font-medium text-fg-muted">ตัวอย่างสลิปที่อัปโหลด</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slipPreviewUrl}
                  alt="ตัวอย่างสลิป"
                  className="max-h-48 rounded-lg border border-border object-contain shadow-sm"
                />
              </div>
            ) : null}
            {!organizerHasPromptPay ? (
              <p className="mt-2 text-xs text-fg-hint">
                ระบบจะตรวจสลิปผ่าน EasySlip (ความถูกต้องของสลิปและจำนวนเงิน) — ผู้จัดจะได้รับแจ้งเตือนโดยอัตโนมัติ
              </p>
            ) : null}
            {slipBusy ? (
              <p className="mt-2 text-xs text-fg-muted">กำลังตรวจสลิป — อาจใช้เวลาสักครู่…</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {status === "PENDING_PAYMENT" ? (
        <div className="space-y-2">
          {cancelErr ? <p className="text-sm text-danger">{cancelErr}</p> : null}
          <button
            type="button"
            onClick={cancel}
            disabled={cancelling}
            className="jad-btn-ghost w-full py-3 text-sm disabled:opacity-45"
          >
            {cancelling ? "กำลังยกเลิก…" : "ยกเลิกการจอง (ก่อนชำระ)"}
          </button>
        </div>
      ) : null}

      {status === "CONFIRMED" ? (
        <div className="rounded-lg border border-success/25 bg-success-light px-4 py-3 text-center text-sm text-success">
          ชำระเงินเรียบร้อยแล้ว — เก็บลิงก์นี้ไว้เพื่อตรวจสอบ:{" "}
          <span className="font-medium text-fg">{tripTitle}</span>
        </div>
      ) : null}

      {status === "EXPIRED" ? (
        <div className="space-y-3">
          <p className="text-center text-sm text-fg-muted">
            หมดเวลาชำระเงิน — ที่นั่งถูกปล่อยแล้ว
          </p>
          <a
            href={`/trips/${tripId}/book`}
            className="jad-btn-primary flex h-11 w-full items-center justify-center text-sm"
          >
            จองที่นั่งใหม่
          </a>
        </div>
      ) : null}

      {status === "CANCELLED" ? (
        <div className="space-y-3">
          <p className="text-center text-sm text-fg-muted">การจองนี้ถูกยกเลิกแล้ว</p>
          <a
            href={`/trips/${tripId}`}
            className="jad-btn-ghost flex h-11 w-full items-center justify-center text-sm"
          >
            กลับไปดูทริป
          </a>
        </div>
      ) : null}
    </div>
  );
}
