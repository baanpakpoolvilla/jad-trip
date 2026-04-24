import { randomBytes } from "crypto";
import { auth } from "@/auth";

export const runtime = "nodejs";
import {
  TRIP_IMAGE_MAX_BYTES,
  TRIP_IMAGE_MIME_TO_EXT,
  createTripImagesStorageAdmin,
  detectTripImageMimeFromBytes,
  uploadPublicToTripImagesBucket,
} from "@/lib/trip-images-bucket";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ORGANIZER") {
    return Response.json({ error: "ไม่มีสิทธิ์" }, { status: 401 });
  }

  const supabase = createTripImagesStorageAdmin();
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

  if (!TRIP_IMAGE_MIME_TO_EXT.has(file.type)) {
    return Response.json(
      { error: "รองรับเฉพาะ JPEG, PNG, WebP หรือ GIF" },
      { status: 400 },
    );
  }

  if (file.size > TRIP_IMAGE_MAX_BYTES) {
    return Response.json({ error: "ไฟล์ต้องไม่เกิน 5 MB" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > TRIP_IMAGE_MAX_BYTES) {
    return Response.json({ error: "ไฟล์ต้องไม่เกิน 5 MB" }, { status: 400 });
  }

  const actualMime = detectTripImageMimeFromBytes(buf);
  if (!actualMime || !TRIP_IMAGE_MIME_TO_EXT.has(actualMime)) {
    return Response.json({ error: "เนื้อหาไฟล์ไม่ตรงกับประเภทที่ระบุ" }, { status: 400 });
  }

  const ext = TRIP_IMAGE_MIME_TO_EXT.get(actualMime)!;
  const fileName = `${Date.now()}-${randomBytes(8).toString("hex")}${ext}`;
  const storagePath = `trips/${fileName}`;

  const result = await uploadPublicToTripImagesBucket(supabase, storagePath, buf, actualMime);

  if ("error" in result) {
    return Response.json(
      { error: "บันทึกไฟล์ไม่สำเร็จ — กรุณาลองใหม่หรือติดต่อผู้ดูแลระบบ" },
      { status: 503 },
    );
  }

  return Response.json({ url: result.url });
}
