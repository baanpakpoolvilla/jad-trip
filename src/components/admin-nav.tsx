"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  CalendarCheck,
  ExternalLink,
  MapPinned,
  Menu,
  Settings2,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";

const items = [
  { href: "/admin", label: "ภาพรวม", icon: BarChart3, match: "exact" as const },
  { href: "/admin/trips", label: "ทริปทั้งหมด", icon: MapPinned, match: "prefix" as const },
  { href: "/admin/users", label: "ผู้ใช้", icon: Users, match: "prefix" as const },
  { href: "/admin/bookings", label: "การจอง", icon: CalendarCheck, match: "prefix" as const },
  { href: "/admin/settings", label: "ตั้งค่าเว็บไซต์", icon: Settings2, match: "prefix" as const },
  { href: "/", label: "หน้าเว็บ", icon: ExternalLink, match: "exact" as const },
];

function isActive(pathname: string, href: string, match: "exact" | "prefix") {
  if (match === "exact") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-0.5">
      {items.map(({ href, label, icon: Icon, match }) => {
        const active = isActive(pathname, href, match);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={() => onNavigate?.()}
              className={
                active
                  ? "flex items-center gap-3 rounded-lg bg-white/15 px-3 py-2.5 text-sm font-medium text-white"
                  : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
              }
            >
              <Icon className="size-4.5 shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** เมนูแถบข้าง (เดสก์ท็อป) */
export function AdminNav() {
  return <AdminNavLinks />;
}

/** มือถือ: แถบบน + เมนูเบอร์เกอร์ + ลิ้นชัก */
export function AdminMobileHeader() {
  const pathname = usePathname() ?? "";
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMenuOpen(false));
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <>
      <div className="flex items-center justify-between gap-2 px-3 py-3">
        <AdminBrandLink />
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg border border-white/25 bg-white/10 text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          aria-expanded={menuOpen}
          aria-controls="admin-mobile-drawer"
          aria-label="เปิดเมนู"
        >
          <Menu className="size-5" strokeWidth={1.5} aria-hidden />
        </button>
      </div>

      {menuOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] md:hidden"
            aria-label="ปิดเมนู"
            onClick={() => setMenuOpen(false)}
          />
          <div
            id="admin-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="เมนูแอดมิน"
            className="fixed inset-y-0 right-0 z-50 flex w-[min(18rem,88vw)] flex-col border-l border-white/10 bg-brand text-white shadow-2xl md:hidden"
            style={{
              paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))",
              paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-white/15 px-3 py-2.5 sm:px-4 sm:py-3">
              <p className="text-[13px] font-semibold tracking-wide text-white/95 sm:text-sm">เมนูแอดมิน</p>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 sm:min-h-10 sm:min-w-10"
                aria-label="ปิดเมนู"
              >
                <X className="size-5" strokeWidth={1.5} aria-hidden />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-2.5 pb-3 pt-1.5 sm:px-3 sm:pb-4 sm:pt-2">
              <nav aria-label="เมนูแอดมิน">
                <AdminNavLinks onNavigate={() => setMenuOpen(false)} />
              </nav>
              <div className="mt-4 border-t border-white/15 pt-3 sm:mt-6 sm:pt-4">
                <SignOutButton
                  variant="onBrand"
                  className="w-full justify-center rounded-lg border-white/35 py-2 text-[13px] sm:py-2.5 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}

export function AdminBrandLink() {
  return (
    <Link href="/admin" className="flex min-w-0 items-center gap-2 text-white">
      <ShieldCheck className="size-5 shrink-0" strokeWidth={1.5} aria-hidden />
      <span className="min-w-0 truncate text-lg font-bold">Say Hi Trip</span>
      <span className="hidden shrink-0 text-sm font-medium text-white/85 sm:inline">แอดมิน</span>
    </Link>
  );
}
