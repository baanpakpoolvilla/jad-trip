"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Trip } from "@prisma/client";
import {
  createTrip,
  updateTrip,
  type TripActionState,
} from "@/app/actions/trips";
import { toDatetimeLocalValueBangkok } from "@/lib/datetime";

function defaultWeekAhead() {
  const start = new Date();
  start.setDate(start.getDate() + 7);
  start.setHours(6, 0, 0, 0);
  const end = new Date(start);
  end.setHours(18, 0, 0, 0);
  return {
    startAt: toDatetimeLocalValueBangkok(start),
    endAt: toDatetimeLocalValueBangkok(end),
  };
}

type Props =
  | { mode: "create" }
  | {
      mode: "edit";
      tripId: string;
      trip: Trip;
      locked: boolean;
    };

export function TripForm(props: Props) {
  const router = useRouter();
  const defaults =
    props.mode === "create"
      ? {
          title: "",
          shortDescription: "",
          description: "",
          meetPoint: "",
          ...defaultWeekAhead(),
          maxParticipants: 8,
          pricePerPerson: 1500,
          bookingClosesAt: "",
          policyNotes: "",
        }
      : {
          title: props.trip.title,
          shortDescription: props.trip.shortDescription,
          description: props.trip.description,
          meetPoint: props.trip.meetPoint,
          startAt: toDatetimeLocalValueBangkok(props.trip.startAt),
          endAt: toDatetimeLocalValueBangkok(props.trip.endAt),
          maxParticipants: props.trip.maxParticipants,
          pricePerPerson: props.trip.pricePerPerson,
          bookingClosesAt: props.trip.bookingClosesAt
            ? toDatetimeLocalValueBangkok(props.trip.bookingClosesAt)
            : "",
          policyNotes: props.trip.policyNotes ?? "",
        };

  const locked = props.mode === "edit" && props.locked;

  const action =
    props.mode === "create"
      ? createTrip
      : updateTrip.bind(null, props.tripId);

  const [state, formAction, pending] = useActionState(
    action as (
      p: TripActionState,
      fd: FormData,
    ) => Promise<TripActionState>,
    {} as TripActionState,
  );

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      router.push(
        props.mode === "create" ? "/organizer/trips" : `/organizer/trips/${props.tripId}`,
      );
      router.refresh();
    }
  }, [state, router, props]);

  return (
    <form action={formAction} className="space-y-4">
      {state && "error" in state && state.error ? (
        <p className="jad-alert-error">{state.error}</p>
      ) : null}

      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
          ชื่อทริป
        </label>
        <input
          name="title"
          required
          readOnly={locked}
          defaultValue={defaults.title}
          className="jad-input mt-1 read-only:bg-canvas read-only:text-fg-muted"
        />
      </div>
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
          คำอธิบายสั้น
        </label>
        <input
          name="shortDescription"
          required
          defaultValue={defaults.shortDescription}
          className="jad-input mt-1"
        />
      </div>
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
          รายละเอียด
        </label>
        <textarea
          name="description"
          required
          rows={5}
          defaultValue={defaults.description}
          className="jad-input mt-1 min-h-[120px] resize-y"
        />
      </div>
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
          จุดนัดพบ
        </label>
        <input
          name="meetPoint"
          required
          defaultValue={defaults.meetPoint}
          className="jad-input mt-1"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
            เริ่ม (เวลาไทย)
          </label>
          <input
            name="startAt"
            type="datetime-local"
            required
            readOnly={locked}
            defaultValue={defaults.startAt}
            className="jad-input mt-1 read-only:bg-canvas read-only:text-fg-muted"
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
            สิ้นสุด (เวลาไทย)
          </label>
          <input
            name="endAt"
            type="datetime-local"
            required
            readOnly={locked}
            defaultValue={defaults.endAt}
            className="jad-input mt-1 read-only:bg-canvas read-only:text-fg-muted"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
            จำนวนที่สูงสุด
          </label>
          <input
            name="maxParticipants"
            type="number"
            min={1}
            required
            readOnly={locked}
            defaultValue={defaults.maxParticipants}
            className="jad-input mt-1 read-only:bg-canvas read-only:text-fg-muted"
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
            ราคาต่อคน (บาท)
          </label>
          <input
            name="pricePerPerson"
            type="number"
            min={0}
            required
            readOnly={locked}
            defaultValue={defaults.pricePerPerson}
            className="jad-input mt-1 read-only:bg-canvas read-only:text-fg-muted"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
          ปิดรับจอง (เวลาไทย) — ไม่บังคับ
        </label>
        <input
          name="bookingClosesAt"
          type="datetime-local"
          readOnly={locked}
          defaultValue={defaults.bookingClosesAt}
          className="jad-input mt-1 read-only:bg-canvas read-only:text-fg-muted"
        />
      </div>
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
          ข้อความนโยบาย / การยกเลิก
        </label>
        <textarea
          name="policyNotes"
          rows={3}
          defaultValue={defaults.policyNotes}
          className="jad-input mt-1 min-h-[80px] resize-y"
        />
      </div>

      {!locked ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            name="intent"
            value="draft"
            disabled={pending}
            className="jad-btn-ghost h-12 flex-1 sm:h-auto"
          >
            บันทึกเป็นฉบับร่าง
          </button>
          <button
            type="submit"
            name="intent"
            value="publish"
            disabled={pending}
            className="jad-btn-primary h-12 flex-1 sm:h-auto"
          >
            {props.mode === "create" ? "เผยแพร่ทริป" : "บันทึกและเผยแพร่"}
          </button>
        </div>
      ) : (
        <button
          type="submit"
          name="intent"
          value="publish"
          disabled={pending}
          className="jad-btn-primary h-12 w-full"
        >
          บันทึกรายละเอียดที่แก้ได้
        </button>
      )}

      {props.mode === "edit" &&
      !locked &&
      props.trip.status !== "PUBLISHED" ? (
        <p className="text-xs text-fg-hint">
          สถานะปัจจุบัน: {props.trip.status} — กด &quot;เผยแพร่&quot; เพื่อเปิดรับจอง
        </p>
      ) : null}
    </form>
  );
}
