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

export function BookingPayPanel({
  viewToken,
  status,
  expiresAtIso,
  price,
  tripTitle,
}: Props) {
  const router = useRouter();
  const [payError, setPayError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cancelErr, setCancelErr] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const expiresAt =
    status === "PENDING_PAYMENT" ? new Date(expiresAtIso) : null;
  const secondsLeft = useCountdown(expiresAt);

  useEffect(() => {
    if (secondsLeft === 0 && status === "PENDING_PAYMENT") {
      router.refresh();
    }
  }, [secondsLeft, status, router]);

  async function pay() {
    setPayError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ viewToken }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setPayError(data.error ?? "ชำระเงินไม่สำเร็จ");
        setBusy(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setPayError("ไม่ได้รับลิงก์ชำระเงิน");
    } catch {
      setPayError("เครือข่ายผิดพลาด");
    }
    setBusy(false);
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

      {payError ? <p className="jad-alert-error">{payError}</p> : null}

      {status === "PENDING_PAYMENT" && secondsLeft !== null && secondsLeft > 0 ? (
        <button
          type="button"
          onClick={pay}
          disabled={busy}
          className="jad-btn-primary h-14 w-full text-base"
        >
          {busy ? "กำลังเปิดหน้าชำระเงิน…" : `ชำระ ฿${price.toLocaleString("th-TH")}`}
        </button>
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
