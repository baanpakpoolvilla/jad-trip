import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default async function ForgotPasswordPage() {
  const session = await auth();
  if (session?.user) redirect("/post-login");

  return (
    <div className="space-y-6">
      <header className="jad-page-header">
        <h1 className="jad-page-title">ลืมรหัสผ่าน</h1>
        <p className="text-sm text-fg-muted">
          กรอกอีเมลที่ลงทะเบียนไว้ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้ทางอีเมล (ลิงก์ใช้ได้ประมาณ 1 ชั่วโมง)
        </p>
      </header>
      <div className="jad-card">
        <ForgotPasswordForm />
      </div>
      <p className="text-center text-sm text-fg-muted">
        <Link href="/login" className="font-medium text-brand hover:text-brand-mid">
          กลับไปเข้าสู่ระบบ
        </Link>
        {" · "}
        <Link href="/register" className="font-medium text-brand hover:text-brand-mid">
          ลงทะเบียน
        </Link>
      </p>
    </div>
  );
}
