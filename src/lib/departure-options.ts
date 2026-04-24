import { formatBangkokTripDates } from "@/lib/datetime";

const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

export interface DepartureRound {
  /** index 0 = รอบหลัก (startAt–endAt), 1..n = รอบจาก departureOptions */
  index: number;
  label: string;
}

function d(iso: string) {
  return new Date(iso + "T00:00:00Z");
}
function day(dt: Date) {
  return String(dt.getUTCDate());
}
function monthShort(dt: Date) {
  return THAI_MONTHS_SHORT[dt.getUTCMonth()]!;
}
function buddhistYear(dt: Date) {
  return String(dt.getUTCFullYear() + 543);
}

/** รับบรรทัดเดียวจาก departureOptions และคืนข้อความสำหรับแสดงผล */
export function formatDepartureOption(line: string): string {
  const parts = line.split("|");
  const [s, e, ...rest] = parts;
  if (
    s && e &&
    /^\d{4}-\d{2}-\d{2}$/.test(s) &&
    /^\d{4}-\d{2}-\d{2}$/.test(e)
  ) {
    const start = d(s);
    const end = d(e);
    const note = rest.join("|").trim();

    let dateStr: string;
    const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
    const sameMonth = sameYear && start.getUTCMonth() === end.getUTCMonth();

    if (sameMonth) {
      if (start.getUTCDate() === end.getUTCDate()) {
        dateStr = `${day(start)} ${monthShort(start)} ${buddhistYear(start)}`;
      } else {
        dateStr = `${day(start)}–${day(end)} ${monthShort(start)} ${buddhistYear(start)}`;
      }
    } else if (sameYear) {
      dateStr = `${day(start)} ${monthShort(start)}–${day(end)} ${monthShort(end)} ${buddhistYear(start)}`;
    } else {
      dateStr = `${day(start)} ${monthShort(start)} ${buddhistYear(start)}–${day(end)} ${monthShort(end)} ${buddhistYear(end)}`;
    }

    return note ? `${dateStr} · ${note}` : dateStr;
  }
  return line;
}

/** แปลง departureOptions ทั้งฟิลด์ให้เป็น display lines (รักษา plain text เดิม) */
export function formatDepartureOptions(raw: string): string {
  if (!raw.trim()) return "";
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map(formatDepartureOption)
    .join("\n");
}

/**
 * รวมรอบหลัก (startAt–endAt) และ departureOptions เป็น array สำหรับตัวเลือกรอบ
 * ใช้เมื่อทริปมี departureOptions (มีหลายรอบ)
 */
export function parseDepartureRounds(
  startAt: Date,
  endAt: Date,
  departureOptions: string,
): DepartureRound[] {
  const rounds: DepartureRound[] = [
    { index: 0, label: formatBangkokTripDates(startAt, endAt) },
  ];

  if (departureOptions.trim()) {
    const lines = departureOptions
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    lines.forEach((line, i) => {
      rounds.push({ index: i + 1, label: formatDepartureOption(line) });
    });
  }

  return rounds;
}
