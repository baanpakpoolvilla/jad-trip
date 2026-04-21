/**
 * In-memory rate limiter — ทำงานได้ดีบน single-instance / dev
 * สำหรับ production multi-instance ให้ migrate ไปใช้ Upstash Redis
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

/** Prune expired keys ทุก 5 นาที เพื่อป้องกัน memory leak */
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
  },
  5 * 60 * 1000,
);

/**
 * ตรวจว่าเกิน limit หรือยัง
 * @param key  — ตัวระบุ เช่น ip + route
 * @param limit — จำนวนครั้งสูงสุดใน window
 * @param windowMs — ขนาด window ในมิลลิวินาที
 * @returns `{ ok: true }` ถ้ายังไม่เกิน, `{ ok: false, retryAfterSec }` ถ้าเกินแล้ว
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (entry.count < limit) {
    entry.count += 1;
    return { ok: true };
  }

  return { ok: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
}

/** ดึง IP จาก Request headers (รองรับ Vercel / proxy) */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
