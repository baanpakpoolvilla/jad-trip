import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegisterForm } from "@/components/register-form";

export default async function RegisterPage() {
  const session = await auth();
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
