"use client";

import Link from "next/link";
import { useActionState, useEffect, useId, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Trip } from "@prisma/client";
import {
  createTrip,
  updateTrip,
  type TripActionState,
} from "@/app/actions/trips";
import { toDatetimeLocalValueBangkok } from "@/lib/datetime";
import {
  ORGANIZER_IMAGE_ACCEPT,
  uploadOrganizerImageFile,
} from "@/lib/organizer-upload-image";
import type { GuideSearchResult } from "@/app/actions/guide-search";
import { TripDestinationPicker } from "@/components/trip-destination-picker";
import { TripMeetPointPicker } from "@/components/trip-meet-point-picker";
import { TripItineraryBuilder } from "@/components/trip-itinerary-builder";
import { TripGuidePicker } from "@/components/trip-guide-picker";
import { TripTravelNotesField } from "@/components/trip-travel-notes-field";
import { BulletLinesField } from "@/components/bullet-lines-field";
import type { NewTripDemoPrefill } from "@/lib/demo-new-trip-prefill";

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

/** ข้อมูลการ์ดผู้จัดบนหน้าทริป — แก้ที่หน้าโปรไฟล์เท่านั้น */
type OrganizerProfilePreview = {
  userId: string;
  name: string;
  bio: string;
  avatarUrl: string;
};

type TripWithOrganizer = Trip & {
  organizer?: {
    id: string;
    name: string;
    bio: string;
    avatarUrl: string | null;
  } | null;
  guide?: GuideSearchResult | null;
};

type Props =
  | {
      mode: "create";
      organizerProfile?: OrganizerProfilePreview | null;
      /** เติมฟอร์มตัวอย่าง (เช่น ล็อกอิน demo-organizer) */
      demoTripPrefill?: NewTripDemoPrefill | null;
    }
  | {
      mode: "edit";
      tripId: string;
      trip: TripWithOrganizer;
      locked: boolean;
    };

