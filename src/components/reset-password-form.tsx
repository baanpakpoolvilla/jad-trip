"use client";

import Link from "next/link";
import { useActionState } from "react";
import { completePasswordReset } from "@/app/actions/password-reset";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(completePasswordReset, null);

  if (!token) {
    return (
      <div className="space-y-4">
        <p className="jad-alert-error">
          ลิงก์ไม่ครบถ้วน กรุณาเปิดลิงก์จากอีเมลหรือขอลิงก์ใหม่จากหน้าลืมรหัสผ่าน
        </p>
        <Link href="/forgot-password" className="jad-btn-primary inline-flex h-11 w-full items-center justify-center text-sm">
          ขอลิงก์ใหม่
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? <p className="jad-alert-error">{state.error}</p> : null}
      <input type="hidden" name="token" value={token} />
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
          รหัสผ่านใหม่ (อย่างน้อย 8 ตัว)
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
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
          ยืนยันรหัสผ่านใหม่
        </label>
        <input
          name="passwordConfirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="jad-input mt-1"
        />
      </div>
      <button type="submit" disabled={pending} className="jad-btn-primary h-12 w-full text-base">
        {pending ? "กำลังบันทึก…" : "ตั้งรหัสผ่านใหม่"}
      </button>
    </form>
  );
}
