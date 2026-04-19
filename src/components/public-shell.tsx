import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { auth } from "@/auth";

const navItemClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-3.5 text-sm font-medium text-white/95 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-brand";

export async function PublicShell({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-full flex-col bg-canvas">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-brand shadow-[0_1px_0_rgba(0,0,0,0.06)]">
        <div className="jad-container flex min-h-[3.25rem] items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <Link
            href="/"
            className="group flex flex-col gap-0.5 rounded-lg py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 focus-visible:ring-offset-2 focus-visible:ring-offset-brand"
          >
            <span className="text-lg font-bold leading-tight tracking-tight text-white sm:text-xl">
              จัดทริป
            </span>
            <span className="text-[11px] font-medium leading-none text-white/80">
              JadTrip
            </span>
          </Link>
          <nav
            className="flex items-center gap-1.5 text-sm sm:gap-2"
            aria-label="เมนูหลัก"
          >
            <Link href="/trips" className={navItemClass}>
              <CalendarDays className="size-4 shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
              ทริป
            </Link>
            {session?.user?.role === "ORGANIZER" ? (
              <Link
                href="/organizer/trips"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-brand shadow-sm transition-colors hover:bg-brand-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-brand"
              >
                จัดการ
              </Link>
            ) : session?.user?.role === "ADMIN" ? (
              <Link
                href="/admin"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-warning-light px-4 text-sm font-semibold text-warning transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning/40 focus-visible:ring-offset-2 focus-visible:ring-offset-brand"
              >
                แอดมิน
              </Link>
            ) : (
              <Link href="/login" className={navItemClass}>
                เข้าสู่ระบบ
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="jad-container flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
      <footer className="mt-auto border-t border-border bg-surface/80 py-8 text-center">
        <p className="text-sm font-medium text-fg-muted">จัดได้ ไม่ยุ่งยาก</p>
        <p className="mt-1 text-xs text-fg-hint">จัดทริป · MVP</p>
      </footer>
    </div>
  );
}
