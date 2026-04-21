"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const form = e.currentTarget;
      const name = (form.elements.namedItem("name") as HTMLInputElement).value;
      const email = (form.elements.namedItem("email") as HTMLInputElement).value;
      const password = (form.elements.namedItem("password") as HTMLInputElement)
        .value;

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const raw = await res.text();
      let data: { error?: string } = {};
      if (raw) {
        try {
          data = JSON.parse(raw) as { error?: string };
        } catch {
          data = {};
        }
      }
      if (!res.ok) {
        setError(
          data.error ??
            (res.status === 500
              ? "เซิร์ฟเวอร์ตอบ 500 — ตรวจสอบการเชื่อมต่อฐานข้อมูลบน Vercel และว่าได้รัน prisma db push กับ Supabase แล้ว"
              : "ลงทะเบียนไม่สำเร็จ"),
        );
        return;
      }

      try {
        const sign = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (sign?.error) {
          setError("ลงทะเบียนแล้ว แต่เข้าสู่ระบบไม่สำเร็จ โปรดลองล็อกอิน");
          return;
        }
        window.location.href = "/post-login";
      } catch {
        setError(
          "ลงทะเบียนแล้ว แต่เข้าสู่ระบบไม่สำเร็จ — ตรวจสอบ AUTH_SECRET และ AUTH_URL บน Vercel แล้วลองล็อกอิน",
        );
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? <p className="jad-alert-error">{error}</p> : null}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
          ชื่อ
        </label>
        <input name="name" required autoComplete="name" className="jad-input mt-1" />
      </div>
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
          อีเมล
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="jad-input mt-1"
        />
      </div>
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
          รหัสผ่าน (อย่างน้อย 8 ตัว)
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="jad-input mt-1"
        />
      </div>
      <button type="submit" disabled={pending} className="jad-btn-primary h-12 w-full text-base">
        {pending ? "กำลังสร้างบัญชี…" : "ลงทะเบียนผู้จัดทริป"}
      </button>
    </form>
  );
}
