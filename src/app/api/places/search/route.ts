import { NextResponse } from "next/server";

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

/**
 * ค้นหาสถานที่ผ่าน Nominatim (OSM) — เรียกจากเซิร์ฟเวอร์เท่านั้น ตามนโยบาย User-Agent
 * @see https://nominatim.org/release-docs/latest/api/Search/
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

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "10");
  url.searchParams.set("addressdetails", "0");
  url.searchParams.set("countrycodes", "th");

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      headers: {
        "User-Agent": nominatimUserAgent(),
        "Accept-Language": "th,en;q=0.9",
      },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "เชื่อมต่อบริการแผนที่ไม่สำเร็จ" }, { status: 503 });
  }

  if (!res.ok) {
    return NextResponse.json({ error: "ค้นหาไม่สำเร็จ" }, { status: 502 });
  }

  type Raw = { display_name?: string; lat?: string; lon?: string };
  let raw: Raw[];
  try {
    raw = (await res.json()) as Raw[];
  } catch {
    return NextResponse.json({ error: "รูปแบบผลลัพธ์ไม่ถูกต้อง" }, { status: 502 });
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

  return NextResponse.json({ results });
}
