"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "@/app/actions/password-reset";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, null);

  if (state && "ok" in state && state.message) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg border border-brand/25 bg-brand/5 px-3 py-2 text-sm text-fg">
          {state.message}
        </p>
        <Link href="/login" className="jad-btn-primary inline-flex h-11 w-full items-center justify-center text-sm">
          กลับไปเข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state && "error" in state && state.error ? (
        <p className="jad-alert-error">{state.error}</p>
      ) : null}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
          อีเมลบัญชีของคุณ
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="jad-input mt-1"
        />
      </div>
      <button type="submit" disabled={pending} className="jad-btn-primary h-12 w-full text-base">
        {pending ? "กำลังส่งอีเมล…" : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
      </button>
    </form>
  );
}
