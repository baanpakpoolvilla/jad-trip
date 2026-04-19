import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";

export default async function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ORGANIZER") {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/");
  }

  return (
    <div className="min-h-full bg-canvas">
      <header className="sticky top-0 z-10 border-b border-brand-active/30 bg-brand shadow-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3 sm:max-w-3xl">
          <Link href="/organizer/trips" className="flex items-center gap-2 text-white">
            <LayoutDashboard className="size-5 shrink-0" strokeWidth={1.5} aria-hidden />
            <span className="text-lg font-bold">จัดทริป</span>
            <span className="hidden text-sm font-medium text-white/85 sm:inline">ผู้จัด</span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/organizer/trips/new"
              className="rounded-full bg-white px-3 py-1.5 font-medium text-brand hover:bg-brand-light"
            >
              + ทริป
            </Link>
            <Link
              href="/trips"
              className="rounded-full px-3 py-1.5 font-medium text-white/95 hover:bg-white/10"
            >
              หน้าสาธารณะ
            </Link>
            <SignOutButton variant="onBrand" />
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-lg px-4 py-6 sm:max-w-3xl sm:py-8">{children}</div>
    </div>
  );
}
