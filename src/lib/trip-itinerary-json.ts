export const ITINERARY_JSON_VERSION = 1 as const;

export type TripItinerarySlot = { time: string; detail: string };
export type TripItineraryDay = { title: string; slots: TripItinerarySlot[] };
export type TripItineraryDoc = { v: typeof ITINERARY_JSON_VERSION; days: TripItineraryDay[] };

function emptySlot(): TripItinerarySlot {
  return { time: "", detail: "" };
}

function emptyDay(): TripItineraryDay {
  return { title: "", slots: [emptySlot()] };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isValidDoc(v: unknown): v is TripItineraryDoc {
  if (!isRecord(v)) return false;
  if (v.v !== ITINERARY_JSON_VERSION) return false;
  if (!Array.isArray(v.days)) return false;
  for (const d of v.days) {
    if (!isRecord(d)) return false;
    if (typeof d.title !== "string") return false;
    if (!Array.isArray(d.slots)) return false;
    for (const s of d.slots) {
      if (!isRecord(s)) return false;
      if (typeof s.time !== "string" || typeof s.detail !== "string") return false;
    }
  }
  return true;
}

/** อ่านจาก DB — JSON v1 หรือข้อความธรรมดา (legacy) */
export function parseItineraryFromStorage(raw: string): TripItineraryDoc {
  const t = raw.trim();
  if (!t) return { v: 1, days: [emptyDay()] };
  if (t.startsWith("{")) {
    try {
      const j = JSON.parse(t) as unknown;
      if (isValidDoc(j)) {
        return {
          v: 1,
          days: j.days.length
            ? j.days.map((d) => ({
                title: d.title,
                slots: d.slots.length ? d.slots.map((s) => ({ time: s.time, detail: s.detail })) : [emptySlot()],
              }))
            : [emptyDay()],
        };
      }
    } catch {
      /* fall through */
    }
  }
  return { v: 1, days: [{ title: "", slots: [{ time: "", detail: t }] }] };
}

export function itineraryIsStructuredJson(raw: string): boolean {
  const t = raw.trim();
  if (!t.startsWith("{")) return false;
  try {
    return isValidDoc(JSON.parse(t) as unknown);
  } catch {
    return false;
  }
}

/** บันทึกลง DB — ว่างถ้าไม่มีเนื้อหา */
export function serializeItineraryToStorage(doc: TripItineraryDoc): string {
  const cleaned: TripItineraryDay[] = [];
  for (const d of doc.days) {
    const title = d.title.trim();
    const slots = d.slots
      .map((s) => ({ time: s.time.trim(), detail: s.detail.trim() }))
      .filter((s) => s.time.length > 0 || s.detail.length > 0);
    if (title.length === 0 && slots.length === 0) continue;
    cleaned.push({ title, slots });
  }
  if (cleaned.length === 0) return "";
  return JSON.stringify({ v: ITINERARY_JSON_VERSION, days: cleaned } satisfies TripItineraryDoc);
}
