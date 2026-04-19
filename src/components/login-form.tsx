"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";

export function LoginForm({ resetSuccess = false }: { resetSuccess?: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setPending(false);
    if (res?.error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }
    window.location.href = "/post-login";
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {resetSuccess ? (
        <p className="rounded-lg border border-brand/25 bg-brand/5 px-3 py-2 text-sm text-fg">
          ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่
        </p>
      ) : null}
      {error ? <p className="jad-alert-error">{error}</p> : null}
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
        <div className="flex items-baseline justify-between gap-2">
          <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
            รหัสผ่าน
          </label>
          <Link
            href="/forgot-password"
            className="shrink-0 text-xs font-medium text-brand hover:text-brand-mid"
          >
            ลืมรหัสผ่าน?
          </Link>
        </div>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="jad-input mt-1"
        />
      </div>
      <button type="submit" disabled={pending} className="jad-btn-primary h-12 w-full text-base">
        {pending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}
