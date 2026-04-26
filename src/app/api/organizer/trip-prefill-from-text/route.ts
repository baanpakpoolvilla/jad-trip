import { auth } from "@/auth";
import {
  normalizeAiTripJson,
  stripJsonFence,
  type TripAiPrefillFields,
} from "@/lib/trip-ai-prefill-fields";

export const runtime = "nodejs";

/** โมเดลเริ่มต้น — แก้ได้ด้วย OPENAI_TRIP_PREFILL_MODEL */
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

const MAX_PASTE_CHARS = 28_000;

function extractJsonObject(text: string): unknown {
  const cleaned = stripJsonFence(text);
  try {
    return JSON.parse(cleaned) as unknown;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1)) as unknown;
    }
    throw new Error("ไม่พบ JSON ในการตอบกลับของ AI");
  }
}

type OpenAIChatResponse = {
  error?: { message?: string };
  choices?: { message?: { content?: string | null } }[];
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ORGANIZER") {
    return Response.json({ error: "ไม่มีสิทธิ์" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "รูปแบบคำขอไม่ถูกต้อง" }, { status: 400 });
  }

  const text =
    typeof body === "object" && body !== null && "text" in body
      ? String((body as { text?: unknown }).text ?? "")
      : "";

  const apiKey = (process.env.OPENAI_API_KEY ?? "").trim();
  if (!apiKey) {
    return Response.json(
      {
        error:
          "ยังไม่ตั้งค่า OPENAI_API_KEY ใน environment — ใส่ใน .env.local หรือ Vercel Environment Variables",
      },
      { status: 503 },
    );
  }
  const t = text.trim();
  if (t.length < 20) {
    return Response.json(
      { error: "วางข้อความจากโพสต์อย่างน้อย 20 ตัวอักษร" },
      { status: 400 },
    );
  }
  if (t.length > MAX_PASTE_CHARS) {
    return Response.json(
      { error: `ข้อความยาวเกิน ${MAX_PASTE_CHARS} ตัวอักษร — ลองย่อหรือตัดส่วนที่ไม่เกี่ยวกับทริป` },
      { status: 400 },
    );
  }

  const model = (process.env.OPENAI_TRIP_PREFILL_MODEL ?? DEFAULT_OPENAI_MODEL).trim() || DEFAULT_OPENAI_MODEL;

  const system = `
คุณคือผู้ช่วยแยก field ทริปจากโพสต์โซเชียล (ภาษาไทยหรืออังกฤษ) ให้กลับมาเป็น JSON object ตาม spec ด้านล่าง
ตอบด้วย JSON object ล้วน ๆ เท่านั้น — ห้ามมี markdown, prose หรือข้อความนอก JSON
ถ้าไม่มีข้อมูลสำหรับ field ใด ให้ละ key นั้นออก (อย่าใส่ null หรือ string ว่าง)

===== FIELD SPEC =====

title (string)
  ชื่อทริปกระชับ เข้าใจง่าย — บอกจุดหมายและจุดเด่นหลัก เช่น "ดอยอินทนนท์ 1 วัน รวมรถไป-กลับ"
  ดึงจากหัวข้อหรือชื่อที่โดดเด่นที่สุดในโพสต์ ไม่เกิน 80 ตัวอักษร

shortDescription (string)
  คำโปรยดึงดูด 1–2 ประโยค (ไทย) — เขียนเหมือน caption ชวนสมัคร ไม่ใช่ outline
  ตัวอย่าง: "พิชิตดอยสูงสุดในไทย ชมทะเลหมอก สัมผัสอากาศเย็นสบาย ใน 1 วัน"
  ถ้าโพสต์มี caption หรือวลีเปิดที่ดึงดูด ให้นำมาปรับใช้

description (string)
  ภาพรวมทริปแบบ "เรื่องเล่า" เป็นย่อหน้าต่อเนื่อง (ไทย) — ไม่ใช่ตาราง ไม่ใช่หัวข้อย่อย
  ครอบคลุม: เส้นทาง/กิจกรรมหลัก ระดับความเหนื่อย/ยาก สิ่งที่ผู้เข้าร่วมจะได้สัมผัส
  ถ้าโพสต์ต้นฉบับเป็นตารางหรือ bullet ให้แปลงเป็นย่อหน้าเรื่องเล่าที่ลื่นไหลอ่านง่าย
  ไม่ต้องพูดถึงราคา วันที่ หรือรายการรวม/ไม่รวม (field อื่นจัดการ)

highlights (string[] หรือ string บรรทัดละรายการ)
  รายการ "รวมในราคา" และ "ไม่รวม/จ่ายเอง" — แต่ละบรรทัด = 1 รายการ
  รูปแบบที่ดี: "รวม: รถรับ-ส่ง", "รวม: ที่พัก 1 คืน", "ไม่รวม: ตั๋วเครื่องบิน", "ไม่รวม: อาหาร"
  ถ้าโพสต์มีตารางรวม/ไม่รวม ให้แตกเป็นบรรทัด อย่าใส่ทั้งตารางเป็น string เดียว

packingList (string[] หรือ string บรรทัดละรายการ)
  ของที่ผู้เข้าร่วมควรเตรียม — 1 รายการต่อบรรทัด สั้นกระชับ
  เช่น: "รองเท้าเดินป่า", "เสื้อกันหนาว", "ยาส่วนตัว", "หมวก ครีมกันแดด"

safetyNotes (string[] หรือ string บรรทัดละรายการ)
  ข้อควรระวัง/ข้อจำกัด — 1 รายการต่อบรรทัด
  เช่น: "ทางชันบางช่วง ต้องพร้อมร่างกาย", "ห้ามนำสัตว์เลี้ยง", "ผู้ป่วยโรคหัวใจควรแจ้งก่อน"

guideProvides (string[] หรือ string บรรทัดละรายการ)
  สิ่งที่ทีมงาน/ไกด์จัดให้ — 1 รายการต่อบรรทัด
  เช่น: "น้ำดื่มตลอดทริป", "อุปกรณ์ปฐมพยาบาลเบื้องต้น", "วิทยุสื่อสาร"

travelNotes (string)
  รูปแบบการเดินทาง เช่น รถตู้/รถบัส/เครื่องบิน รวมหรือไม่รวม มีรับจากจุดใดบ้าง
  เขียนเป็นข้อความต่อเนื่อง ถ้าโพสต์มีตารางรับส่ง ให้สรุปเป็นย่อหน้าสั้น

itinerary (object หรือ string)
  ถ้าโพสต์มีกำหนดการชัดเจน ให้คืน object: { "days": [ { "title": "วันที่ 1", "slots": [ { "time": "07:00", "detail": "รายละเอียด" } ] } ] }
  ถ้าไม่มีกำหนดการ ให้ละ field นี้

meetPoint (string)
  จุดนัดพบหรือจุดรับ — ที่อยู่/ชื่อสถานที่ที่ชัดเจนในภาษาไทย
  เช่น: "ลานจอดรถห้างเซ็นทรัลพระราม 9 ชั้น G ประตูฝั่ง MRT"

destinationName (string)
  ชื่อจุดหมายปลายทางหลัก ไม่ต้องมีพิกัด เช่น "ดอยอินทนนท์ จ.เชียงใหม่"

startAt, endAt, bookingClosesAt (string YYYY-MM-DDTHH:mm)
  เวลาไทย (Asia/Bangkok) ไม่มี timezone suffix ไม่มีวินาที
  ถ้าโพสต์บอกแค่วัน ไม่บอกเวลา: startAt ใช้ 06:00, endAt ใช้ 20:00
  ถ้าบอกแค่เดือน/วัน ไม่มีปี: สมมติปี 2026

departureOptions (array of {startDate, endDate, note})
  รอบออกเดินทางเพิ่มเติม — ทุกรอบ ยกเว้นรอบที่ใส่ใน startAt/endAt แล้ว
  note: ใส่ข้อมูลเพิ่มเติมเช่น "วันธรรมดา", "ว่าง 4 ที่", ชื่อ sub-package, จุดรับเพิ่ม

pricePerPerson (number), maxParticipants (number)
  ตัวเลขเท่านั้น ห้ามใส่หน่วย

policyNotes (string)
  นโยบายการจอง/ยกเลิก เขียนเป็นย่อหน้าหรือบรรทัดต่อเนื่อง
  เช่น เงื่อนไขมัดจำ กำหนดชำระส่วนที่เหลือ เงื่อนไขคืนเงิน

groupUrl (string)
  URL กลุ่ม LINE หรือ Facebook ถ้ามีในโพสต์ ห้ามแต่งขึ้นมาเอง

coverImageUrl, galleryImageUrls: ละ field เหล่านี้ไว้เลย ไม่ต้องใส่

===== END SPEC =====
`.trim();

  const user = `วิเคราะห์ข้อความด้านล่างและแยกข้อมูลทริปออกมาเป็น JSON ตาม spec
หากข้อมูลอยู่ในรูปตาราง หัวข้อ หรือ bullet ให้แปลงเนื้อหาให้เหมาะกับวัตถุประสงค์ของแต่ละ field ตาม spec

---
${t}
---`;

  let res: Response;
  try {
    res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 8192,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
  } catch {
    return Response.json({ error: "เชื่อมต่อ OpenAI ไม่สำเร็จ" }, { status: 502 });
  }

  const rawJson = (await res.json()) as OpenAIChatResponse;

  if (!res.ok) {
    const msg = rawJson.error?.message ?? `OpenAI HTTP ${res.status}`;
    return Response.json({ error: msg }, { status: res.status === 401 ? 401 : 502 });
  }

  const assistantText = rawJson.choices?.[0]?.message?.content?.trim() ?? "";
  if (!assistantText) {
    return Response.json({ error: "AI ไม่ส่งข้อความกลับมา" }, { status: 502 });
  }

  let parsed: unknown;
  try {
    parsed = extractJsonObject(assistantText);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "แปลง JSON ไม่สำเร็จ";
    return Response.json({ error: msg }, { status: 502 });
  }

  const fields: TripAiPrefillFields = normalizeAiTripJson(parsed);
  if (Object.keys(fields).length === 0) {
    return Response.json(
      { error: "ไม่ได้ข้อมูลที่ใช้ได้จากโพสต์ — ลองวางข้อความที่มีรายละเอียดทริปชัดขึ้น" },
      { status: 422 },
    );
  }

  return Response.json({ ok: true as const, fields });
}
