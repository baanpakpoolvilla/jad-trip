import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { safeAuth } from "@/lib/auth-session";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ reset?: string | string[] }> };

export default async function LoginPage({ searchParams }: Props) {
  const session = await safeAuth();
  if (session?.user) redirect("/post-login");

  const sp = await searchParams;
  const raw = sp.reset;
  const resetOk =
    raw === "1" || (Array.isArray(raw) && raw.includes("1"));

  return (
    <div className="space-y-6">
      <header className="jad-page-header">
        <h1 className="jad-page-title">เข้าสู่ระบบ</h1>
        <p className="text-sm text-fg-muted">สำหรับผู้จัดทริปและแอดมิน</p>
      </header>
      <div className="jad-card">
        <LoginForm resetSuccess={resetOk} />
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