function FormSection({
  id,
  step,
  title,
  lede,
  underTitle,
  children,
  dense,
}: {
  id?: string;
  step?: number;
  title: string;
  lede?: string;
  /** เนื้อหาใต้หัวข้อหมวด แต่เหนือเส้นแบ่งหลัก — อยู่ในกล่อง section เดียวกับหัวข้อ */
  underTitle?: ReactNode;
  children: ReactNode;
  /** กระชับขึ้น — ใช้หน้าสร้างทริป */
  dense?: boolean;
}) {
  const hasStep = typeof step === "number";
  const shell =
    dense === true
      ? "rounded-xl border border-border/80 bg-linear-to-b from-surface to-canvas/30 p-3 shadow-sm sm:p-4"
      : "rounded-xl border border-border/80 bg-linear-to-b from-surface to-canvas/35 p-4 shadow-sm sm:p-5";
  const bodyPad = hasStep ? (dense ? "sm:pl-9" : "sm:pl-12") : "";
  const bodyGap = dense ? "space-y-2.5 sm:space-y-3" : "space-y-5";
  return (
    <section id={id} className={dense ? "scroll-mt-24" : "scroll-mt-28"}>
      <div className={shell}>
        <div className={`flex items-start ${dense ? "gap-2" : "gap-3"}`}>
          {hasStep ? (
            <span
              className={
                dense
                  ? "flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-light text-xs font-bold text-brand shadow-sm"
                  : "flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-light text-sm font-bold text-brand shadow-sm"
              }
              aria-hidden
            >
              {step}
            </span>
          ) : null}
          <div className={`min-w-0 flex-1 ${dense ? "" : "pt-0.5"}`}>
            <h2
              className={
                dense
                  ? "text-sm font-semibold tracking-tight text-fg"
                  : "text-base font-semibold tracking-tight text-fg"
              }
            >
              {title}
            </h2>
            {lede ? (
              <p
                className={
                  dense
                    ? "mt-1 text-[11px] leading-snug text-fg-muted"
                    : "mt-1.5 text-sm leading-relaxed text-fg-muted"
                }
              >
                {lede}
              </p>
            ) : null}
          </div>
        </div>
        {underTitle ? (
          <div className={dense ? "mt-3 min-w-0" : "mt-4 min-w-0"}>{underTitle}</div>
        ) : null}
        <div
          className={`border-t border-border/60 ${dense ? "mt-3 pt-3" : "mt-4 pt-4"} ${bodyPad} ${bodyGap}`}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

function FieldRow({
  label,
  hint,
  optional,
  controlId,
  children,
  dense,
}: {
  label: string;
  hint?: string;
  optional?: boolean;
  controlId: string;
  children: ReactNode;
  dense?: boolean;
}) {
  return (
    <div className={dense ? "space-y-1.5" : "space-y-2"}>
      <label
        htmlFor={controlId}
        className={
          dense
            ? "block text-xs font-medium text-fg sm:text-sm"
            : "block text-sm font-medium text-fg"
        }
      >
        {label}
        {optional ? (
          <span className="ml-1.5 text-[11px] font-normal text-fg-hint sm:text-xs">
            ไม่บังคับ
          </span>
        ) : null}
      </label>
      {hint ? (
        <p
          id={`${controlId}-hint`}
          className={
            dense
              ? "text-[11px] leading-snug text-fg-muted"
              : "text-xs leading-relaxed text-fg-muted"
          }
        >
          {hint}
        </p>
      ) : null}
      <div className="[&_.jad-input]:mt-0">{children}</div>
    </div>
  );
}

function organizerPreviewFromProps(props: Props): OrganizerProfilePreview {
  const empty: OrganizerProfilePreview = {
    userId: "",
    name: "",
    bio: "",
    avatarUrl: "",
  };
  if (props.mode === "create") {
    const p = props.organizerProfile;
    if (!p) return empty;
    return {
      userId: p.userId ?? "",
      name: p.name ?? "",
      bio: p.bio ?? "",
      avatarUrl: p.avatarUrl ?? "",
    };
  }
  return {
    userId: props.trip.organizer?.id ?? props.trip.organizerId ?? "",
    name: props.trip.organizer?.name ?? "ผู้จัด",
    bio: props.trip.organizer?.bio ?? "",
    avatarUrl: props.trip.organizer?.avatarUrl ?? "",
  };
}

export function TripForm(props: Props) {
  const router = useRouter();
  const organizerPreview = organizerPreviewFromProps(props);

  const demoFill = props.mode === "create" ? props.demoTripPrefill : null;
  const demoRest = demoFill
    ? (({ guide, ...r }: NewTripDemoPrefill) => (void guide, r))(demoFill)
    : null;

  const defaults =
    props.mode === "create"
      ? {
          title: "",
          shortDescription: "",
          coverImageUrl: "",
          galleryImageUrls: "",
          description: "",
          guideDetails: "",
          itinerary: "",
          meetPoint: "",
          meetPointLat: null as number | null,
          meetPointLng: null as number | null,
          destinationName: "",
          destinationLat: null as number | null,
          destinationLng: null as number | null,
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
          ...(demoRest ?? {}),
        }
      : {
          title: props.trip.title,
          shortDescription: props.trip.shortDescription,
          coverImageUrl: props.trip.coverImageUrl ?? "",
          galleryImageUrls: props.trip.galleryImageUrls ?? "",
          description: props.trip.description,
          guideDetails: props.trip.guideDetails ?? "",
          itinerary: props.trip.itinerary ?? "",
          meetPoint: props.trip.meetPoint,
          meetPointLat: props.trip.meetPointLat ?? null,
          meetPointLng: props.trip.meetPointLng ?? null,
          destinationName: props.trip.destinationName ?? "",
          destinationLat: props.trip.destinationLat ?? null,
          destinationLng: props.trip.destinationLng ?? null,
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
  const fid = useId();
  /** ฟอร์มกระชับทั้งสร้างและแก้ไข (เลย์เอาต์เดียวกับหน้าสร้างทริป) */
  const dense = true;

  const [coverUrl, setCoverUrl] = useState(
    () => defaults.coverImageUrl,
  );
  const [galleryLines, setGalleryLines] = useState(() =>
    defaults.galleryImageUrls
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
  );
  const [coverBusy, setCoverBusy] = useState(false);
  const [galleryBusy, setGalleryBusy] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(
    null,
  );

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
    <form
      action={formAction}
      className={`${dense ? "space-y-5" : "space-y-8"} ${!locked ? "pb-[calc(6rem+env(safe-area-inset-bottom,0px))] sm:pb-0" : ""}`}
      aria-busy={pending}
    >
      {state && "error" in state && state.error ? (
        <p className="jad-alert-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <FormSection
        id="trip-section-core"
        dense={dense}
        title="ชื่อและคำโปรย"
        lede={
          dense
            ? undefined
            : "สิ่งแรกที่ผู้จองเห็นในรายการ — เขียนให้ชัดว่าไปไหน ได้อะไร"
        }
      >
        <FieldRow
          dense={dense}
          label="ชื่อทริป"
          hint={
            dense
              ? undefined
              : "เช่น «ดอยอินทนนท์ 1 วัน — รวมรถไป–กลับ»"
          }
          controlId={`${fid}-title`}
        >
          <input
            id={`${fid}-title`}
            name="title"
            required
            readOnly={locked}
            defaultValue={defaults.title}
            autoComplete="off"
            placeholder={
              dense
                ? "เช่น ดอยอินทนนท์ 1 วัน — รวมรถไป–กลับ"
                : "ชื่อที่บอกจุดหมายและจุดเด่นสั้น ๆ"
            }
            className="jad-input read-only:bg-canvas read-only:text-fg-muted"
          />
        </FieldRow>
        <FieldRow
          dense={dense}
          label="คำโปรยสั้น"
          hint={
            dense
              ? undefined
              : "ประมาณ 1–2 ประโยค ไม่เกินบรรทัดเดียวบนมือถือจะอ่านง่าย"
          }
          controlId={`${fid}-short`}
        >
          <input
            id={`${fid}-short`}
            name="shortDescription"
            required
            defaultValue={defaults.shortDescription}
            autoComplete="off"
            placeholder="สรุปใจความสำคัญของทริป"
            className="jad-input"
          />
        </FieldRow>
      </FormSection>

      <FormSection
        id="trip-section-story"
        dense={dense}
        title="เล่าเรื่องทริป"
        lede={
          dense
            ? undefined
            : "ข้อมูลนี้แสดงบนหน้ารายละเอียด — ยิ่งชัด ผู้จองยิ่งมั่นใจ"
        }
        underTitle={
          <FieldRow
            dense={dense}
            label="ภาพรวมทริป"
            hint={
              dense
                ? undefined
                : "อธิบายว่าทำอะไรบ้าง ใครเหมาะกับทริปนี้ และสิ่งที่ได้รับ"
            }
            controlId={`${fid}-description`}
          >
            <textarea
              id={`${fid}-description`}
              name="description"
              required
              rows={dense ? 5 : 6}
              defaultValue={defaults.description}
              placeholder={
                dense
                  ? "กิจกรรมหลัก ระดับความเหนื่อย รวม/ไม่รวมอะไรบ้าง"
                  : "เช่น ลำดับวันโดยย่อ กิจกรรมหลัก ระดับความเหนื่อย หรือสิ่งที่รวม/ไม่รวม"
              }
              className={`jad-input resize-y ${dense ? "min-h-[120px]" : "min-h-[140px]"}`}
            />
          </FieldRow>
        }
      >
        <div className={dense ? "space-y-3" : "space-y-5"}>
            <input type="hidden" name="guideDetails" defaultValue={defaults.guideDetails} />
            <FieldRow
              dense={dense}
              label="การเดินทางระหว่างทริป"
              optional
              controlId={`${fid}-travel`}
            >
              <TripTravelNotesField
                formInputId={`${fid}-travel`}
                defaultValue={defaults.travelNotes}
                dense={dense}
              />
            </FieldRow>
            <FieldRow
              dense={dense}
              label="รวมในราคา · ค่าใช้จ่ายเพิ่ม"
              hint={
                dense
                  ? undefined
                  : "เช่น หัวข้อ 'รวม' กับ 'ไม่รวม / จ่ายเอง' แยกย่อหน้า หรือใช้ bullet — ชัดเท่าที่จำเป็น ไม่ต้องยาวมาก"
              }
              optional
              controlId={`${fid}-highlights`}
            >
              <BulletLinesField
                name="highlights"
                baseId={`${fid}-highlights`}
                defaultValue={defaults.highlights}
                dense={dense}
                addLabel="เพิ่มข้อ"
                rowPlaceholder="เช่น รวม: ที่พัก 4 คืน — หรือ ไม่รวม: ตั๋วเครื่องบิน"
              />
            </FieldRow>
            <div className={dense ? "grid gap-3 sm:grid-cols-2" : "grid gap-5 sm:grid-cols-2"}>
              <FieldRow
                dense={dense}
                label="ของที่ควรเตรียม"
                optional
                controlId={`${fid}-pack`}
              >
                <BulletLinesField
                  name="packingList"
                  baseId={`${fid}-pack`}
                  defaultValue={defaults.packingList}
                  dense={dense}
                  addLabel="เพิ่มข้อ"
                  rowPlaceholder="เช่น รองเท้าเดินป่า หมวก ยาเฉพาะตัว"
                />
              </FieldRow>
              <FieldRow
                dense={dense}
                label="ข้อควรระวัง"
                hint={dense ? undefined : "ทางชัน แดดจัด ฝน อากาศ หรือข้อจำกัดด้านสุขภาพ"}
                optional
                controlId={`${fid}-safety`}
              >
                <BulletLinesField
                  name="safetyNotes"
                  baseId={`${fid}-safety`}
                  defaultValue={defaults.safetyNotes}
                  dense={dense}
                  addLabel="เพิ่มข้อ"
                  rowPlaceholder="เช่น ทางชัน แดดจัด — หรือ โรคประจำตัวที่ควรแจ้ง"
                />
              </FieldRow>
            </div>
            <FieldRow
              dense={dense}
              label="สิ่งที่ทีมงานจัดให้"
              hint={dense ? undefined : "เช่น น้ำดื่ม อาหารว่าง ชุดปฐมพยาบาลเบื้องต้น"}
              optional
              controlId={`${fid}-provides`}
            >
              <BulletLinesField
                name="guideProvides"
                baseId={`${fid}-provides`}
                defaultValue={defaults.guideProvides}
                dense={dense}
                addLabel="เพิ่มข้อ"
                rowPlaceholder="เช่น น้ำดื่ม อาหารว่าง ปฐมพยาบาลเบื้องต้น"
              />
            </FieldRow>
        </div>
      </FormSection>

      <FormSection
        id="trip-section-itinerary"
        dense={dense}
        title="กำหนดการ (ไทม์ไลน์)"
        lede={
          dense
            ? "ไม่บังคับ — เพิ่มวันแล้วใส่ช่วงเวลากับกิจกรรม"
            : "ไม่บังคับ — กด «เพิ่มวัน» แล้วใส่หัวข้อวัน ในแต่ละวันกด «เพิ่มช่วงเวลา» แล้วกรอกเวลากับรายละเอียดทีละช่วง"
        }
      >
        <TripItineraryBuilder
          name="itinerary"
          formInputId={`${fid}-itinerary`}
          defaultValue={defaults.itinerary}
          dense={!!dense}
        />
      </FormSection>

      <FormSection
        id="trip-section-meet"
        dense={dense}
        title="จุดนัดพบ / จุดรวมกลุ่ม"
        lede={
          dense
            ? "ค้นหาบนแผนที่หรือพิมพ์รายละเอียดด้านล่าง"
            : "ค้นหาบนแผนที่เพื่อตั้งจุดเช็คอิน แล้วแก้ข้อความด้านล่างให้ชัด — หรือพิมพ์เองทั้งหมดก็ได้"
        }
      >
        <TripMeetPointPicker
          fid={fid}
          dense={dense}
          formInputId={`${fid}-meet`}
          defaultMeetPoint={defaults.meetPoint}
          defaultLat={defaults.meetPointLat}
          defaultLng={defaults.meetPointLng}
          locked={locked}
        />
      </FormSection>

      <FormSection
        id="trip-section-destination"
        dense={dense}
        title="จุดหมายปลายทาง"
        lede={
          dense
            ? "ไม่บังคับ — พิมพ์ชื่อสถานที่แล้วเลือกจากรายการ (OpenStreetMap)"
            : "ไม่บังคับ — พิมพ์ชื่อสถานที่แล้วเลือกจากรายการ ข้อมูลจาก OpenStreetMap"
        }
      >
        <TripDestinationPicker
          dense={dense}
          fid={fid}
          hideHeading
          defaultName={defaults.destinationName}
          defaultLat={defaults.destinationLat}
          defaultLng={defaults.destinationLng}
        />
      </FormSection>

      <FormSection
        id="trip-section-media"
        dense={dense}
        title="รูปหน้าปกและแกลเลอรี"
        lede={
          dense
            ? undefined
            : "รูปชัด แสงดี ช่วยให้ทริปโดดเด่น — อัปโหลดจากเครื่อง (JPEG / PNG / WebP / GIF ไม่เกิน 5 MB)"
        }
      >
        {imageUploadError ? (
          <p className="text-sm font-medium text-red-600 dark:text-red-400" role="status">
            {imageUploadError}
          </p>
        ) : null}
        <input type="hidden" name="coverImageUrl" value={coverUrl} readOnly />
        <input
          type="hidden"
          name="galleryImageUrls"
          value={galleryLines.join("\n")}
          readOnly
        />
        <div className={dense ? "space-y-1.5" : "space-y-2"}>
          <label
            htmlFor={`${fid}-cover`}
            className={dense ? "text-xs font-medium text-fg sm:text-sm" : "text-sm font-medium text-fg"}
          >
            รูปหน้าปก
            {dense ? (
              <span className="ml-1.5 font-normal text-fg-hint">ไม่บังคับ</span>
            ) : null}
          </label>
          {!dense ? (
            <p id={`${fid}-cover-hint`} className="text-xs leading-relaxed text-fg-muted">
              แนะนำภาพแนวนอนหรือสี่เหลี่ยมจัตุรัส — ไม่บังคับ แต่มีรูปจะดึงดูดผู้จองมากขึ้น
            </p>
          ) : (
            <p id={`${fid}-cover-hint`} className="sr-only">
              อัปโหลดรูปหน้าปก ไม่บังคับ รองรับ JPEG PNG WebP GIF ไม่เกิน 5 MB
            </p>
          )}
          {coverUrl ? (
            <div className="relative mt-1 inline-block max-w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverUrl}
                alt=""
                className={`${dense ? "max-h-36" : "max-h-48"} max-w-full rounded-lg border border-border object-contain shadow-sm`}
              />
            </div>
          ) : null}
          <input
            id={`${fid}-cover`}
            type="file"
            accept={ORGANIZER_IMAGE_ACCEPT}
            disabled={pending || coverBusy || locked}
            aria-describedby={`${fid}-cover-hint`}
            className="jad-input file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-brand-mid"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              setImageUploadError(null);
              setCoverBusy(true);
              try {
                const url = await uploadOrganizerImageFile(f);
                setCoverUrl(url);
              } catch (err) {
                setImageUploadError(
                  err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ",
                );
              } finally {
                setCoverBusy(false);
              }
            }}
          />
          {coverBusy ? (
            <p className="text-xs text-fg-muted">กำลังอัปโหลดรูปหน้าปก…</p>
          ) : null}
          {coverUrl && !locked ? (
            <button
              type="button"
              className="text-xs font-medium text-brand hover:text-brand-mid"
              onClick={() => {
                setCoverUrl("");
                setImageUploadError(null);
              }}
            >
              ลบรูปหน้าปก
            </button>
          ) : null}
        </div>
        <div className={`space-y-2 border-t border-border/70 ${dense ? "pt-3" : "pt-5"}`}>
          <label
            htmlFor={`${fid}-gallery`}
            className={dense ? "text-xs font-medium text-fg sm:text-sm" : "text-sm font-medium text-fg"}
          >
            แกลลอรี่
            <span className="ml-1.5 text-[11px] font-normal text-fg-hint sm:text-xs">ไม่บังคับ</span>
          </label>
          <p id={`${fid}-gallery-hint`} className={dense ? "sr-only" : "text-xs leading-relaxed text-fg-muted"}>
            {dense
              ? "เลือกหลายไฟล์ แสดงเป็นสไลด์บนหน้าทริป"
              : "เลือกได้หลายไฟล์ในครั้งเดียว — แสดงเป็นสไลด์บนหน้าทริป"}
          </p>
          {galleryLines.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {galleryLines.map((url, i) => (
                <li
                  key={`${url}-${i}`}
                  className="relative h-21 w-21 shrink-0 overflow-hidden rounded-lg border border-border shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    className="absolute right-0.5 top-0.5 flex size-8 items-center justify-center rounded-full border border-white/30 bg-black/70 text-lg font-light leading-none text-white shadow-sm backdrop-blur-[2px] transition-colors hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mid/40"
                    aria-label={`ลบรูปนี้ออกจากแกลเลอรี (ลำดับที่ ${i + 1})`}
                    title="ลบรูปนี้"
                    onClick={() =>
                      setGalleryLines((prev) => prev.filter((_, j) => j !== i))
                    }
                  >
                    <span aria-hidden className="translate-y-[-0.5px]">
                      ×
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <input
            id={`${fid}-gallery`}
            type="file"
            accept={ORGANIZER_IMAGE_ACCEPT}
            multiple
            disabled={pending || galleryBusy}
            aria-describedby={`${fid}-gallery-hint`}
            className="jad-input file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-brand-mid"
            onChange={async (e) => {
              const list = e.target.files;
              e.target.value = "";
              if (!list?.length) return;
              setImageUploadError(null);
              setGalleryBusy(true);
              try {
                const next: string[] = [];
                for (const f of list) {
                  next.push(await uploadOrganizerImageFile(f));
                }
                setGalleryLines((prev) => [...prev, ...next]);
              } catch (err) {
                setImageUploadError(
                  err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ",
                );
              } finally {
                setGalleryBusy(false);
              }
            }}
          />
          {galleryBusy ? (
            <p className="text-xs text-fg-muted">กำลังอัปโหลดแกลลอรี่…</p>
          ) : null}
        </div>
      </FormSection>

      <FormSection
        id="trip-section-people"
        dense={dense}
        title="ผู้จัดและไกด์"
        lede={
          dense
            ? undefined
            : "การ์ดผู้จัดดึงจากโปรไฟล์ — ไกด์ช่วยให้ทีมงานชัดบนหน้าทริป"
        }
      >
        <div>
          <p className={dense ? "text-xs font-medium text-fg sm:text-sm" : "text-sm font-medium text-fg"}>
            การ์ดผู้จัด
            {dense ? (
              <>
                {" "}
                <Link
                  href="/organizer/profile"
                  className="font-normal text-brand underline-offset-2 hover:text-brand-mid hover:underline"
                >
                  แก้ที่โปรไฟล์
                </Link>
              </>
            ) : null}
          </p>
          {!dense ? (
            <p className="mt-1 text-xs leading-relaxed text-fg-muted">
              รูปและข้อความแนะนำตัวมาจาก{" "}
              <Link
                href="/organizer/profile"
                className="font-medium text-brand underline-offset-2 hover:text-brand-mid hover:underline"
              >
                โปรไฟล์บัญชีของคุณ
              </Link>{" "}
              (ใช้ร่วมทุกทริป)
            </p>
          ) : null}
          <div
            className={
              dense
                ? "mt-2 flex gap-2.5 rounded-lg border border-border/80 bg-surface p-2.5 shadow-sm"
                : "mt-3 flex gap-3 rounded-xl border border-border/90 bg-surface p-3.5 shadow-sm"
            }
          >
            <div
              className={
                dense
                  ? "relative size-11 shrink-0 overflow-hidden rounded-lg border border-brand-light bg-brand-light"
                  : "relative size-14 shrink-0 overflow-hidden rounded-xl border border-brand-light bg-brand-light"
              }
            >
              {organizerPreview.avatarUrl?.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={organizerPreview.avatarUrl.trim()}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center px-1 text-center text-[10px] text-fg-hint">
                  ยังไม่มีรูป
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className={dense ? "text-xs font-semibold text-fg sm:text-sm" : "text-sm font-semibold text-fg"}>
                {organizerPreview.name}
              </p>
              <p
                className={
                  dense
                    ? "mt-0.5 line-clamp-2 text-[11px] leading-snug text-fg-muted"
                    : "mt-1 line-clamp-3 text-xs leading-relaxed text-fg-muted"
                }
              >
                {organizerPreview.bio?.trim()
                  ? organizerPreview.bio.trim()
                  : "— ยังไม่มีแนะนำตัวในโปรไฟล์"}
              </p>
              {!dense ? (
                <p className="mt-2 break-all font-mono text-[10px] leading-snug text-fg-hint">
                  รหัสผู้ใช้ (ให้ไกด์ใช้ค้นหา): {organizerPreview.userId || "—"}
                </p>
              ) : organizerPreview.userId ? (
                <p className="mt-1 truncate font-mono text-[10px] text-fg-hint" title={organizerPreview.userId}>
                  ID: {organizerPreview.userId}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className={`space-y-2 border-t border-border/70 ${dense ? "pt-3" : "pt-5"}`}>
          <p className={dense ? "text-xs font-medium text-fg sm:text-sm" : "text-sm font-medium text-fg"}>
            ไกด์ประจำทริป
            <span className="ml-1.5 text-[11px] font-normal text-fg-hint sm:text-xs">ไม่บังคับ</span>
          </p>
          {!dense ? (
            <p className="text-xs leading-relaxed text-fg-muted">
              ไกด์ต้องเปิด «ลงทะเบียนเป็นไกด์» ในโปรไฟล์ก่อน — ค้นจากชื่อหรืออีเมล แล้วเลือกจากรายการ
            </p>
          ) : (
            <p className="text-[11px] leading-snug text-fg-muted">
              ค้นชื่อหรืออีเมล — ไกด์ต้องเปิดโหมดไกด์ในโปรไฟล์
            </p>
          )}
          <TripGuidePicker
            initialGuideUserId={
              props.mode === "edit"
                ? props.trip.guideUserId
                : props.mode === "create" && props.demoTripPrefill
                  ? props.demoTripPrefill.guide.id
                  : null
            }
            initialGuide={
              props.mode === "edit" && props.trip.guide
                ? props.trip.guide
                : props.mode === "create" && props.demoTripPrefill
                  ? props.demoTripPrefill.guide
                  : null
            }
          />
        </div>
      </FormSection>


      <FormSection
        id="trip-section-booking"
        dense={dense}
        title="เวลา ที่นั่ง และราคา"
        lede={
          dense
            ? undefined
            : "เวลาเป็นเขตเวลาไทย — ตรวจให้ตรงกับวันจริงของทริป"
        }
      >
        <div
          className={
            dense
              ? "grid grid-cols-2 gap-3 *:min-w-0"
              : "grid grid-cols-2 gap-4 sm:gap-5 *:min-w-0"
          }
        >
          <FieldRow dense={dense} label="เริ่มทริป" controlId={`${fid}-start`}>
            <input
              id={`${fid}-start`}
              name="startAt"
              type="datetime-local"
              required
              readOnly={locked}
              defaultValue={defaults.startAt}
              className="jad-input read-only:bg-canvas read-only:text-fg-muted"
            />
          </FieldRow>
          <FieldRow dense={dense} label="สิ้นสุดทริป" controlId={`${fid}-end`}>
            <input
              id={`${fid}-end`}
              name="endAt"
              type="datetime-local"
              required
              readOnly={locked}
              defaultValue={defaults.endAt}
              className="jad-input read-only:bg-canvas read-only:text-fg-muted"
            />
          </FieldRow>
        </div>
        <div
          className={
            dense
              ? "grid grid-cols-2 gap-3 *:min-w-0"
              : "grid grid-cols-2 gap-4 sm:gap-5 *:min-w-0"
          }
        >
          <FieldRow dense={dense} label="จำนวนที่นั่งสูงสุด" controlId={`${fid}-maxp`}>
            <input
              id={`${fid}-maxp`}
              name="maxParticipants"
              type="number"
              min={1}
              required
              readOnly={locked}
              defaultValue={defaults.maxParticipants}
              className="jad-input read-only:bg-canvas read-only:text-fg-muted"
            />
          </FieldRow>
          <FieldRow
            dense={dense}
            label="ราคาต่อคน (บาท)"
            hint={dense ? undefined : "ราคาที่ผู้จองเห็นก่อนยืนยันการจอง"}
            controlId={`${fid}-price`}
          >
            <input
              id={`${fid}-price`}
              name="pricePerPerson"
              type="number"
              min={0}
              required
              readOnly={locked}
              defaultValue={defaults.pricePerPerson}
              className="jad-input read-only:bg-canvas read-only:text-fg-muted"
            />
          </FieldRow>
        </div>
        <FieldRow
          dense={dense}
          label="ปิดรับจองล่วงหน้า"
          hint={
            dense
              ? undefined
              : "ถ้าไม่ระบุ จะไม่มีวันปิดรับจองแยกจากนี้ (ยังต้องเป็นทริปที่เผยแพร่และไม่เลยกำหนดอื่นของระบบ)"
          }
          optional
          controlId={`${fid}-closes`}
        >
          <input
            id={`${fid}-closes`}
            name="bookingClosesAt"
            type="datetime-local"
            readOnly={locked}
            defaultValue={defaults.bookingClosesAt}
            className="jad-input read-only:bg-canvas read-only:text-fg-muted"
          />
        </FieldRow>
        <FieldRow
          dense={dense}
          label="นโยบายและการยกเลิก"
          hint={
            dense
              ? undefined
              : "เช่น มัดจำไม่คืนเมื่อยกเลิก ชำระส่วนที่เหลือก่อนเดินทางกี่วัน หรือคืนเงินกี่วันก่อนเริ่ม"
          }
          optional
          controlId={`${fid}-policy`}
        >
          <textarea
            id={`${fid}-policy`}
            name="policyNotes"
            rows={3}
            placeholder="เขียนให้ผู้จองอ่านแล้วเข้าใจสิทธิของตน"
            defaultValue={defaults.policyNotes}
            className="jad-input min-h-[88px] resize-y"
          />
        </FieldRow>
      </FormSection>

      {props.mode === "edit" && !locked && props.trip.status !== "PUBLISHED" ? (
        <p className="text-xs text-fg-hint">
          สถานะปัจจุบัน: {props.trip.status} — กด &quot;เผยแพร่&quot; เพื่อเปิดรับจอง
        </p>
      ) : null}

      {!locked ? (
        <div className="sticky bottom-0 z-20 -mx-5 flex flex-col gap-2.5 border-t border-border/90 bg-surface/95 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] shadow-[0_-10px_28px_rgba(0,0,0,0.06)] backdrop-blur-sm supports-backdrop-filter:bg-surface/85 sm:static sm:z-0 sm:mx-0 sm:flex-row sm:border-t sm:border-border sm:bg-transparent sm:px-0 sm:py-4 sm:shadow-none sm:backdrop-blur-none">
          <button
            type="submit"
            name="intent"
            value="draft"
            disabled={pending}
            className="jad-btn-ghost order-2 h-12 flex-1 sm:order-1 sm:h-11"
          >
            {pending ? "กำลังบันทึก…" : "บันทึกฉบับร่าง"}
          </button>
          <button
            type="submit"
            name="intent"
            value="publish"
            disabled={pending}
            className="jad-btn-primary order-1 h-12 flex-1 sm:order-2 sm:h-11"
          >
            {pending
              ? "กำลังดำเนินการ…"
              : props.mode === "create"
                ? "เผยแพร่ทริป"
                : "บันทึกและเผยแพร่"}
          </button>
        </div>
      ) : (
        <div className="border-t border-border pt-5">
          <button
            type="submit"
            name="intent"
            value="publish"
            disabled={pending}
            className="jad-btn-primary h-12 w-full sm:h-11"
          >
            {pending ? "กำลังบันทึก…" : "บันทึกรายละเอียดที่แก้ได้"}
          </button>
        </div>
      )}
    </form>
  );
}
