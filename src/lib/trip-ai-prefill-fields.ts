import {
  ITINERARY_JSON_VERSION,
  serializeItineraryToStorage,
  type TripItineraryDay,
} from "@/lib/trip-itinerary-json";

/** ฟิลด์ที่ฟอร์มสร้างทริปรองรับให้ AI / ภายนอกลงทับค่าเริ่มต้น */
export type TripAiPrefillFields = Partial<{
  title: string;
  shortDescription: string;
  description: string;
  guideDetails: string;
  itinerary: string;
  meetPoint: string;
  destinationName: string;
  travelNotes: string;
  highlights: string;
  packingList: string;
  safetyNotes: string;
  guideProvides: string;
  departureOptions: string;
  startAt: string;
  endAt: string;
  maxParticipants: number;
  pricePerPerson: number;
  bookingClosesAt: string;
  policyNotes: string;
  groupUrl: string;
  coverImageUrl: string;
  galleryImageUrls: string;
}>;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** ถ้าโมเดลห่อชั้นเดียว เช่น { "trip": { ... } } */
function unwrapAiPayload(raw: unknown): Record<string, unknown> {
  if (!isRecord(raw)) return {};
  const keys = Object.keys(raw);
  if (keys.length === 1) {
    const k = keys[0]!;
    const inner = raw[k];
    if (
      ["trip", "data", "fields", "result", "tour", "listing"].includes(k) &&
      isRecord(inner)
    ) {
      return inner;
    }
  }
  return raw;
}

function asTrimmedString(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v === "string") {
    const t = v.trim();
    return t.length ? t : undefined;
  }
  if (typeof v === "number" && Number.isFinite(v)) return String(Math.trunc(v));
  return undefined;
}

function linesToString(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  if (Array.isArray(v)) {
    const t = v.map((s) => String(s).trim()).filter(Boolean);
    return t.length ? t.join("\n") : undefined;
  }
  if (typeof v === "string") {
    const s = v.trim();
    return s.length ? s : undefined;
  }
  return undefined;
}

/** รับ YYYY-MM-DDTHH:mm หรือมีวินาที / ช่องว่างแทน T */
function normalizeDatetimeLocal(v: unknown): string | undefined {
  const s = asTrimmedString(v);
  if (!s) return undefined;
  let t = s.replace(/\s+/, "T");
  const withSecs = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}):\d{2}/.exec(t);
  if (withSecs) t = withSecs[1]!;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(t)) return t;
  return undefined;
}

function asFiniteNumber(v: unknown): number | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.replace(/,/g, "").trim());
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

/** YYYY-MM-DD or YYYY-MM-DDTHH:mm → YYYY-MM-DD */
function toDateOnly(v: unknown): string | undefined {
  const s = asTrimmedString(v);
  if (!s) return undefined;
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(s);
  return m ? m[1] : undefined;
}

/**
 * รับ departureOptions จาก AI ในรูปแบบ:
 *   - [{startDate, endDate, note}]   ← รูปแบบใหม่ที่ขอจาก prompt
 *   - string[] / string              ← ข้อความเดิม (compat)
 * คืนเป็น "YYYY-MM-DD|YYYY-MM-DD|note\n..." ตามที่ DepartureRoundsField ใช้
 */
function normalizeDepartureOptions(v: unknown): string | undefined {
  if (!v) return undefined;

  if (Array.isArray(v)) {
    const lines: string[] = [];
    for (const item of v) {
      if (isRecord(item)) {
        const s = toDateOnly(item.startDate ?? item.start ?? item.startAt);
        const e = toDateOnly(item.endDate ?? item.end ?? item.endAt);
        const note = asTrimmedString(item.note ?? item.label ?? item.description ?? "") ?? "";
        if (s && e) {
          lines.push(note ? `${s}|${e}|${note}` : `${s}|${e}`);
          continue;
        }
      }
      // fallback: plain string item
      const t = asTrimmedString(item);
      if (t) lines.push(t);
    }
    return lines.length ? lines.join("\n") : undefined;
  }

  if (typeof v === "string") {
    const t = v.trim();
    return t || undefined;
  }
  return undefined;
}

