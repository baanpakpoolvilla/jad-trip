"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, Search, X } from "lucide-react";
import { tripDestinationGoogleMapsWebUrl, tripDestinationMapEmbedUrl } from "@/lib/trip-destination-map-embed";

type Hit = { label: string; sublabel?: string; lat: number; lon: number };
type SelectedPlace = { label: string; lat: number | null; lon: number | null };

export function TripDestinationPicker({
  dense,
  fid,
  defaultName,
  defaultLat,
  defaultLng,
  hideHeading,
}: {
  dense?: boolean;
  fid: string;
  defaultName: string;
  defaultLat: number | null;
  defaultLng: number | null;
  /** ซ่อนหัวข้อในตัวคอมโพเนนต์ — ใช้เมื่อหัวข้ออยู่ที่ FormSection ด้านนอก */
  hideHeading?: boolean;
}) {
  const searchId = `${fid}-dest-search`;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SelectedPlace | null>(() => {
    if (!defaultName.trim()) return null;
    if (
      defaultLat != null &&
      defaultLng != null &&
      Number.isFinite(defaultLat) &&
      Number.isFinite(defaultLng)
    ) {
      return { label: defaultName.trim(), lat: defaultLat, lon: defaultLng };
    }
    // name-only (e.g. from AI prefill — no coordinates yet)
    return { label: defaultName.trim(), lat: null, lon: null };
  });

  const runSearch = useCallback(async (q: string) => {
    const t = q.trim();
    if (t.length < 2) {
      setHits([]);
      setSearchError(null);
      return;
    }
    setLoading(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/places/search?q=${encodeURIComponent(t)}`, {
        method: "GET",
        cache: "no-store",
      });
      const data = (await res.json()) as { results?: Hit[]; error?: string };
      if (!res.ok) {
        setHits([]);
        setSearchError(data.error ?? "ค้นหาไม่สำเร็จ");
        return;
      }
      setHits(Array.isArray(data.results) ? data.results : []);
    } catch {
      setHits([]);
      setSearchError("เชื่อมต่อไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 2) {
      return;
    }
    debounceRef.current = setTimeout(() => {
      void runSearch(q);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  const searchActive = query.trim().length >= 2;
  const visibleHits = searchActive ? hits : [];
  const visibleSearchError = searchActive ? searchError : null;
  const visibleLoading = searchActive && loading;
  /** แสดงผลค้นหาเมื่อยังไม่เลือกพิกัด หรือเลือกแค่ชื่อ (เช่น จาก AI) แล้วกำลังค้นหาใหม่ */
  const showHitList =
    visibleHits.length > 0 &&
    (!selected || (selected.lat == null && selected.lon == null && searchActive));

  const hintId = `${fid}-dest-hint`;

  return (
    <div className={dense ? "space-y-2" : "space-y-3"}>
      <input type="hidden" name="destinationName" value={selected?.label ?? ""} readOnly />
      <input type="hidden" name="destinationLat" value={selected?.lat != null ? String(selected.lat) : ""} readOnly />
      <input type="hidden" name="destinationLng" value={selected?.lon != null ? String(selected.lon) : ""} readOnly />

      <div className={dense ? "space-y-1.5" : "space-y-2"}>
        {hideHeading ? (
          <label htmlFor={searchId} className="sr-only">
            จุดหมายปลายทาง (ไม่บังคับ) — พิมพ์ชื่อสถานที่แล้วเลือกจากรายการ (Google Maps)
          </label>
        ) : (
          <label
            htmlFor={searchId}
            className={
              dense
                ? "flex items-center gap-1.5 text-xs font-medium text-fg sm:text-sm"
                : "flex items-center gap-2 text-sm font-medium text-fg"
            }
          >
            <MapPin className="size-3.5 shrink-0 text-brand sm:size-4" strokeWidth={1.5} aria-hidden />
            จุดหมายปลายทาง
            <span className="text-[11px] font-normal text-fg-hint sm:text-xs">ไม่บังคับ</span>
          </label>
        )}
        <p id={hintId} className={dense ? "sr-only" : "text-xs leading-relaxed text-fg-muted"}>
          พิมพ์ชื่อสถานที่แล้วเลือกจากรายการ — ค้นหาผ่าน Google Places
        </p>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-fg-hint"
            strokeWidth={1.5}
            aria-hidden
          />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            placeholder="เช่น ดอยอินทนนท์ เชียงใหม่ หรือชื่ออุทยาน…"
            aria-describedby={hintId}
            className={`jad-input w-full pl-9 ${dense ? "text-sm" : ""}`}
          />
          {visibleLoading ? (
            <p className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-fg-muted">ค้นหา…</p>
          ) : null}
        </div>
        {visibleSearchError ? <p className="text-xs text-red-600">{visibleSearchError}</p> : null}

        {showHitList ? (
          <ul
            className={
              dense
                ? "max-h-40 overflow-y-auto rounded-md border border-border/50 bg-surface text-left"
                : "max-h-48 overflow-y-auto rounded-lg border border-border bg-surface text-left shadow-sm"
            }
            role="listbox"
            aria-label="ผลการค้นหา"
          >
            {visibleHits.map((h) => (
              <li key={`${h.lat}-${h.lon}-${h.label.slice(0, 40)}`}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-brand-light/50"
                  onClick={() => {
                    setSelected({ label: h.label, lat: h.lat, lon: h.lon });
                    setHits([]);
                    setQuery("");
                  }}
                >
                  <p className="text-xs leading-snug text-fg sm:text-sm">{h.label}</p>
                  {h.sublabel ? (
                    <p className="mt-0.5 text-[11px] leading-snug text-fg-muted">{h.sublabel}</p>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {selected ? (
        <div
          className={
            dense
              ? "space-y-1.5 rounded-none border-0 bg-brand-light/15 p-0"
              : "space-y-2 rounded-lg border border-border/80 bg-canvas/40 p-2.5 sm:p-3"
          }
        >
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 text-xs leading-snug text-fg sm:text-sm">{selected.label}</p>
            <button
              type="button"
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-fg-muted hover:bg-surface hover:text-fg"
              aria-label="ล้างจุดหมาย"
              onClick={() => {
                setSelected(null);
                setHits([]);
                setQuery("");
              }}
            >
              <X className="size-4" strokeWidth={1.5} />
            </button>
          </div>
          {selected.lat != null && selected.lon != null ? (
            <>
              <div
                className={`relative w-full overflow-hidden ${dense ? "aspect-5/3 min-h-40 rounded-md border-0 bg-brand-light/25" : "aspect-video min-h-[12.5rem] rounded-md border border-border/60 bg-brand-light/20 sm:min-h-[14rem]"}`}
              >
                <iframe
                  title="แผนที่จุดหมายปลายทาง"
                  src={tripDestinationMapEmbedUrl(selected.lat, selected.lon, 14)}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <p className="text-[10px] text-fg-hint sm:text-xs">
                <a
                  href={tripDestinationGoogleMapsWebUrl(selected.lat, selected.lon, 14)}
                  className="font-medium text-brand hover:text-brand-mid"
                  target="_blank"
                  rel="noreferrer"
                >
                  เปิดใน Google Maps
                </a>
              </p>
            </>
          ) : (
            <p className="text-[11px] text-fg-hint sm:text-xs">
              ยังไม่มีพิกัด — ค้นหาชื่อสถานที่ด้านบนเพื่อเพิ่มแผนที่
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
