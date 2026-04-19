import Link from "next/link";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[1.625rem] font-semibold text-fg">เข้าสู่ระบบ</h1>
        <p className="mt-1 text-sm text-fg-muted">สำหรับผู้จัดทริปและแอดมิน</p>
      </div>
      <div className="jad-card">
        <LoginForm />
      </div>
      <p className="text-center text-sm text-fg-muted">
        ยังไม่มีบัญชี?{" "}
        <Link href="/register" className="font-medium text-brand hover:text-brand-mid">
          ลงทะเบียนผู้จัด
        </Link>
      </p>
    </div>
  );
}
