"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

function linesFromStored(raw: string): string[] {
  const t = raw.trim();
  if (!t) return [""];
  return t.split(/\r?\n/).map((line) => line.replace(/^[\s•\-\*]+/, "").trimEnd());
}

function serialize(lines: string[]): string {
  return lines.map((l) => l.trim()).filter(Boolean).join("\n");
}

export function BulletLinesField({
  name,
  baseId,
  defaultValue,
  dense,
  addLabel,
  rowPlaceholder,
}: {
  name: string;
  baseId: string;
  defaultValue: string;
  dense?: boolean;
  addLabel: string;
  rowPlaceholder?: string;
}) {
  const initial = useMemo(() => linesFromStored(defaultValue), [defaultValue]);
  const [lines, setLines] = useState(() => (initial.length ? initial : [""]));

  const value = serialize(lines);

  const update = (i: number, v: string) => {
    setLines((prev) => prev.map((x, j) => (j === i ? v : x)));
  };

  const add = () => setLines((prev) => [...prev, ""]);

  const remove = (i: number) => {
    setLines((prev) => {
      const next = prev.filter((_, j) => j !== i);
      return next.length ? next : [""];
    });
  };

  return (
    <div className={dense ? "space-y-2" : "space-y-2.5"}>
      <input type="hidden" name={name} value={value} />
      <ul className={dense ? "space-y-1.5" : "space-y-2"}>
        {lines.map((line, i) => (
          <li key={i} className="flex items-start gap-2">
            <span
              className={
                dense
                  ? "mt-2 shrink-0 select-none text-[11px] text-fg-muted"
                  : "mt-2.5 shrink-0 select-none text-xs text-fg-muted"
              }
              aria-hidden
            >
              •
            </span>
            <input
              id={i === 0 ? baseId : `${baseId}-${i}`}
              type="text"
              value={line}
              onChange={(e) => update(i, e.target.value)}
              placeholder={rowPlaceholder}
              className={`jad-input min-w-0 flex-1 ${dense ? "py-1.5 text-sm" : ""}`}
              autoComplete="off"
            />
            <button
              type="button"
              className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-red-50 hover:text-red-600"
              aria-label="ลบข้อนี้"
              onClick={() => remove(i)}
              disabled={lines.length === 1 && line.trim() === ""}
            >
              <Trash2 className="size-3.5" strokeWidth={1.5} aria-hidden />
            </button>
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
        {addLabel}
      </button>
    </div>
  );
}
