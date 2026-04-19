const MAX_LEN = 500;

/** ตัดช่องว่างและจำกัดความยาวก่อนบันทึก */
export function trimSocialLink(raw: unknown): string {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (s.length <= MAX_LEN) return s;
  return s.slice(0, MAX_LEN);
}

export function toNullableSocial(st: string): string | null {
  return st.length ? st : null;
}

/**
 * คืน URL สำหรับ `href` บนหน้าสาธารณะ — เฉพาะ http/https
 * ถ้าไม่มี scheme จะลองเติม `https://`
 */
export function safeHttpHref(raw: string | null | undefined): string | null {
  const t = (raw ?? "").trim();
  if (!t) return null;
  let candidate = t;
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }
  try {
    const u = new URL(candidate);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (u.username || u.password) return null;
    return u.href;
  } catch {
    return null;
  }
}