function normalizeItinerary(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v === "string") {
    const t = v.trim();
    return t.length ? t : undefined;
  }
  if (!isRecord(v)) return undefined;
  const daysRaw = v.days;
  if (!Array.isArray(daysRaw)) return undefined;
  const days: TripItineraryDay[] = [];
  for (const dr of daysRaw) {
    if (!isRecord(dr)) continue;
    const title = asTrimmedString(dr.title) ?? "";
    const slotsRaw = dr.slots;
    const slots: { time: string; detail: string }[] = [];
    if (Array.isArray(slotsRaw)) {
      for (const sr of slotsRaw) {
        if (!isRecord(sr)) continue;
        slots.push({
          time: asTrimmedString(sr.time) ?? "",
          detail: asTrimmedString(sr.detail) ?? "",
        });
      }
    }
    days.push({ title, slots });
  }
  const doc = { v: ITINERARY_JSON_VERSION, days };
  const s = serializeItineraryToStorage(doc);
  return s.length ? s : undefined;
}

/** แปลง JSON จากโมเดลให้เข้ากับฟอร์ม — ทนต่อ null และโครงสร้างห่อชั้น */
export function normalizeAiTripJson(raw: unknown): TripAiPrefillFields {
  const src = unwrapAiPayload(raw);
  const out: TripAiPrefillFields = {};

  const setStr = (key: keyof TripAiPrefillFields, val: string | undefined) => {
    if (val === undefined) return;
    const t = val.trim();
    if (!t.length) return;
    out[key] = t as never;
  };

  setStr("title", asTrimmedString(src.title));
  if (out.title && out.title.length < 2) {
    out.title = `${out.title}·`;
  }
  setStr("shortDescription", asTrimmedString(src.shortDescription));
  setStr("description", asTrimmedString(src.description));
  setStr("guideDetails", asTrimmedString(src.guideDetails));
  setStr("meetPoint", asTrimmedString(src.meetPoint));
  setStr("destinationName", asTrimmedString(src.destinationName));
  setStr("travelNotes", asTrimmedString(src.travelNotes));

  setStr("highlights", linesToString(src.highlights));
  setStr("packingList", linesToString(src.packingList));
  setStr("safetyNotes", linesToString(src.safetyNotes));
  setStr("guideProvides", linesToString(src.guideProvides));
  const depOpts = normalizeDepartureOptions(src.departureOptions);
  if (depOpts) out.departureOptions = depOpts;

  const startAt = normalizeDatetimeLocal(src.startAt);
  if (startAt) out.startAt = startAt;
  const endAt = normalizeDatetimeLocal(src.endAt);
  if (endAt) out.endAt = endAt;

  const maxP = asFiniteNumber(src.maxParticipants);
  if (maxP !== undefined) out.maxParticipants = clampInt(maxP, 1, 500);
  const price = asFiniteNumber(src.pricePerPerson);
  if (price !== undefined) out.pricePerPerson = clampInt(price, 0, 99_999_999);

  const closes = normalizeDatetimeLocal(src.bookingClosesAt);
  if (closes) out.bookingClosesAt = closes;

  setStr("policyNotes", asTrimmedString(src.policyNotes));
  setStr("groupUrl", asTrimmedString(src.groupUrl));
  setStr("coverImageUrl", asTrimmedString(src.coverImageUrl));

  const gal = src.galleryImageUrls;
  if (Array.isArray(gal)) {
    const lines = gal.map((s) => String(s).trim()).filter(Boolean);
    if (lines.length) out.galleryImageUrls = lines.join("\n");
  } else {
    setStr("galleryImageUrls", asTrimmedString(gal));
  }

  const it = normalizeItinerary(src.itinerary);
  if (it !== undefined) out.itinerary = it;

  return out;
}

export function stripJsonFence(text: string): string {
  const t = text.trim();
  const m = t.match(/^```(?:json)?\s*([\s\S]*?)```$/im);
  if (m?.[1]) return m[1].trim();
  return t;
}
