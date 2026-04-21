import { randomBytes } from "crypto";
import { createServerClient } from "@supabase/ssr";
import { auth } from "@/auth";

// SVG ถูกนำออกเพราะฝัง script ได้ — ใช้เฉพาะ raster formats
const ALLOWED = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["image/x-icon", ".ico"],
]);

const MAX_BYTES = 2 * 1024 * 1024;
const BUCKET = process.env.SUPABASE_TRIP_IMAGES_BUCKET ?? "trip-images";

/**
 * ตรวจ magic bytes ของไฟล์ — คืน MIME type จริง หรือ null ถ้าไม่รู้จัก
 * ป้องกัน client ส่ง file.type ปลอมมา
 */
function detectMimeFromBytes(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) return "image/png";
  // GIF: GIF87a / GIF89a
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return "image/gif";
  // WebP: RIFF....WEBP
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return "image/webp";
  // ICO: 00 00 01 00
  if (buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x01 && buf[3] === 0x00) return "image/x-icon";
  return null;
}

function createStorageAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createServerClient(url, serviceKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}

async function uploadToStorage(
  supabase: ReturnType<typeof createServerClient>,
  path: string,
  buf: Buffer,
  contentType: string,
): Promise<{ url: string } | { error: string }> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buf, { contentType, upsert: false });

  if (error) {
    if (
      error.message?.toLowerCase().includes("bucket") ||
      error.message?.toLowerCase().includes("not found")
    ) {
      await supabase.storage.createBucket(BUCKET, { public: true });
      const { error: retryError } = await supabase.storage
        .from(BUCKET)
        .upload(path, buf, { contentType, upsert: false });
      if (retryError) {
        console.error("[site-images] retry upload:", retryError.message);
        return { error: retryError.message };
      }
    } else {
      console.error("[site-images] upload:", error.message);
      return { error: error.message };
    }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { url: publicUrl };
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return Response.json({ error: "ไม่มีสิทธิ์" }, { status: 401 });
  }

  const supabase = createStorageAdmin();
  if (!supabase) {
    return Response.json(
      { error: "ระบบจัดเก็บรูปภาพยังไม่ได้ตั้งค่า — กรุณาตั้ง NEXT_PUBLIC_SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY" },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json({ error: "รูปแบบคำขอไม่ถูกต้อง" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return Response.json({ error: "ไม่พบไฟล์" }, { status: 400 });
  }

  const declaredExt = ALLOWED.get(file.type);
  if (!declaredExt) {
    return Response.json(
      { error: "รองรับเฉพาะ JPEG, PNG, WebP, GIF หรือ ICO" },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return Response.json({ error: "ไฟล์ต้องไม่เกิน 2 MB" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());

  // ตรวจ magic bytes — ป้องกัน file.type ปลอม
  const actualMime = detectMimeFromBytes(buf);
  if (!actualMime || !ALLOWED.has(actualMime)) {
    return Response.json({ error: "เนื้อหาไฟล์ไม่ตรงกับประเภทที่ระบุ" }, { status: 400 });
  }

  const ext = ALLOWED.get(actualMime)!;
  const fileName = `${Date.now()}-${randomBytes(8).toString("hex")}${ext}`;
  const storagePath = `site/${fileName}`;

  const result = await uploadToStorage(supabase, storagePath, buf, file.type);

  if ("error" in result) {
    return Response.json(
      { error: "บันทึกไฟล์ไม่สำเร็จ — กรุณาลองใหม่" },
      { status: 503 },
    );
  }

  return Response.json({ url: result.url });
}
