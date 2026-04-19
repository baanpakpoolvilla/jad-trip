import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { auth } from "@/auth";

const ALLOWED = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ORGANIZER") {
    return Response.json({ error: "ไม่มีสิทธิ์" }, { status: 401 });
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

  const name = `${Date.now()}-${randomBytes(8).toString("hex")}${ext}`;
  const dir = join(process.cwd(), "public", "uploads", "trips");
  const diskPath = join(dir, name);

  try {
    await mkdir(dir, { recursive: true });
    await writeFile(diskPath, buf);
  } catch (e) {
    console.error("trip-images upload:", e);
    return Response.json(
      {
        error:
          "บันทึกไฟล์ไม่สำเร็จ — ระบบไม่สามารถบันทึกรูปได้ในขณะนี้ กรุณาลองใหม่หรือติดต่อผู้ดูแลระบบ",
      },
      { status: 503 },
    );
  }

  const url = `/uploads/trips/${name}`;
  return Response.json({ url });
}
