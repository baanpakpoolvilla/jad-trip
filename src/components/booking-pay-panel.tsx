"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cancelBookingAsParticipant } from "@/app/actions/bookings";

type Props = {
  viewToken: string;
  status: "PENDING_PAYMENT" | "CONFIRMED" | "EXPIRED" | "CANCELLED";
  expiresAtIso: string;
  price: number;
  tripTitle: string;
  /** ตั้ง `STRIPE_SECRET_KEY` บนเซิร์ฟเวอร์ — แสดงปุ่มไป Stripe Checkout */
  stripeCheckoutAvailable: boolean;
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
  status,
  expiresAtIso,
  price,
  tripTitle,
  stripeCheckoutAvailable,
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
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [stripeBusy, setStripeBusy] = useState(false);
  const [cancelErr, setCancelErr] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

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

  async function startStripeCheckout() {
    setStripeError(null);
    setStripeBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ viewToken }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setStripeError(data.error ?? "สร้างลิงก์ชำระเงินไม่สำเร็จ");
        setStripeBusy(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setStripeError("เครือข่ายผิดพลาด");
      setStripeBusy(false);
    }
  }

  async function verifySlip(file: File) {
    setSlipError(null);
    if (file.size > 4 * 1024 * 1024) {
      setSlipError("ไฟล์ใหญ่เกิน 4 MB — ลองบีบอัดรูปหรือใช้ JPEG");
      return;
    }
    setSlipBusy(true);
    try {
      const base64 = await fileToBase64(file);
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
              <span className="font-mono text-base font-semibold tabular-nums">
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
              สแกน QR หรือโอนตามข้อมูลด้านล่าง จากนั้นอัปโหลดสลิป — ระบบตรวจอัตโนมัติผ่าน{" "}
              <a
                href="https://document.easyslip.com/th/"
                className="text-brand hover:text-brand-mid"
                target="_blank"
                rel="noreferrer"
              >
                EasySlip
              </a>{" "}
              เมื่อมีเลขพร้อมเพย์ของผู้จัด
              {stripeCheckoutAvailable
                ? " หรือชำระด้วยบัตรผ่าน Stripe ด้านล่าง"
                : ""}
            </p>
          </div>

          {stripeCheckoutAvailable ? (
            <div className="space-y-2 rounded-lg border border-border bg-surface px-3 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
                ชำระด้วยบัตร / Apple Pay
              </p>
              {stripeError ? <p className="jad-alert-error text-sm">{stripeError}</p> : null}
              <button
                type="button"
                onClick={() => void startStripeCheckout()}
                disabled={stripeBusy}
                className="jad-btn-primary h-11 w-full text-sm disabled:opacity-45"
              >
                {stripeBusy ? "กำลังเปิด Stripe…" : `ไปชำระ ฿${price.toLocaleString("th-TH")} ด้วย Stripe`}
              </button>
              <p className="text-center text-xs text-fg-hint">
                ค่าธรรมเนียมตาม Stripe · กลับมาหน้านี้หลังชำระเพื่อดูสถานะ
              </p>
            </div>
          ) : null}

          {stripeCheckoutAvailable ? (
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center" aria-hidden>
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-canvas-muted/40 px-2 text-fg-muted">หรือโอนในประเทศ</span>
              </div>
            </div>
          ) : null}

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
                  <div className="flex justify-between gap-4">
                    <dt className="text-fg-muted">เลขบัญชี</dt>
                    <dd className="text-right font-mono font-medium tabular-nums text-fg">
                      {payoutBankAccountNumber.trim()}
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
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={slipBusy}
              className="jad-input mt-2 file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-brand-mid"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                await verifySlip(f);
              }}
            />
            {!organizerHasPromptPay ? (
              <p className="mt-2 text-xs text-fg-hint">
                การตรวจสลิปอัตโนมัติต้องมีเลขพร้อมเพย์ของผู้จัด — หากยังไม่มี ให้ส่งสลิปให้ผู้จัดยืนยันด้วยตนเอง
              </p>
            ) : null}
            {slipBusy ? (
              <p className="mt-2 text-xs text-fg-muted">กำลังตรวจสลิป…</p>
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

      {status === "EXPIRED" || status === "CANCELLED" ? (
        <p className="text-center text-sm text-fg-muted">
          {status === "EXPIRED"
            ? "หมดเวลาชำระเงิน — ที่นั่งถูกปล่อยแล้ว"
            : "การจองนี้ถูกยกเลิกแล้ว"}
        </p>
      ) : null}
    </div>
  );
}
