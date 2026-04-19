"use client";

import { useMemo, useState } from "react";

const TRAVEL_MODES = [
  { id: "pickup", label: "รถกระบะ" },
  { id: "van", label: "รถตู้" },
  { id: "songthaew", label: "รถสองแถว" },
] as const;

type ModeId = "" | (typeof TRAVEL_MODES)[number]["id"] | "other";

function serialize(mode: ModeId, customOther: string, details: string): string {
  const d = details.trim();
  const c = customOther.trim();

  if (mode === "") {
    return d;
  }

  let head: string;
  if (mode === "other") {
    head = c.length ? `รูปแบบการเดินทาง: อื่นๆ — ${c}` : "รูปแบบการเดินทาง: อื่นๆ";
  } else {
    const m = TRAVEL_MODES.find((x) => x.id === mode);
    head = m ? `รูปแบบการเดินทาง: ${m.label}` : d;
  }

  if (d) return `${head}\n\n${d}`;
  return head;
}

function parseStored(stored: string): { mode: ModeId; customOther: string; details: string } {
  const t = stored.trim();
  if (!t) return { mode: "", customOther: "", details: "" };

  const block = t.match(/^รูปแบบการเดินทาง:\s*([\s\S]*?)(?:\n\n([\s\S]*)|$)/);
  if (block) {
    const head = block[1]!.trim();
    const rest = (block[2] ?? "").trim();

    const otherM = head.match(/^อื่นๆ(?:\s*[—\-]\s*)?(.*)$/);
    if (otherM) {
      return { mode: "other", customOther: (otherM[1] ?? "").trim(), details: rest };
    }

    const known = TRAVEL_MODES.find((x) => x.label === head);
    if (known) {
      return { mode: known.id, customOther: "", details: rest };
    }

    const parts = head.split(/\s*·\s*|\s*,\s*/).map((x) => x.trim()).filter(Boolean);
    const allKnown = parts.length > 0 && parts.every((p) => TRAVEL_MODES.some((x) => x.label === p));
    if (allKnown && parts.length === 1) {
      const one = TRAVEL_MODES.find((x) => x.label === parts[0]!)!;
      return { mode: one.id, customOther: "", details: rest };
    }

    return { mode: "other", customOther: head, details: rest };
  }

  return { mode: "", customOther: "", details: t };
}

export function TripTravelNotesField({
  formInputId,
  defaultValue,
  dense,
}: {
  formInputId: string;
  defaultValue: string;
  dense?: boolean;
}) {
  const initial = useMemo(() => parseStored(defaultValue), [defaultValue]);
  const [mode, setMode] = useState<ModeId>(initial.mode);
  const [customOther, setCustomOther] = useState(initial.customOther);
  const [details, setDetails] = useState(initial.details);

  const serialized = serialize(mode, customOther, details);
  const selectId = `${formInputId}-mode`;
  const otherId = `${formInputId}-other`;

  const onModeChange = (v: string) => {
    const next = v as ModeId;
    setMode(next);
    if (next !== "other") setCustomOther("");
  };

  return (
    <div className={dense ? "space-y-2" : "space-y-2.5"}>
      <input type="hidden" name="travelNotes" value={serialized} />

      <div className="space-y-1.5">
        <label htmlFor={selectId} className={dense ? "text-xs font-medium text-fg" : "text-sm font-medium text-fg"}>
          รูปแบบการเดินทาง
        </label>
        <select
          id={selectId}
          value={mode}
          onChange={(e) => onModeChange(e.target.value)}
          className={`jad-input w-full ${dense ? "text-sm" : ""}`}
        >
          <option value="">— เลือก —</option>
          {TRAVEL_MODES.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
          <option value="other">อื่นๆ</option>
        </select>
      </div>

      {mode === "other" ? (
        <div className="space-y-1.5">
          <label htmlFor={otherId} className={dense ? "text-xs font-medium text-fg" : "text-sm font-medium text-fg"}>
            ระบุช่องทาง / รูปแบบของคุณ
          </label>
          <input
            id={otherId}
            type="text"
            value={customOther}
            onChange={(e) => setCustomOther(e.target.value)}
            placeholder="เช่น รถบัสประจำทาง มอเตอร์ไซค์รับจ้าง เรือท้องถิ่น …"
            className={`jad-input w-full ${dense ? "text-sm" : ""}`}
            autoComplete="off"
          />
        </div>
      ) : null}

      <div className="[&_.jad-input]:mt-0">
        <label
          htmlFor={formInputId}
          className={
            dense
              ? "mb-1 block text-xs font-medium text-fg"
              : "mb-1.5 block text-sm font-medium text-fg"
          }
        >
          รายละเอียดเพิ่มเติม
        </label>
        <textarea
          id={formInputId}
          rows={dense ? 3 : 4}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="เช่น จุดรับ–ส่ง ค่าใช้จ่าย หรือข้อตกลงการเดินทาง …"
          className={`jad-input resize-y ${dense ? "min-h-[72px] text-sm" : "min-h-[88px]"}`}
        />
      </div>
    </div>
  );
}
