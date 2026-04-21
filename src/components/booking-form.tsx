"use client";

import { useActionState, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import {
  createBooking,
  type BookingCreateState,
} from "@/app/actions/bookings";

const initial: BookingCreateState | undefined = undefined;

export function BookingForm({
  tripId,
  pricePerPerson,
  policyNotes,
  tripPageHref,
}: {
  tripId: string;
  pricePerPerson: number;
  policyNotes?: string | null;
  tripPageHref?: string;
}) {
  const id = useId();
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

      <div className="rounded-lg border border-border bg-canvas-muted/40 px-4 py-3 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">ราคาต่อคน</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-fg">
          ฿{pricePerPerson.toLocaleString("th-TH")}
        </p>
      </div>

      <div>
        <label
          htmlFor={`${id}-name`}
          className="block text-xs font-medium uppercase tracking-wide text-fg-muted"
        >
          ชื่อ–นามสกุล
        </label>
        <input
          id={`${id}-name`}
          name="participantName"
          required
          autoComplete="name"
          className="jad-input mt-1"
        />
      </div>
      <div>
        <label
          htmlFor={`${id}-phone`}
          className="block text-xs font-medium uppercase tracking-wide text-fg-muted"
        >
          เบอร์โทร
        </label>
        <input
          id={`${id}-phone`}
          name="participantPhone"
          type="tel"
          required
          autoComplete="tel"
          className="jad-input mt-1"
        />
      </div>

      {policyNotes?.trim() ? (
        <div className="rounded-lg border border-brand/15 bg-brand-light/60 px-3 py-3 text-sm text-fg">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand">
            นโยบายและการยกเลิก
          </p>
          <p className="whitespace-pre-wrap leading-relaxed text-fg-muted">{policyNotes.trim()}</p>
        </div>
      ) : null}

      <label className="flex items-start gap-3 text-sm text-fg-muted">
        <input
          type="checkbox"
          name="acceptTerms"
          required
          className="mt-1 size-4 rounded border-border text-brand focus:ring-brand-mid/30"
        />
        <span>
          ข้าพเจ้ายอมรับข้อกำหนดการจองและนโยบายการยกเลิกของทริปนี้
          {tripPageHref ? (
            <>
              {" "}
              <a
                href={tripPageHref}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-brand underline-offset-2 hover:text-brand-mid hover:underline"
              >
                (ดูรายละเอียดทริป)
              </a>
            </>
          ) : null}
        </span>
      </label>
      <button type="submit" disabled={pending} className="jad-btn-primary h-12 w-full text-base">
        {pending ? "กำลังดำเนินการ…" : "ไปขั้นตอนชำระเงิน"}
      </button>
    </form>
  );
}
