/** แปลงค่า `<input type="datetime-local" />` ที่ผู้ใช้ตั้งเป็นเวลาไทย (ไม่มี offset) เป็น `Date` ที่ถูกต้องบนเซิร์ฟเวอร์ */
export function parseBangkokDateTimeLocal(input: string): Date | null {
  const trimmed = input.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(trimmed);
  if (!match) return null;
  const y = Number(match[1]);
  const mo = Number(match[2]);
  const d = Number(match[3]);
  const h = Number(match[4]);
  const mi = Number(match[5]);
  if ([y, mo, d, h, mi].some((n) => Number.isNaN(n))) return null;
  return new Date(Date.UTC(y, mo - 1, d, h - 7, mi, 0));
}

export function formatBangkok(
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
  },
) {
  return date.toLocaleString("th-TH", { timeZone: "Asia/Bangkok", ...options });
}

/** ค่าสำหรับ `<input type="datetime-local" />` แสดงเป็นเวลาไทย */
export function toDatetimeLocalValueBangkok(date: Date) {
  const s = date.toLocaleString("sv-SE", {
    timeZone: "Asia/Bangkok",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const [d, t] = s.replace(" ", "T").split("T");
  return `${d}T${t?.slice(0, 5) ?? "00:00"}`;
}
