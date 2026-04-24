import { auth } from "@/auth";
import {
  SITE_IMAGE_MAX_BYTES,
  SITE_IMAGE_MIME_TO_EXT,
  createSiteImagesStorageAdmin,
  detectSiteImageMimeFromBytes,
  uploadToSiteImagesBucket,
} from "@/lib/site-images-bucket";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return Response.json({ error: "ไม่มีสิทธิ์" }, { status: 401 });
  }

  const supabase = createSiteImagesStorageAdmin();
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

  if (!SITE_IMAGE_MIME_TO_EXT.has(file.type)) {
    return Response.json(
      { error: "รองรับเฉพาะ JPEG, PNG, WebP, GIF หรือ ICO" },
      { status: 400 },
    );
  }

  if (file.size > SITE_IMAGE_MAX_BYTES) {
    return Response.json({ error: "ไฟล์ต้องไม่เกิน 2 MB" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());

  const actualMime = detectSiteImageMimeFromBytes(buf);
  if (!actualMime || !SITE_IMAGE_MIME_TO_EXT.has(actualMime)) {
    return Response.json({ error: "เนื้อหาไฟล์ไม่ตรงกับประเภทที่ระบุ" }, { status: 400 });
  }

  const result = await uploadToSiteImagesBucket(supabase, buf, actualMime);

  if ("error" in result) {
    return Response.json(
      { error: "บันทึกไฟล์ไม่สำเร็จ — กรุณาลองใหม่" },
      { status: 503 },
    );
  }

  return Response.json({ url: result.url });
}
