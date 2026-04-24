import { randomBytes } from "crypto";
import {
  TRIP_IMAGE_MAX_BYTES,
  TRIP_IMAGE_MIME_TO_EXT,
  createTripImagesStorageAdmin,
  detectTripImageMimeFromBytes,
  uploadPublicToTripImagesBucket,
} from "@/lib/trip-images-bucket";

/** รูปโปรไฟล์จาก Google OAuth (lh*.googleusercontent.com) */
export function isGoogleUserContentAvatarUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    const h = u.hostname.toLowerCase();
    return h === "googleusercontent.com" || h.endsWith(".googleusercontent.com");
  } catch {
    return false;
  }
}

/**
 * ดึงรูปจาก URL ของ Google แล้วอัปโหลดไป Supabase Storage (bucket เดียวกับรูปทริป)
 * เพื่อให้เบราว์เซอร์โหลดรูปจากโดเมน *.supabase.co ตรงกับ CSP — ไม่พึ่ง img-src ของ Google
 */
export async function mirrorGoogleAvatarToSupabase(
  imageUrl: string | null | undefined,
): Promise<string | null> {
  const trimmed = imageUrl?.trim();
  if (!trimmed || !isGoogleUserContentAvatarUrl(trimmed)) return null;

  const supabase = createTripImagesStorageAdmin();
  if (!supabase) return null;

  let res: Response;
  try {
    res = await fetch(trimmed, {
      redirect: "follow",
      signal: AbortSignal.timeout(12_000),
      headers: { "User-Agent": "SayHiTrip/1.0 (google-avatar-import)" },
    });
  } catch (e) {
    console.warn("[mirror-google-avatar] fetch failed:", e);
    return null;
  }

  if (!res.ok) {
    console.warn("[mirror-google-avatar] HTTP", res.status);
    return null;
  }

  const ab = await res.arrayBuffer();
  if (ab.byteLength > TRIP_IMAGE_MAX_BYTES || ab.byteLength < 12) return null;

  const buf = Buffer.from(ab);
  const mime = detectTripImageMimeFromBytes(buf);
  if (!mime || !TRIP_IMAGE_MIME_TO_EXT.has(mime)) return null;

  const ext = TRIP_IMAGE_MIME_TO_EXT.get(mime)!;
  const fileName = `google-${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
  const storagePath = `avatars/${fileName}`;

  const result = await uploadPublicToTripImagesBucket(supabase, storagePath, buf, mime);
  if ("error" in result) return null;
  return result.url;
}
