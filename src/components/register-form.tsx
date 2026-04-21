"use client";

import { useId, useState } from "react";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";

export function RegisterForm() {
  const id = useId();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
              ? "เซิร์ฟเวอร์เกิดข้อผิดพลาด — กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ"
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
          "ลงทะเบียนแล้ว แต่เข้าสู่ระบบไม่สำเร็จ — กรุณาลองเข้าสู่ระบบด้วยตนเอง",
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
        <label
          htmlFor={`${id}-name`}
          className="block text-xs font-medium uppercase tracking-wide text-fg-muted"
        >
          ชื่อ
        </label>
        <input
          id={`${id}-name`}
          name="name"
          required
          autoComplete="name"
          className="jad-input mt-1"
        />
      </div>
      <div>
        <label
          htmlFor={`${id}-email`}
          className="block text-xs font-medium uppercase tracking-wide text-fg-muted"
        >
          อีเมล
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          className="jad-input mt-1"
        />
      </div>
      <div>
        <label
          htmlFor={`${id}-password`}
          className="block text-xs font-medium uppercase tracking-wide text-fg-muted"
        >
          รหัสผ่าน (อย่างน้อย 8 ตัว)
        </label>
        <div className="relative mt-1">
          <input
            id={`${id}-password`}
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            className="jad-input pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-fg-muted hover:text-fg focus-visible:outline-none"
            aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
          >
            {showPassword ? (
              <EyeOff className="size-4" strokeWidth={1.5} aria-hidden />
            ) : (
              <Eye className="size-4" strokeWidth={1.5} aria-hidden />
            )}
          </button>
        </div>
      </div>
      <button type="submit" disabled={pending} className="jad-btn-primary h-12 w-full text-base">
        {pending ? "กำลังสร้างบัญชี…" : "ลงทะเบียนผู้จัดทริป"}
      </button>
    </form>
  );
}
