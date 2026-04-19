import Link from "next/link";
import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[1.625rem] font-semibold text-fg">ลงทะเบียนผู้จัดทริป</h1>
        <p className="mt-1 text-sm text-fg-muted">
          สร้างบัญชีเพื่อสร้างทริปและดูรายการจอง
        </p>
      </div>
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
