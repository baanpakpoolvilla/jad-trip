"use client";

import { useMemo, useState } from "react";
import { Clock, Plus, Trash2 } from "lucide-react";
import {
  type TripItineraryDay,
  type TripItineraryDoc,
  type TripItinerarySlot,
  parseItineraryFromStorage,
  serializeItineraryToStorage,
} from "@/lib/trip-itinerary-json";

function emptySlot(): TripItinerarySlot {
  return { time: "", detail: "" };
}

function emptyDay(): TripItineraryDay {
  return { title: "", slots: [emptySlot()] };
}

/** แปลงข้อความในช่องเวลาให้เป็นรูปแบบที่ `input type="time"` ใช้ได้ (HH:MM) */
function slotTimeForTimeInput(stored: string): string {
  const t = stored.trim();
  if (!t) return "";
  const m = t.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (!m) return "";
  const h = Math.min(23, Math.max(0, parseInt(m[1]!, 10)));
  const min = Math.min(59, Math.max(0, parseInt(m[2]!, 10)));
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function normalizeTimePickerValue(v: string): string {
  const t = v.trim();
  if (!t) return "";
  const m = t.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (!m) return "";
  const h = Math.min(23, Math.max(0, parseInt(m[1]!, 10)));
  const min = Math.min(59, Math.max(0, parseInt(m[2]!, 10)));
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

const btnAdd =
  "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-brand/30 bg-brand-light/50 px-3 py-2 text-xs font-semibold text-brand transition-colors hover:bg-brand-light sm:min-h-10 sm:text-sm";
const btnGhost =
  "inline-flex min-h-8 items-center justify-center gap-1 rounded-md border border-border px-2 py-1.5 text-[11px] font-medium text-fg-muted transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 sm:text-xs";
const dayCard =
  "rounded-lg border border-border/80 bg-canvas/50 p-3 shadow-sm sm:rounded-xl sm:p-4";
const dayCardDense =
  "space-y-2 rounded-none border-0 border-t border-border/50 bg-transparent py-3 shadow-none first:border-t-0 first:pt-0 sm:py-3.5";
const slotCardDense =
  "rounded-none border-0 border-b border-border/40 bg-transparent py-2.5 last:border-b-0 last:pb-0";

export function TripItineraryBuilder({
  name,
  defaultValue,
  dense,
  formInputId,
}: {
  name: string;
  defaultValue: string;
  dense?: boolean;
  formInputId: string;
}) {
  const [doc, setDoc] = useState<TripItineraryDoc>(() => parseItineraryFromStorage(defaultValue));
  const serialized = useMemo(() => serializeItineraryToStorage(doc), [doc]);

  const updateDay = (dayIndex: number, patch: Partial<TripItineraryDay>) => {
    setDoc((prev) => {
      const days = prev.days.map((d, i) => (i === dayIndex ? { ...d, ...patch } : d));
      return { ...prev, days };
    });
  };

  const updateSlot = (dayIndex: number, slotIndex: number, patch: Partial<TripItinerarySlot>) => {
    setDoc((prev) => {
      const days = prev.days.map((d, di) => {
        if (di !== dayIndex) return d;
        const slots = d.slots.map((s, si) => (si === slotIndex ? { ...s, ...patch } : s));
        return { ...d, slots };
      });
      return { ...prev, days };
    });
  };

  const addDay = () => {
    setDoc((prev) => ({ ...prev, days: [...prev.days, emptyDay()] }));
  };

  const removeDay = (dayIndex: number) => {
    setDoc((prev) => {
      if (prev.days.length <= 1) return { ...prev, days: [emptyDay()] };
      return { ...prev, days: prev.days.filter((_, i) => i !== dayIndex) };
    });
  };

  const addSlot = (dayIndex: number) => {
    setDoc((prev) => {
      const days = prev.days.map((d, i) =>
        i === dayIndex ? { ...d, slots: [...d.slots, emptySlot()] } : d,
      );
      return { ...prev, days };
    });
  };

  const removeSlot = (dayIndex: number, slotIndex: number) => {
    setDoc((prev) => {
      const days = prev.days.map((d, di) => {
        if (di !== dayIndex) return d;
        if (d.slots.length <= 1) {
          return { ...d, slots: [emptySlot()] };
        }
        return { ...d, slots: d.slots.filter((_, si) => si !== slotIndex) };
      });
      return { ...prev, days };
    });
  };

  const labelDay = dense ? "text-[11px] font-medium text-fg" : "text-xs font-medium text-fg sm:text-sm";
  const labelSlot = dense ? "text-[10px] font-medium text-fg-muted" : "text-[11px] font-medium text-fg-muted sm:text-xs";

  return (
    <div className={dense ? "space-y-3" : "space-y-4"}>
      <input type="hidden" name={name} value={serialized} readOnly />

      {doc.days.map((day, dayIndex) => (
        <div key={dayIndex} className={dense ? dayCardDense : dayCard}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <label className={`min-w-0 flex-1 ${labelDay}`} htmlFor={dayIndex === 0 ? formInputId : `${formInputId}-day-${dayIndex}`}>
              {dayIndex === 0 ? "วันที่ / หัวข้อวัน" : `วันที่ ${dayIndex + 1} / หัวข้อ`}
            </label>
            {doc.days.length > 1 ? (
              <button type="button" className={btnGhost} onClick={() => removeDay(dayIndex)} aria-label="ลบวันนี้">
                <Trash2 className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
                <span>ลบวัน</span>
              </button>
            ) : null}
          </div>
          <input
            id={dayIndex === 0 ? formInputId : `${formInputId}-day-${dayIndex}`}
            type="text"
            value={day.title}
            onChange={(e) => updateDay(dayIndex, { title: e.target.value })}
            placeholder={dense ? "เช่น วันแรก — ถึงเชียงใหม่" : "เช่น วันแรก — เดินทางถึงเชียงใหม่"}
            className={`jad-input mt-1.5 w-full ${dense ? "text-sm" : ""}`}
            autoComplete="off"
          />

          <div className={dense ? "mt-3 space-y-2" : "mt-4 space-y-3"}>
            <p className={`flex items-center gap-1.5 ${labelSlot}`}>
              <Clock className="size-3 shrink-0 opacity-80" strokeWidth={1.5} aria-hidden />
              ช่วงเวลาและกิจกรรม
            </p>
            {day.slots.map((slot, slotIndex) => (
              <div
                key={slotIndex}
                className={
                  dense
                    ? slotCardDense
                    : "rounded-lg border border-border/70 bg-surface/90 p-3 sm:p-3.5"
                }
              >
                {/* mobile: [เวลา][ลบ] / [รายละเอียด] — desktop: [เวลา][รายละเอียด][ลบ] */}
                <div className={`grid grid-cols-[1fr_auto] items-end gap-x-2 gap-y-2 sm:flex sm:flex-wrap sm:items-end ${dense ? "sm:gap-x-2 sm:gap-y-1.5" : "sm:gap-2"}`}>
                  <div className="min-w-0 sm:min-w-32 sm:shrink-0">
                    <label className={`mb-1 block ${labelSlot}`} htmlFor={`${formInputId}-t-${dayIndex}-${slotIndex}`}>
                      เวลา
                    </label>
                    <input
                      id={`${formInputId}-t-${dayIndex}-${slotIndex}`}
                      type="time"
                      step={60}
                      value={slotTimeForTimeInput(slot.time)}
                      onChange={(e) =>
                        updateSlot(dayIndex, slotIndex, { time: normalizeTimePickerValue(e.target.value) })
                      }
                      className={`jad-input tabular-nums ${dense ? "text-sm" : ""}`}
                      autoComplete="off"
                    />
                  </div>
                  <button
                    type="button"
                    className={`${btnGhost} self-end shrink-0 sm:order-last`}
                    onClick={() => removeSlot(dayIndex, slotIndex)}
                    aria-label="ลบช่วงเวลานี้"
                  >
                    <Trash2 className="size-3.5" strokeWidth={1.5} aria-hidden />
                  </button>
                  <div className="col-span-2 min-w-0 sm:flex-1 sm:basis-48">
                    <label className={`mb-1 block ${labelSlot}`} htmlFor={`${formInputId}-d-${dayIndex}-${slotIndex}`}>
                      รายละเอียด
                    </label>
                    <textarea
                      id={`${formInputId}-d-${dayIndex}-${slotIndex}`}
                      value={slot.detail}
                      onChange={(e) => updateSlot(dayIndex, slotIndex, { detail: e.target.value })}
                      placeholder="เช่น นัดรวมที่สนามบิน — เช็คอิน"
                      rows={dense ? 2 : 3}
                      className={`jad-input resize-y ${dense ? "min-h-[52px] text-sm" : "min-h-[72px]"}`}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className={btnAdd} onClick={() => addSlot(dayIndex)}>
              <Plus className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
              เพิ่มช่วงเวลา
            </button>
          </div>
        </div>
      ))}

      <button type="button" className={btnAdd} onClick={addDay}>
        <Plus className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
        เพิ่มวัน
      </button>
    </div>
  );
}
