import type { GuideSearchResult } from "@/app/actions/guide-search";
import { toDatetimeLocalValueBangkok } from "@/lib/datetime";
import {
  ITINERARY_JSON_VERSION,
  serializeItineraryToStorage,
  type TripItineraryDoc,
} from "@/lib/trip-itinerary-json";

/** ตรงกับ `prisma/seed.ts` และ docs/demo-accounts.md */
export const DEMO_ORGANIZER_EMAIL = "demo-organizer@justtrip.local";
export const DEMO_GUIDE_EMAIL = "demo-guide@justtrip.local";

/** ฟิลด์ที่เติมในฟอร์มสร้างทริป (ไม่รวม `guide` — แยกส่งเข้า TripGuidePicker) */
export type NewTripDemoPrefillFields = {
  title: string;
  shortDescription: string;
  description: string;
  meetPoint: string;
  startAt: string;
  endAt: string;
  maxParticipants: number;
  pricePerPerson: number;
  bookingClosesAt: string;
  policyNotes: string;
  guideDetails: string;
  itinerary: string;
  travelNotes: string;
  highlights: string;
  packingList: string;
  safetyNotes: string;
  guideProvides: string;
  departureOptions: string;
  destinationName: string;
};

export type NewTripDemoPrefill = NewTripDemoPrefillFields & {
  guide: GuideSearchResult;
};

function threeCalendarDaysFromNow(): { startAt: string; endAt: string } {
  const start = new Date();
  start.setDate(start.getDate() + 10);
  start.setHours(6, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 2);
  end.setHours(18, 0, 0, 0);
  return {
    startAt: toDatetimeLocalValueBangkok(start),
    endAt: toDatetimeLocalValueBangkok(end),
  };
}

function sampleItineraryJson(): string {
  const doc: TripItineraryDoc = {
    v: ITINERARY_JSON_VERSION,
    days: [
      {
        title: "วันที่ 1 — รวมกลุ่ม",
        slots: [
          { time: "08:00", detail: "จุดนัดพบ — เช็กชื่อ แนะนำไกด์และกติกาเบื้องต้น" },
          { time: "10:30", detail: "เดินทางเข้าที่พัก / พักผ่อน (ตัวอย่าง)" },
        ],
      },
      {
        title: "วันที่ 2 — กิจกรรมหลัก",
        slots: [
          { time: "08:00", detail: "มื้อเช้า แล้วออกกิจกรรมกลางแจ้ง (ตัวอย่าง)" },
          { time: "15:00", detail: "กลับที่พัก พักผ่อน" },
        ],
      },
      {
        title: "วันที่ 3 — ส่งกลับ",
        slots: [
          { time: "08:00", detail: "เก็บกระเป๋า มื้อเช้า" },
          { time: "12:00", detail: "ส่งกลับจุดนัดพบ — จบทริป" },
        ],
      },
    ],
  };
  return serializeItineraryToStorage(doc);
}

/** ข้อมูลตัวอย่าง 3 วัน 100 บาท/คน + ไกด์ — ใช้เมื่อล็อกอินเป็น demo organizer */
export function buildDemoTripPrefill(guide: GuideSearchResult): NewTripDemoPrefill {
  const { startAt, endAt } = threeCalendarDaysFromNow();
  return {
    guide,
    title: "เขาใหญ่ 3 วัน — ตัวอย่าง (ทดสอบระบบ)",
    shortDescription: "ทริปธรรมชาติ 3 วัน ราคาทดสอบ 100 บาทต่อคน — มีไกด์ประจำทริป",
    description:
      "รายละเอียดตัวอย่างสำหรับทดสอบฟอร์มสร้างทริป\n\n" +
      "• ระยะเวลา 3 วัน (ตัวอย่างวันที่จะเลื่อนตามวันที่เปิดฟอร์ม)\n" +
      "• ราคา 100 บาท/คน — แก้เป็นยอดจริงก่อนเผยแพร่\n" +
      "• ไกด์ถูกเลือกไว้แล้วจากบัญชี demo-guide — แก้หรือล้างได้\n\n" +
      "แก้ข้อความ รูป และกำหนดการได้ตามต้องการ แล้วกดบันทึกร่างหรือเผยแพร่",
    meetPoint: "อุทยานแห่งชาติเขาใหญ่ — ลานจอดประตูหลัก (ตัวอย่าง)",
    startAt,
    endAt,
    maxParticipants: 12,
    pricePerPerson: 100,
    bookingClosesAt: "",
    policyNotes:
      "ตัวอย่าง: ยกเลิกก่อน 7 วันก่อนเดินทาง คืน 50% — ภายใน 7 วันไม่คืนเงิน (แก้ตามนโยบายจริง)",
    guideDetails:
      "ไกด์นำทางและดูแลความปลอดภัยของกลุ่มตลอดทริป — ข้อความตัวอย่าง แก้ได้ในโปรไฟล์ทริป",
    itinerary: sampleItineraryJson(),
    travelNotes:
      "• รถตู้สาธารณะไป–กลับจากจุดนัดพบ (ตัวอย่าง)\n• ระยะทางต่อวันโดยประมาณ 1–2 ชม. บนรถ",
    highlights:
      "รวม: ที่พัก 2 คืน มื้อหลักตามโปรแกรม\nไม่รวม: เครื่องดื่มแอลกอฮอล์ ค่าใช้จ่ายส่วนตัว",
    packingList:
      "รองเท้าเดินป่า\nหมวกกันแดด\nยาประจำตัว",
    safetyNotes:
      "เดินในกลุ่ม แจ้งไกด์หากไม่สบาย\nดื่มน้ำสม่ำเสมอ",
    guideProvides:
      "น้ำดื่มคนละ 2 ขวด/วัน\nชุดปฐมพยาบาลเบื้องต้น",
    departureOptions: "รอบ B (ตัวอย่าง)\nรอบ C — ราคาต่าง",
    destinationName: "อุทยานแห่งชาติเขาใหญ่",
  };
}
