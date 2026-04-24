import { NextResponse } from "next/server";

export const runtime = "edge";

const MAX_Q = 200;

function nominatimUserAgent(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  const custom = process.env.NOMINATIM_USER_AGENT?.trim();
  if (custom) return custom;
  return `SayHiTrip/1.0 (${base})`;
}

export type PlaceSearchHit = {
  label: string;
  /** บริบทเสริม เช่น จังหวัด / ประเทศ — แสดงเป็น subtext ในดรอปดาวน์ */
  sublabel: string;
  lat: number;
  lon: number;
};

/** แยก display_name → label (ชื่อสั้น) + sublabel (บริบท) */
function splitDisplayName(raw: string): { label: string; sublabel: string } {
  const parts = raw.split(", ");
  if (parts.length <= 2) return { label: raw, sublabel: "" };
  return {
    label: parts.slice(0, 2).join(", "),
    sublabel: parts.slice(2).join(", "),
  };
}

type GooglePlaceRow = {
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
};

function placeHitFromGoogle(place: GooglePlaceRow): PlaceSearchHit | null {
  const name = typeof place.displayName?.text === "string" ? place.displayName.text.trim() : "";
  const addr = typeof place.formattedAddress === "string" ? place.formattedAddress.trim() : "";
  const lat = place.location?.latitude;
  const lon = place.location?.longitude;
  if (lat === undefined || lon === undefined) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  if (!name && !addr) return null;
  if (name) {
    const sublabel = addr && addr !== name ? addr : "";
    return { label: name, sublabel, lat, lon };
  }
  const { label, sublabel } = splitDisplayName(addr);
  return { label, sublabel, lat, lon };
}

/**
 * Google Places API (New) — Text Search
 * @see https://developers.google.com/maps/documentation/places/web-service/text-search
 */
async function searchWithGooglePlaces(q: string, apiKey: string): Promise<PlaceSearchHit[]> {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location",
    },
    body: JSON.stringify({
      textQuery: q,
      languageCode: "th",
      regionCode: "TH",
      maxResultCount: 10,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    return [];
  }

  type Body = { places?: GooglePlaceRow[] };
  let body: Body;
  try {
    body = (await res.json()) as Body;
  } catch {
    return [];
  }

  const out: PlaceSearchHit[] = [];
  for (const place of Array.isArray(body.places) ? body.places : []) {
    const hit = placeHitFromGoogle(place);
    if (hit) out.push(hit);
  }
  return out;
}

/** สำรอง — Nominatim (OSM) เมื่อยังไม่ตั้ง GOOGLE_MAPS_API_KEY */
async function searchWithNominatim(q: string): Promise<PlaceSearchHit[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "10");
  url.searchParams.set("addressdetails", "0");
  url.searchParams.set("countrycodes", "th");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": nominatimUserAgent(),
      "Accept-Language": "th,en;q=0.9",
    },
    cache: "no-store",
  });

  if (!res.ok) return [];

  type Raw = { display_name?: string; lat?: string; lon?: string };
  let raw: Raw[];
  try {
    raw = (await res.json()) as Raw[];
  } catch {
    return [];
  }

  const results: PlaceSearchHit[] = [];
  for (const row of Array.isArray(raw) ? raw : []) {
    const displayName = typeof row.display_name === "string" ? row.display_name.trim() : "";
    const lat = Number(row.lat);
    const lon = Number(row.lon);
    if (!displayName || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    if (Math.abs(lat) > 90 || Math.abs(lon) > 180) continue;
    const { label, sublabel } = splitDisplayName(displayName);
    results.push({ label, sublabel, lat, lon });
  }
  return results;
}

/**
 * ค้นหาสถานที่ — ใช้ Google Places (Text Search) เมื่อมี GOOGLE_MAPS_API_KEY
 * ถ้าไม่มี key จะใช้ Nominatim (OpenStreetMap) เป็นทางสำรอง
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ results: [] satisfies PlaceSearchHit[] });
  }
  if (q.length > MAX_Q) {
    return NextResponse.json({ error: "คำค้นยาวเกินไป" }, { status: 400 });
  }

  const googleKey = process.env.GOOGLE_MAPS_API_KEY?.trim();

  try {
    if (googleKey) {
      const googleResults = await searchWithGooglePlaces(q, googleKey);
      if (googleResults.length > 0) {
        return NextResponse.json({ results: googleResults });
      }
      const fallback = await searchWithNominatim(q);
      return NextResponse.json({ results: fallback });
    }

    const results = await searchWithNominatim(q);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "เชื่อมต่อบริการแผนที่ไม่สำเร็จ" }, { status: 503 });
  }
}
