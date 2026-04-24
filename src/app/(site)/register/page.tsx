import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { safeAuth } from "@/lib/auth-session";
import { RegisterForm } from "@/components/register-form";

export const metadata: Metadata = {
  title: "ลงทะเบียนผู้จัดทริป",
  description:
    "สมัครเป็นผู้จัดทริปบน Say Hi Trip — สร้างทริป เปิดรับจอง ส่ง Trip ให้เพื่อนและลูกค้าได้ทันที ฟรี ไม่มีค่าใช้จ่ายเริ่มต้น",
};

export default async function RegisterPage() {
  const session = await safeAuth();
  if (session?.user) redirect("/post-login");

  return (
    <div className="space-y-6">
      <header className="jad-page-header">
        <h1 className="jad-page-title">ลงทะเบียนผู้จัดทริป</h1>
        <p className="text-sm text-fg-muted">
          สร้างบัญชี ตั้งทริป เปิดรับจอง — แล้วพร้อมพาลุยต่อได้ทันที
        </p>
      </header>
      <div className="jad-card">
        <RegisterForm />
      </div>
      <p className="text-center text-sm text-fg-muted">
        มีบัญชีแล้ว?{" "}
        <Link href="/login" className="font-medium text-brand hover:text-brand-mid">
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
}
