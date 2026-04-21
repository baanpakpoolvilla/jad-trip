import { randomBytes } from "crypto";
import { createServerClient } from "@supabase/ssr";
import { auth } from "@/auth";

const ALLOWED = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

const MAX_BYTES = 5 * 1024 * 1024;
const BUCKET = process.env.SUPABASE_TRIP_IMAGES_BUCKET ?? "trip-images";

/** Supabase admin client — ใช้ service role key ข้าม RLS สำหรับ storage upload */
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
    // bucket ยังไม่มี — สร้างแล้ว retry
    if (
      error.message?.toLowerCase().includes("bucket") ||
      error.message?.toLowerCase().includes("not found")
    ) {
      await supabase.storage.createBucket(BUCKET, { public: true });
      const { error: retryError } = await supabase.storage
        .from(BUCKET)
        .upload(path, buf, { contentType, upsert: false });
      if (retryError) {
        console.error("[trip-images] retry upload:", retryError.message);
        return { error: retryError.message };
      }
    } else {
      console.error("[trip-images] upload:", error.message);
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
  if (!session?.user?.id || session.user.role !== "ORGANIZER") {
    return Response.json({ error: "ไม่มีสิทธิ์" }, { status: 401 });
  }

  const supabase = createStorageAdmin();
  if (!supabase) {
    return Response.json(
      {
        error:
          "ระบบจัดเก็บรูปภาพยังไม่ได้ตั้งค่า — กรุณาตั้ง NEXT_PUBLIC_SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY",
      },
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

  const ext = ALLOWED.get(file.type);
  if (!ext) {
    return Response.json(
      { error: "รองรับเฉพาะ JPEG, PNG, WebP หรือ GIF" },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return Response.json({ error: "ไฟล์ต้องไม่เกิน 5 MB" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_BYTES) {
    return Response.json({ error: "ไฟล์ต้องไม่เกิน 5 MB" }, { status: 400 });
  }

  const fileName = `${Date.now()}-${randomBytes(8).toString("hex")}${ext}`;
  const storagePath = `trips/${fileName}`;

  const result = await uploadToStorage(supabase, storagePath, buf, file.type);

  if ("error" in result) {
    return Response.json(
      { error: "บันทึกไฟล์ไม่สำเร็จ — กรุณาลองใหม่หรือติดต่อผู้ดูแลระบบ" },
      { status: 503 },
    );
  }

  return Response.json({ url: result.url });
}
