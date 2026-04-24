import { randomBytes } from "crypto";
import { createServerClient } from "@supabase/ssr";

export const SITE_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const SITE_IMAGE_BUCKET = process.env.SUPABASE_TRIP_IMAGES_BUCKET ?? "trip-images";

export const SITE_IMAGE_MIME_TO_EXT = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["image/x-icon", ".ico"],
]);

export function detectSiteImageMimeFromBytes(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) return "image/png";
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return "image/gif";
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return "image/webp";
  if (buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x01 && buf[3] === 0x00) return "image/x-icon";
  return null;
}

export function createSiteImagesStorageAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createServerClient(url, serviceKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}

export async function uploadToSiteImagesBucket(
  supabase: ReturnType<typeof createSiteImagesStorageAdmin>,
  buf: Buffer,
  actualMime: string,
): Promise<{ url: string } | { error: string }> {
  if (!supabase) return { error: "no_client" };

  const ext = SITE_IMAGE_MIME_TO_EXT.get(actualMime)!;
  const fileName = `${Date.now()}-${randomBytes(8).toString("hex")}${ext}`;
  const storagePath = `site/${fileName}`;

  const { error } = await supabase.storage
    .from(SITE_IMAGE_BUCKET)
    .upload(storagePath, buf, { contentType: actualMime, upsert: false });

  if (error) {
    if (
      error.message?.toLowerCase().includes("bucket") ||
      error.message?.toLowerCase().includes("not found")
    ) {
      await supabase.storage.createBucket(SITE_IMAGE_BUCKET, { public: true });
      const { error: retryError } = await supabase.storage
        .from(SITE_IMAGE_BUCKET)
        .upload(storagePath, buf, { contentType: actualMime, upsert: false });
      if (retryError) {
        console.error("[site-images] retry upload:", retryError.message);
        return { error: retryError.message };
      }
    } else {
      console.error("[site-images] upload:", error.message);
      return { error: error.message };
    }
  }

  const { data: { publicUrl } } = supabase.storage.from(SITE_IMAGE_BUCKET).getPublicUrl(storagePath);
  return { url: publicUrl };
}
