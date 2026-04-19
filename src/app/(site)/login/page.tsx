import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/post-login");

  return (
    <div className="space-y-6">
      <header className="jad-page-header">
        <h1 className="jad-page-title">เข้าสู่ระบบ</h1>
        <p className="text-sm text-fg-muted">สำหรับผู้จัดทริปและแอดมิน</p>
      </header>
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
