/** อัปโหลดรูปผ่าน POST /api/organizer/trip-images (ใช้ได้ทั้งรูปทริปและรูปโปรไฟล์) */

export const ORGANIZER_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export async function uploadOrganizerImageFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/organizer/trip-images", {
    method: "POST",
    body: fd,
  });
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? "อัปโหลดไม่สำเร็จ");
  }
  if (!data.url) {
    throw new Error("ไม่ได้รับ URL จากเซิร์ฟเวอร์");
  }
  return data.url;
}
