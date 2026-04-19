import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { auth } from "@/auth";

export async function PublicShell({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 border-b border-brand-active/30 bg-brand shadow-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3 sm:max-w-3xl">
          <Link href="/" className="group flex flex-col gap-0.5">
            <span className="text-xl font-bold leading-tight tracking-tight text-white">
              จัดทริป
            </span>
            <span className="text-[11px] font-medium leading-none text-white/85">
              JadTrip
            </span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/trips"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium text-white/95 hover:bg-white/10"
            >
              <CalendarDays className="size-4 shrink-0 opacity-90" strokeWidth={1.5} />
              ทริป
            </Link>
            {session?.user?.role === "ORGANIZER" ? (
              <Link
                href="/organizer/trips"
                className="rounded-full bg-white px-3 py-1.5 font-medium text-brand hover:bg-brand-light"
              >
                จัดการ
              </Link>
            ) : session?.user?.role === "ADMIN" ? (
              <Link
                href="/admin"
                className="rounded-full bg-warning-light px-3 py-1.5 font-medium text-warning hover:opacity-95"
              >
                แอดมิน
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-full px-3 py-1.5 font-medium text-white/95 hover:bg-white/10"
              >
                เข้าสู่ระบบ
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6 sm:max-w-3xl sm:py-8">
        {children}
      </main>
      <footer className="border-t border-border py-6 text-center">
        <p className="text-xs font-medium text-fg-muted">จัดได้ ไม่ยุ่งยาก</p>
        <p className="mt-1 text-xs text-fg-hint">จัดทริป · MVP</p>
      </footer>
    </div>
  );
}
