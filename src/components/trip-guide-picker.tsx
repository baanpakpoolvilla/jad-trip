"use client";

import { useCallback, useState } from "react";
import { Search } from "lucide-react";
import {
  searchGuidesForTripOrganizer,
  type GuideSearchResult,
} from "@/app/actions/guide-search";

type Props = {
  initialGuideUserId: string | null;
  initialGuide: GuideSearchResult | null;
};

export function TripGuidePicker({ initialGuideUserId, initialGuide }: Props) {
  const [selected, setSelected] = useState<GuideSearchResult | null>(() =>
    initialGuideUserId && initialGuide && initialGuide.id === initialGuideUserId
      ? initialGuide
      : null,
  );
  const [q, setQ] = useState("");
  const [results, setResults] = useState<GuideSearchResult[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const runSearch = useCallback(async () => {
    setErr(null);
    setResults([]);
    setSearching(true);
    try {
      const r = await searchGuidesForTripOrganizer(q);
      if (Array.isArray(r)) {
        setResults(r);
        if (r.length === 0) setErr("ไม่พบผลลัพธ์ — ลองวางรหัสผู้ใช้เต็ม หรือค้นด้วยชื่อ/อีเมล");
      } else {
        setErr(r.error);
      }
    } catch {
      setErr("ค้นหาไม่สำเร็จ");
    } finally {
      setSearching(false);
    }
  }, [q]);

  return (
    <div className="space-y-3">
      <input type="hidden" name="guideUserId" value={selected?.id ?? ""} readOnly />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="วางรหัสผู้ใช้ (cuid) หรือพิมพ์ชื่อ / อีเมล"
          className="jad-input min-h-10 flex-1 sm:min-w-0"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          onClick={() => void runSearch()}
          disabled={searching || q.trim().length < 2}
          className="jad-btn-secondary inline-flex h-10 shrink-0 items-center justify-center gap-2 px-4 text-sm disabled:opacity-45"
        >
          <Search className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
          {searching ? "กำลังค้น…" : "ค้นหา"}
        </button>
      </div>

      {err ? <p className="text-xs text-warning">{err}</p> : null}

      {results.length > 0 ? (
        <ul className="max-h-56 space-y-1.5 overflow-y-auto rounded-lg border border-border bg-canvas/80 p-2">
          {results.map((g) => {
            const active = selected?.id === g.id;
            return (
              <li key={g.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(g);
                    setErr(null);
                  }}
                  className={`flex w-full flex-col items-start gap-0.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
                    active
                      ? "bg-brand-light ring-1 ring-brand/25"
                      : "hover:bg-surface"
                  }`}
                >
                  <span className="font-medium text-fg">{g.name}</span>
                  <span className="font-mono text-[11px] text-fg-hint">{g.id}</span>
                  <span className="text-xs text-fg-muted">{g.email}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {selected ? (
        <div className="rounded-lg border border-brand/20 bg-brand-light/50 px-3 py-2.5 text-sm">
          <p className="text-xs font-medium text-brand">ไกด์ที่เลือก</p>
          <p className="mt-1 font-medium text-fg">{selected.name}</p>
          <p className="mt-0.5 font-mono text-[11px] text-fg-muted">{selected.id}</p>
          <button
            type="button"
            className="mt-2 text-xs font-medium text-fg-muted underline decoration-dotted hover:text-fg"
            onClick={() => {
              setSelected(null);
              setErr(null);
            }}
          >
            ล้าง — ไม่ระบุไกด์ในทริปนี้
          </button>
        </div>
      ) : (
        <p className="text-xs text-fg-hint">ไม่ระบุไกด์ — หน้าทริปจะแสดงเฉพาะการ์ดผู้จัด</p>
      )}
    </div>
  );
}
