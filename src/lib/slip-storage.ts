import { createServerClient } from "@supabase/ssr";

export const SLIP_BUCKET = process.env.SUPABASE_SLIP_BUCKET ?? "booking-slips";

function createSlipAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createServerClient(url, serviceKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}

/**
 * Resolves a stored slipImageUrl to a usable URL:
 * - If it looks like a storage path (no protocol), generates a 1-hour signed URL from the private bucket.
 * - If it starts with https:// (legacy public URL from before the privacy fix), returns it as-is.
 */
export async function resolveSlipUrl(slipImageUrl: string): Promise<string | null> {
  if (!slipImageUrl) return null;
  if (slipImageUrl.startsWith("https://")) return slipImageUrl;

  const supabase = createSlipAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase.storage
    .from(SLIP_BUCKET)
    .createSignedUrl(slipImageUrl, 3600);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

/** Bulk-resolves slip URLs for a list of bookings; returns a map of bookingId → signed URL. */
export async function resolveSlipUrls(
  bookings: Array<{ id: string; slipImageUrl: string | null }>,
): Promise<Record<string, string | null>> {
  const result: Record<string, string | null> = {};
  await Promise.all(
    bookings.map(async (b) => {
      result[b.id] = b.slipImageUrl ? await resolveSlipUrl(b.slipImageUrl) : null;
    }),
  );
  return result;
}

/**
 * Uploads a slip image to the private bucket and returns the storage path (not a URL).
 * Returns null on failure — callers should not block the booking confirmation if this fails.
 */
export async function uploadSlipToPrivateBucket(
  base64DataUrl: string,
  bookingId: string,
): Promise<string | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) return null;

    const match = base64DataUrl.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
    if (!match) return null;

    const mimeType = match[1].toLowerCase();
    const b64 = match[2];
    const extMap: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif",
    };
    const ext = extMap[mimeType] ?? ".jpg";

    const buf = Buffer.from(b64, "base64");
    if (buf.length > 5 * 1024 * 1024) return null;

    const { randomBytes } = await import("crypto");
    const fileName = `${bookingId}-${Date.now()}-${randomBytes(4).toString("hex")}${ext}`;
    const storagePath = `slips/${fileName}`;

    const supabase = createSlipAdmin()!;

    const { error } = await supabase.storage
      .from(SLIP_BUCKET)
      .upload(storagePath, buf, { contentType: mimeType, upsert: false });

    if (error) {
      if (
        error.message?.toLowerCase().includes("bucket") ||
        error.message?.toLowerCase().includes("not found")
      ) {
        await supabase.storage.createBucket(SLIP_BUCKET, { public: false });
        const { error: retryError } = await supabase.storage
          .from(SLIP_BUCKET)
          .upload(storagePath, buf, { contentType: mimeType, upsert: false });
        if (retryError) {
          console.error("[slip-storage] retry upload:", retryError.message);
          return null;
        }
      } else {
        console.error("[slip-storage] upload:", error.message);
        return null;
      }
    }

    // Return only the storage PATH — never a public URL
    return storagePath;
  } catch (err) {
    console.error("[slip-storage] exception:", err);
    return null;
  }
}
