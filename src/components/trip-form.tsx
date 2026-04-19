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

type OrganizerProfileDefaults = { bio: string; avatarUrl: string };

type TripWithOrganizer = Trip & {
  organizer?: { bio: string; avatarUrl: string | null } | null;
};

type Props =
  | { mode: "create"; organizerDefaults: OrganizerProfileDefaults }
  | {
      mode: "edit";
      tripId: string;
      trip: TripWithOrganizer;
      locked: boolean;
    };

export function TripForm(props: Props) {
  const router = useRouter();
  const orgDefaults =
    props.mode === "create"
      ? props.organizerDefaults
      : {
          bio: props.trip.organizer?.bio ?? "",
          avatarUrl: props.trip.organizer?.avatarUrl ?? "",
        };

  const defaults =
    props.mode === "create"
      ? {
          title: "",
          shortDescription: "",
          coverImageUrl: "",
          galleryImageUrls: "",
          organizerBio: orgDefaults.bio,
          organizerAvatarUrl: orgDefaults.avatarUrl,
          description: "",
          guideDetails: "",
          itinerary: "",
          meetPoint: "",
          travelNotes: "",
          highlights: "",
          packingList: "",
          safetyNotes: "",
          guideProvides: "",
          ...defaultWeekAhead(),
          maxParticipants: 8,
          pricePerPerson: 1500,
          bookingClosesAt: "",
          policyNotes: "",
        }
      : {
          title: props.trip.title,
          shortDescription: props.trip.shortDescription,
          coverImageUrl: props.trip.coverImageUrl ?? "",
          galleryImageUrls: props.trip.galleryImageUrls ?? "",
          organizerBio: orgDefaults.bio,
          organizerAvatarUrl: orgDefaults.avatarUrl,
          description: props.trip.description,
          guideDetails: props.trip.guideDetails ?? "",
          itinerary: props.trip.itinerary ?? "",
          meetPoint: props.trip.meetPoint,
          travelNotes: props.trip.travelNotes ?? "",
          highlights: props.trip.highlights ?? "",
          packingList: props.trip.packingList ?? "",
          safetyNotes: props.trip.safetyNotes ?? "",
          guideProvides: props.trip.guideProvides ?? "",
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
    <form action={formAction} className="space-y-6">
      {state && "error" in state && state.error ? (
        <p className="jad-alert-error">{state.error}</p>
      ) : null}

      <div className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-wide text-brand">ข้อมูลหลัก</p>
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
      </div>

      <div className="space-y-4 border-t border-border pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-brand">รูปภาพทริป</p>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
            URL รูปหน้าปก (https://…)
          </label>
          <input
            name="coverImageUrl"
            type="text"
            inputMode="url"
            placeholder="https://"
            defaultValue={defaults.coverImageUrl}
            className="jad-input mt-1"
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
            รูปเพิ่มเติม — วาง URL ทีละบรรทัด
          </label>
          <textarea
            name="galleryImageUrls"
            rows={4}
            placeholder={"https://…\nhttps://…"}
            defaultValue={defaults.galleryImageUrls}
            className="jad-input mt-1 min-h-[100px] resize-y"
          />
        </div>
      </div>

      <div className="space-y-4 border-t border-border pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-brand">
          การ์ดโปรไฟล์ผู้จัด (ใช้กับทุกทริปของคุณ)
        </p>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
            URL รูปโปรไฟล์
          </label>
          <input
            name="organizerAvatarUrl"
            type="text"
            inputMode="url"
            placeholder="https://"
            defaultValue={defaults.organizerAvatarUrl}
            className="jad-input mt-1"
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
            แนะนำตัว / ประสบการณ์นำทริป
          </label>
          <textarea
            name="organizerBio"
            rows={3}
            defaultValue={defaults.organizerBio}
            className="jad-input mt-1 min-h-[72px] resize-y"
          />
        </div>
      </div>

      <div className="space-y-4 border-t border-border pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-brand">รายละเอียดทริป</p>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
            ภาพรวมทริป
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
            รายละเอียดไกด์ / ทีมงาน
          </label>
          <textarea
            name="guideDetails"
            rows={4}
            placeholder="ประสบการณ์ ใบรับรอง หรือสไตล์การนำทริป"
            defaultValue={defaults.guideDetails}
            className="jad-input mt-1 min-h-[96px] resize-y"
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
            กำหนดการเดินทาง
          </label>
          <textarea
            name="itinerary"
            rows={5}
            placeholder={"05:30 รวมกลุ่ม\n07:00 ถึงจุดแรก …"}
            defaultValue={defaults.itinerary}
            className="jad-input mt-1 min-h-[120px] resize-y"
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
            จุดนัดพบครั้งแรก / จุดรวมกลุ่ม
          </label>
          <input
            name="meetPoint"
            required
            defaultValue={defaults.meetPoint}
            className="jad-input mt-1"
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
            การเดินทาง
          </label>
          <textarea
            name="travelNotes"
            rows={3}
            placeholder="รถตู้ / รถส่วนตัว / จุดจอดรถ"
            defaultValue={defaults.travelNotes}
            className="jad-input mt-1 min-h-[72px] resize-y"
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
            จุดเด่น · สิ่งที่จะได้เจอ · จุดหมาย
          </label>
          <textarea
            name="highlights"
            rows={4}
            defaultValue={defaults.highlights}
            className="jad-input mt-1 min-h-[96px] resize-y"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
              สิ่งที่ต้องเตรียม
            </label>
            <textarea
              name="packingList"
              rows={4}
              defaultValue={defaults.packingList}
              className="jad-input mt-1 min-h-[96px] resize-y"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
              สิ่งที่ต้องระวัง (ทาก ฝน อากาศ ฯลฯ)
            </label>
            <textarea
              name="safetyNotes"
              rows={4}
              defaultValue={defaults.safetyNotes}
              className="jad-input mt-1 min-h-[96px] resize-y"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
            สิ่งที่ไกด์เตรียมให้
          </label>
          <textarea
            name="guideProvides"
            rows={3}
            placeholder="อาหารว่าง น้ำดื่ม ปฐมพยาบาลเบื้องต้น …"
            defaultValue={defaults.guideProvides}
            className="jad-input mt-1 min-h-[72px] resize-y"
          />
        </div>
      </div>

      <div className="space-y-4 border-t border-border pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-brand">วันเวลาและจำนวนที่นั่ง</p>
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
              จำนวนผู้เข้าร่วมสูงสุด
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
      </div>

      {!locked ? (
        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row">
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
        <div className="border-t border-border pt-4">
          <button
            type="submit"
            name="intent"
            value="publish"
            disabled={pending}
            className="jad-btn-primary h-12 w-full"
          >
            บันทึกรายละเอียดที่แก้ได้
          </button>
        </div>
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
