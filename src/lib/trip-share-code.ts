import { randomBytes } from "crypto";
import { db } from "@/lib/db";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const LEN = 8;

export function randomShareCode(): string {
  const buf = randomBytes(LEN);
  let out = "";
  for (let i = 0; i < LEN; i++) {
    out += ALPHABET[buf[i]! % ALPHABET.length]!;
  }
  return out;
}

/** สร้างหรือคืน shareCode ที่ไม่ซ้ำ (ใช้หลังสร้างทริป / ทริปเก่าที่ยังไม่มีรหัส) */
export async function assignUniqueShareCodeForTrip(tripId: string): Promise<string> {
  const row = await db.trip.findUnique({
    where: { id: tripId },
    select: { shareCode: true },
  });
  if (row?.shareCode) return row.shareCode;

  for (let attempt = 0; attempt < 16; attempt++) {
    const code = randomShareCode();
    try {
      await db.trip.update({
        where: { id: tripId },
        data: { shareCode: code },
      });
      return code;
    } catch {
      // unique collision — retry
    }
  }
  throw new Error("Could not assign trip shareCode");
}
