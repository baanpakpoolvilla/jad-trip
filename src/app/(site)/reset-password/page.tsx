import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ResetPasswordForm } from "@/components/reset-password-form";

type Props = { searchParams: Promise<{ token?: string | string[] }> };

export default async function ResetPasswordPage({ searchParams }: Props) {
  const session = await auth();
  if (session?.user) redirect("/post-login");

  const sp = await searchParams;
  const raw = sp.token;
  const token = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] ?? "" : "";

  return (
    <div className="space-y-6">
      <header className="jad-page-header">
        <h1 className="jad-page-title">ตั้งรหัสผ่านใหม่</h1>
        <p className="text-sm text-fg-muted">กรอกรหัสผ่านใหม่สำหรับบัญชีของคุณ</p>
      </header>
      <div className="jad-card">
        <ResetPasswordForm token={token} />
      </div>
      <p className="text-center text-sm text-fg-muted">
        <Link href="/login" className="font-medium text-brand hover:text-brand-mid">
          กลับไปเข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
}
