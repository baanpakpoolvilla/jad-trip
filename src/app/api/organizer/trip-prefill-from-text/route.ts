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

  const system = [
    "You extract structured trip listing data from pasted social posts (often Thai).",
    "Your entire reply must be one JSON object only (no markdown, no prose outside JSON).",
    "Use empty string or omit keys when unknown.",
    "title: concise trip name (Thai ok, e.g. 'ดอยห้วยทู่ 2 วัน 1 คืน'). Extract from the post headline or most prominent trip name.",
    "shortDescription: 1–2 sentence hook / tagline for the trip (Thai ok). Use the post's opening narrative or catchy caption if present.",
    "description: full trip overview in Thai — route description, difficulty, highlights, what participants will experience. Combine the narrative body of the post.",
    "Datetime fields startAt, endAt, bookingClosesAt must be wall time in Asia/Bangkok as YYYY-MM-DDTHH:mm (no timezone suffix, no seconds).",
    "Infer year 2026 when the post gives only month/day without year.",
    "departureOptions: array of objects {startDate:'YYYY-MM-DD', endDate:'YYYY-MM-DD', note:string}. One entry per departure window. Infer year 2026. Put ALL listed date ranges EXCEPT the one mapped to startAt/endAt (use the first upcoming or earliest listed round for startAt/endAt). Use note for extra info like '#วันธรรมดา', 'ว่าง 4', sub-package names (e.g. 'สายอีสาน 3,700 บาท'), or pickup add-ons.",
    "maxParticipants and pricePerPerson must be numbers when known.",
    "itinerary: prefer object { \"days\": [ { \"title\": string, \"slots\": [ { \"time\": \"HH:mm\", \"detail\": string } ] } ] } when the post has a schedule; else omit or use empty string.",
    "highlights, packingList, safetyNotes, guideProvides may be string (newlines or bullets) or string arrays (each line one item).",
    "travelNotes: free text about transport between activities (Thai ok).",
    "meetPoint: where to meet / pickup point (Thai). destinationName: main destination place name without requiring coordinates.",
    "groupUrl: LINE or Facebook group URL if present in the paste.",
    "Do not invent URLs for coverImageUrl unless clearly present in the paste.",
  ].join("\n");

  const user = `Extract trip fields as JSON from this pasted text:\n\n---\n${t}\n---`;

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
