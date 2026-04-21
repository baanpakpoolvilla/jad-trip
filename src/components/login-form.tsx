"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";

export function LoginForm({ resetSuccess = false }: { resetSuccess?: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

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

  async function onGoogleSignIn() {
    setGooglePending(true);
    await signIn("google", { callbackUrl: "/post-login" });
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onGoogleSignIn}
        disabled={googlePending || pending}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-fg transition hover:bg-surface-raised disabled:opacity-60"
      >
        <GoogleIcon />
        {googlePending ? "กำลังเชื่อมต่อ…" : "เข้าสู่ระบบด้วย Google"}
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-fg-muted">หรือ</span>
        <div className="h-px flex-1 bg-border" />
      </div>

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
        <button type="submit" disabled={pending || googlePending} className="jad-btn-primary h-12 w-full text-base">
          {pending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
        </button>
      </form>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
