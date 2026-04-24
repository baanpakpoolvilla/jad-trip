"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type Round = { startDate: string; endDate: string; note: string };

function parseLine(line: string): Round {
  const parts = line.split("|");
  const [s, e, ...rest] = parts;
  if (
    s && e &&
    /^\d{4}-\d{2}-\d{2}$/.test(s) &&
    /^\d{4}-\d{2}-\d{2}$/.test(e)
  ) {
    return { startDate: s, endDate: e, note: rest.join("|") };
  }
  return { startDate: "", endDate: "", note: line };
}

function serializeRound(r: Round): string {
  if (r.startDate && r.endDate) {
    const note = r.note.trim();
    return note ? `${r.startDate}|${r.endDate}|${note}` : `${r.startDate}|${r.endDate}`;
  }
  return r.note.trim();
}

const EMPTY: Round = { startDate: "", endDate: "", note: "" };

function fromStored(raw: string): Round[] {
  const t = raw.trim();
  if (!t) return [{ ...EMPTY }];
  return t.split(/\r?\n/).map((l) => parseLine(l.trim()));
}

export function DepartureRoundsField({
  name,
  baseId,
  defaultValue,
  dense,
}: {
  name: string;
  baseId: string;
  defaultValue: string;
  dense?: boolean;
}) {
  const initial = useMemo(() => fromStored(defaultValue), [defaultValue]);
  const [rounds, setRounds] = useState<Round[]>(() => initial);

  const value = rounds.map(serializeRound).filter(Boolean).join("\n");

  const update = (i: number, patch: Partial<Round>) =>
    setRounds((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const add = () => setRounds((prev) => [...prev, { ...EMPTY }]);

  const remove = (i: number) =>
    setRounds((prev) => prev.filter((_, j) => j !== i));

  return (
    <div className={dense ? "space-y-2" : "space-y-2.5"}>
      <input type="hidden" name={name} value={value} />
      <ul className={dense ? "space-y-2" : "space-y-2.5"}>
        {rounds.map((r, i) => (
          <li
            key={i}
            className={`rounded-lg border border-border/70 bg-canvas/50 ${dense ? "space-y-1.5 p-2" : "space-y-2 p-2.5"}`}
          >
            {/* Date range row */}
            <div className="flex items-center gap-1.5">
              <input
                id={i === 0 ? baseId : `${baseId}-${i}`}
                type="date"
                value={r.startDate}
                onChange={(e) => {
                  const s = e.target.value;
                  update(i, { startDate: s, endDate: r.endDate || s });
                }}
                aria-label={`รอบที่ ${i + 1} วันเริ่ม`}
                className={`jad-input min-w-0 flex-1 ${dense ? "py-1.5 text-xs sm:text-sm" : ""}`}
              />
              <span className="shrink-0 select-none text-xs text-fg-muted" aria-hidden>
                –
              </span>
              <input
                type="date"
                value={r.endDate}
                min={r.startDate || undefined}
                onChange={(e) => update(i, { endDate: e.target.value })}
                aria-label={`รอบที่ ${i + 1} วันสิ้นสุด`}
                className={`jad-input min-w-0 flex-1 ${dense ? "py-1.5 text-xs sm:text-sm" : ""}`}
              />
              <button
                type="button"
                className="flex size-8 shrink-0 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label={`ลบรอบที่ ${i + 1}`}
                onClick={() => remove(i)}
              >
                <Trash2 className="size-3.5" strokeWidth={1.5} aria-hidden />
              </button>
            </div>
            {/* Note row */}
            <input
              type="text"
              value={r.note}
              onChange={(e) => update(i, { note: e.target.value })}
              placeholder="หมายเหตุ (ไม่บังคับ)"
              aria-label={`รอบที่ ${i + 1} หมายเหตุ`}
              className={`jad-input w-full ${dense ? "py-1.5 text-xs sm:text-sm" : ""}`}
              autoComplete="off"
            />
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={add}
        className={
          dense
            ? "inline-flex min-h-8 items-center gap-1 rounded-lg border border-brand/30 bg-brand-light/50 px-2.5 py-1.5 text-xs font-semibold text-brand hover:bg-brand-light"
            : "inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-brand/30 bg-brand-light/50 px-3 py-2 text-xs font-semibold text-brand hover:bg-brand-light sm:text-sm"
        }
      >
        <Plus className="size-3.5 shrink-0 sm:size-4" strokeWidth={1.75} aria-hidden />
        เพิ่มรอบ
      </button>
    </div>
  );
}
