/** ข้อความแสดงผู้ใช้ตาม `Notification.kind` จากระบบ */
export function notificationKindMeta(kind: string): {
  label: string;
  shortHint: string;
} {
  switch (kind) {
    case "BOOKING_PAID":
      return { label: "ชำระผ่านสลิป", shortHint: "ตรวจสลิปอัตโนมัติ" };
    default:
      return { label: "แจ้งเตือน", shortHint: kind };
  }
}

export function notificationPrimaryCta(href: string | null): { label: string } | null {
  if (!href?.trim()) return null;
  if (href.startsWith("/organizer/trips/")) {
    return { label: "ไปหน้าทริป" };
  }
  if (href.startsWith("/bookings/")) {
    return { label: "ดูหน้าชำระเงิน" };
  }
  return { label: "เปิดลิงก์" };
}
