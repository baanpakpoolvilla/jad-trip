"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, Search, X } from "lucide-react";
import { tripDestinationGoogleMapsWebUrl, tripDestinationMapEmbedUrl } from "@/lib/trip-destination-map-embed";

type Hit = { label: string; sublabel?: string; lat: number; lon: number };

export function TripMeetPointPicker({
  dense,
  fid,
  defaultMeetPoint,
  defaultLat,
  defaultLng,
  formInputId,
  locked,
}: {
  dense?: boolean;
  fid: string;
  defaultMeetPoint: string;
  defaultLat: number | null;
  defaultLng: number | null;
  formInputId: string;
  locked?: boolean;
}) {
  const searchId = `${fid}-meetmap-search`;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [meetText, setMeetText] = useState(defaultMeetPoint);
  const [selected, setSelected] = useState<Hit | null>(() => {
    if (
      defaultLat != null &&
      defaultLng != null &&
      Number.isFinite(defaultLat) &&
      Number.isFinite(defaultLng)
    ) {
      const line = defaultMeetPoint.trim().split(/\r?\n/)[0]?.trim() || "จุดนัดพบ";
      return { label: line, lat: defaultLat, lon: defaultLng };
    }
    return null;
  });

  useEffect(() => {
    queueMicrotask(() => setMeetText(defaultMeetPoint));
  }, [defaultMeetPoint]);

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
    if (locked) {
      return;
    }
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
  }, [query, runSearch, locked]);

  const canSearch = !locked && query.trim().length >= 2;
  const visibleHits = canSearch ? hits : [];
  const visibleSearchError = canSearch ? searchError : null;
  const visibleLoading = canSearch && loading;

  const hintId = `${fid}-meetmap-hint`;

  return (
    <div className={dense ? "space-y-3" : "space-y-4"}>
      <input type="hidden" name="meetPointLat" value={selected != null ? String(selected.lat) : ""} readOnly />
      <input type="hidden" name="meetPointLng" value={selected != null ? String(selected.lon) : ""} readOnly />

      <div className={dense ? "space-y-1.5" : "space-y-2"}>
        <label
          htmlFor={searchId}
          className={
            dense
              ? "flex items-center gap-1.5 text-xs font-medium text-fg sm:text-sm"
              : "flex items-center gap-2 text-sm font-medium text-fg"
          }
        >
          <MapPin className="size-3.5 shrink-0 text-brand sm:size-4" strokeWidth={1.5} aria-hidden />
          ค้นหาจุดเช็คอินบนแผนที่
          <span className="text-[11px] font-normal text-fg-hint sm:text-xs">ไม่บังคับ</span>
        </label>
        <p id={hintId} className={dense ? "sr-only" : "text-xs leading-relaxed text-fg-muted"}>
          เลือกสถานที่จากแผนที่ — ระบบจะใส่ชื่อลงในช่องรายละเอียดด้านล่าง คุณแก้ต่อได้ เช่น ทางออก ชั้น จุดสังเกต
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
            placeholder="เช่น BTS หมอชิต สนามบินสุวรรณภูมิ…"
            aria-describedby={hintId}
            disabled={locked}
            className={`jad-input w-full pl-9 ${dense ? "text-sm" : ""} read-only:bg-canvas read-only:text-fg-muted`}
          />
          {visibleLoading ? (
            <p className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-fg-muted">ค้นหา…</p>
          ) : null}
        </div>
        {visibleSearchError ? <p className="text-xs text-red-600">{visibleSearchError}</p> : null}

        {!locked && visibleHits.length > 0 && !selected ? (
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
                    setSelected(h);
                    setMeetText(h.label);
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
            <p className="min-w-0 text-[11px] leading-snug text-fg-muted sm:text-xs">
              พิกัดจุดเช็คอิน: {selected.lat.toFixed(5)}, {selected.lon.toFixed(5)}
            </p>
            {!locked ? (
              <button
                type="button"
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-fg-muted hover:bg-surface hover:text-fg"
                aria-label="ล้างพิกัดจากแผนที่"
                onClick={() => {
                  setSelected(null);
                  setHits([]);
                  setQuery("");
                }}
              >
                <X className="size-4" strokeWidth={1.5} />
              </button>
            ) : null}
          </div>
          <div
            className={
              dense
                ? "relative aspect-5/3 min-h-40 w-full overflow-hidden rounded-md border-0 bg-brand-light/25"
                : "relative aspect-video min-h-50 w-full overflow-hidden rounded-md border border-border/60 sm:min-h-56"
            }
          >
            <iframe
              title="แผนที่จุดนัดพบ"
              src={tripDestinationMapEmbedUrl(selected.lat, selected.lon, 15)}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <p className="text-[10px] text-fg-hint sm:text-xs">
            <a
              href={tripDestinationGoogleMapsWebUrl(selected.lat, selected.lon, 15)}
              className="font-medium text-brand hover:text-brand-mid"
              target="_blank"
              rel="noreferrer"
            >
              เปิดใน Google Maps
            </a>
          </p>
        </div>
      ) : null}

      <div className={dense ? "space-y-1.5" : "space-y-2"}>
        <label htmlFor={formInputId} className={dense ? "sr-only" : "text-xs font-medium text-fg sm:text-sm"}>
          รายละเอียดจุดนัดพบ / จุดรวมกลุ่ม
        </label>
        <textarea
          id={formInputId}
          name="meetPoint"
          required
          rows={dense ? 3 : 4}
          value={meetText}
          onChange={(e) => setMeetText(e.target.value)}
          readOnly={locked}
          placeholder="เช่น ทางออก 3 ลานจอดรถโซน A — หรือเลือกจากแผนที่ด้านบนแล้วแก้ต่อ"
          className={`jad-input resize-y read-only:bg-canvas read-only:text-fg-muted ${dense ? "min-h-18 text-sm" : "min-h-22"}`}
        />
      </div>
    </div>
  );
}
