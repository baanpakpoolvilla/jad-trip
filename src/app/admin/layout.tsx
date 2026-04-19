import Link from "next/link";
import { redirect } from "next/navigation";
import { Shield } from "lucide-react";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/organizer/trips");

  return (
    <div className="min-h-full bg-canvas">
      <header className="sticky top-0 z-10 border-b border-brand-active/30 bg-brand shadow-sm">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2 text-white">
            <Shield className="size-5 shrink-0" strokeWidth={1.5} aria-hidden />
            <span className="text-lg font-bold">จัดทริป</span>
            <span className="text-sm font-medium text-white/85">แอดมิน</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              href="/admin/trips"
              className="rounded-full px-3 py-1.5 font-medium text-white/95 hover:bg-white/10"
            >
              ทริปทั้งหมด
            </Link>
            <Link
              href="/admin/users"
              className="rounded-full px-3 py-1.5 font-medium text-white/95 hover:bg-white/10"
            >
              ผู้ใช้
            </Link>
            <Link
              href="/admin/bookings"
              className="rounded-full px-3 py-1.5 font-medium text-white/95 hover:bg-white/10"
            >
              การจอง
            </Link>
            <Link href="/trips" className="rounded-full px-3 py-1.5 font-medium text-white/95 hover:bg-white/10">
              หน้าเว็บ
            </Link>
            <SignOutButton variant="onBrand" />
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">{children}</div>
    </div>
  );
}
