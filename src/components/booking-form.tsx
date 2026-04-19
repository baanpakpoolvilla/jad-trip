"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createBooking,
  type BookingCreateState,
} from "@/app/actions/bookings";

const initial: BookingCreateState | undefined = undefined;

export function BookingForm({ tripId }: { tripId: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createBooking, initial);

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      router.push(`/bookings/${state.viewToken}`);
    }
  }, [state, router]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="tripId" value={tripId} />
      {state && "error" in state ? <p className="jad-alert-error">{state.error}</p> : null}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
          ชื่อ–นามสกุล
        </label>
        <input name="participantName" required autoComplete="name" className="jad-input mt-1" />
      </div>
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
          อีเมล
        </label>
        <input
          name="participantEmail"
          type="email"
          required
          autoComplete="email"
          className="jad-input mt-1"
        />
      </div>
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
          เบอร์โทร
        </label>
        <input
          name="participantPhone"
          type="tel"
          required
          autoComplete="tel"
          className="jad-input mt-1"
        />
      </div>
      <label className="flex items-start gap-3 text-sm text-fg-muted">
        <input
          type="checkbox"
          name="acceptTerms"
          required
          className="mt-1 size-4 rounded border-border text-brand focus:ring-brand-mid/30"
        />
        <span>ข้าพเจ้ายอมรับข้อกำหนดการจองและนโยบายการยกเลิกของทริปนี้</span>
      </label>
      <button type="submit" disabled={pending} className="jad-btn-primary h-12 w-full text-base">
        {pending ? "กำลังดำเนินการ…" : "ไปขั้นตอนชำระเงิน"}
      </button>
    </form>
  );
}
