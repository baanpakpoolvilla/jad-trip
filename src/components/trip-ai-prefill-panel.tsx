"use client";

import { useId, useState } from "react";
import { Check, Sparkles, X } from "lucide-react";
import type { TripAiPrefillFields } from "@/lib/trip-ai-prefill-fields";
import { formatDepartureOptions } from "@/lib/departure-options";

type Props = {
  onApplied: (fields: TripAiPrefillFields) => void;
};

type FieldSummaryItem = { label: string; detail?: string };

function buildSummary(fields: TripAiPrefillFields): FieldSummaryItem[] {
  const items: FieldSummaryItem[] = [];

  if (fields.title) items.push({ label: "ชื่อทริป", detail: fields.title });
  if (fields.shortDescription) items.push({ label: "คำโปรย" });
  if (fields.description) items.push({ label: "ภาพรวมทริป" });

  if (fields.startAt || fields.endAt) {
    const s = fields.startAt?.slice(0, 10) ?? "";
    const e = fields.endAt?.slice(0, 10) ?? "";
    items.push({
      label: "วันเดินทาง (รอบหลัก)",
      detail: s === e ? s : `${s} – ${e}`,
    });
  }

  if (fields.departureOptions?.trim()) {
    const rounds = fields.departureOptions.trim().split(/\r?\n/).filter(Boolean);
    const formatted = formatDepartureOptions(fields.departureOptions);
    const preview = formatted.split(/\r?\n/).slice(0, 2).join(", ");
    items.push({
      label: `รอบเพิ่มเติม ${rounds.length} รอบ`,
      detail: preview + (rounds.length > 2 ? " …" : ""),
    });
  }

  if (fields.pricePerPerson !== undefined)
    items.push({ label: "ราคา", detail: `${fields.pricePerPerson.toLocaleString("th-TH")} บาท/คน` });
  if (fields.maxParticipants !== undefined)
    items.push({ label: "จำนวนที่นั่ง", detail: `${fields.maxParticipants} คน` });

  if (fields.meetPoint) items.push({ label: "จุดนัดพบ", detail: fields.meetPoint.slice(0, 40) + (fields.meetPoint.length > 40 ? "…" : "") });
  if (fields.destinationName) items.push({ label: "จุดหมาย", detail: fields.destinationName });
  if (fields.highlights?.trim()) items.push({ label: "รวมในราคา / ค่าใช้จ่ายเพิ่ม" });
  if (fields.guideProvides?.trim()) items.push({ label: "สิ่งที่ทีมงานจัดให้" });
  if (fields.travelNotes?.trim()) items.push({ label: "การเดินทางระหว่างทริป" });
  if (fields.packingList?.trim()) items.push({ label: "ของที่ควรเตรียม" });
  if (fields.safetyNotes?.trim()) items.push({ label: "ข้อควรระวัง" });
  if (fields.policyNotes?.trim()) items.push({ label: "นโยบายและการยกเลิก" });
  if (fields.itinerary?.trim()) items.push({ label: "กำหนดการ" });
  if (fields.groupUrl?.trim()) items.push({ label: "ลิงก์กลุ่ม" });

  return items;
}

export function TripAiPrefillPanel({ onApplied }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [paste, setPaste] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<FieldSummaryItem[] | null>(null);

  const run = async () => {
    setError(null);
    if (paste.trim().length < 20) {
      setError("วางข้อความจากโพสต์อย่างน้อย 20 ตัวอักษร");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/organizer/trip-prefill-from-text", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: paste }),
      });
      const data = (await res.json()) as { ok?: boolean; fields?: TripAiPrefillFields; error?: string };
      if (!res.ok || !data.ok || !data.fields) {
        setError(data.error ?? "คำขอไม่สำเร็จ");
        return;
      }
      onApplied(data.fields);
      setSummary(buildSummary(data.fields));
      setOpen(false);
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="rounded-xl border border-brand/25 bg-brand-light/25 p-3 shadow-sm sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-fg">AI ช่วยลงข้อมูลจากโพสต์</h2>
            <p className="mt-1 text-[11px] leading-snug text-fg-muted sm:text-xs">
              วางข้อความโพสต์ — กรอกฟอร์มให้อัตโนมัติ ตรวจทานก่อนเผยแพร่
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="shrink-0 rounded-lg border border-border/80 bg-surface px-2.5 py-1.5 text-xs font-medium text-fg hover:bg-canvas"
          >
            {open ? "ซ่อน" : "เปิดใช้"}
          </button>
        </div>

        {open ? (
          <div className="mt-3 space-y-3 border-t border-border/60 pt-3">
            <div className="space-y-1.5">
              <label htmlFor={`${id}-paste`} className="block text-xs font-medium text-fg sm:text-sm">
                วางข้อความจากโพสต์
              </label>
              <textarea
                id={`${id}-paste`}
                value={paste}
                onChange={(e) => setPaste(e.target.value)}
                rows={6}
                placeholder="วางเนื้อหาโพสต์ทริป (ไทย/อังกฤษ) รวมวันที่ ราคา จุดนัดพบ ฯลฯ"
                className="jad-input min-h-[120px] resize-y text-sm"
                spellCheck={false}
              />
            </div>

            {error ? (
              <p className="text-xs font-medium text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              disabled={busy}
              onClick={() => void run()}
              className="jad-btn-primary inline-flex h-10 w-full items-center justify-center gap-2 text-sm sm:w-auto"
            >
              <Sparkles className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
              {busy ? "กำลังวิเคราะห์…" : "วิเคราะห์และกรอกฟอร์ม"}
            </button>
          </div>
        ) : null}
      </div>

      {/* Summary popup */}
      {summary ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            aria-label="ปิด"
            onClick={() => setSummary(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="ผลการกรอกจาก AI"
            className="fixed inset-x-3 bottom-[max(1rem,env(safe-area-inset-bottom,0px))] z-50 mx-auto max-w-sm rounded-2xl border border-border bg-surface p-4 shadow-2xl sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-8 sm:w-[22rem]"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-success-light text-success">
                  <Check className="size-4" strokeWidth={2.5} aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-fg">AI กรอกฟอร์มแล้ว</p>
                  <p className="text-[11px] text-fg-muted">{summary.length} ฟิลด์ — ตรวจทานก่อนเผยแพร่</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSummary(null)}
                aria-label="ปิด"
                className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md text-fg-muted hover:bg-canvas hover:text-fg"
              >
                <X className="size-4" strokeWidth={1.75} aria-hidden />
              </button>
            </div>

            {/* Field list */}
            <ul className="mt-3 max-h-[40vh] space-y-1.5 overflow-y-auto border-t border-border/60 pt-3">
              {summary.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-success" strokeWidth={2.5} aria-hidden />
                  <span className="min-w-0">
                    <span className="font-medium text-fg">{item.label}</span>
                    {item.detail ? (
                      <span className="ml-1 truncate text-fg-muted"> — {item.detail}</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => setSummary(null)}
              className="jad-btn-primary mt-4 h-9 w-full text-sm"
            >
              รับทราบ
            </button>
          </div>
        </>
      ) : null}
    </>
  );
}
