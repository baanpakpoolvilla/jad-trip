"use client";

import { useId, useState } from "react";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";

async function readErrorMessageFromResponse(res: Response): Promise<string | undefined> {
  const raw = await res.text();
  if (!raw) return undefined;
  try {
    return (JSON.parse(raw) as { error?: string }).error;
  } catch {
    return undefined;
  }
}

export function RegisterForm() {
  const id = useId();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onGoogleRegister() {
    setGooglePending(true);
    await signIn("google", { callbackUrl: "/post-login" });
  }

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
      const apiError = await readErrorMessageFromResponse(res);
      if (!res.ok) {
        setError(
          apiError ??
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
    <div className="space-y-4">
      <button
        type="button"
        onClick={onGoogleRegister}
        disabled={googlePending || pending}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-fg transition hover:bg-surface-raised disabled:opacity-60"
      >
        <GoogleIcon />
        {googlePending ? "กำลังเชื่อมต่อ…" : "ลงทะเบียนด้วย Google (Gmail)"}
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-fg-muted">หรือใช้อีเมล</span>
        <div className="h-px flex-1 bg-border" />
      </div>

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
        <button
          type="submit"
          disabled={pending || googlePending}
          className="jad-btn-primary h-12 w-full text-base"
        >
          {pending ? "กำลังสร้างบัญชี…" : "ลงทะเบียนผู้จัดทริป"}
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
