"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Compass,
  CreditCard,
  LayoutDashboard,
  LayoutGrid,
  MapPin,
  Menu,
  PlusCircle,
  UserRound,
  X,
} from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";

function NavLink({
  href,
  active,
  onNavigate,
  children,
  className = "",
}: {
  href: string;
  active: boolean;
  onNavigate?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={() => onNavigate?.()}
      className={`flex w-full min-w-0 items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors sm:gap-3 sm:px-3 sm:py-2.5 sm:text-sm ${className} ${
        active
          ? "bg-white/18 text-white shadow-sm"
          : "text-white/90 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

function OrganizerNavLinks({
  onNavigate,
  unreadNotifications,
  publicBrochureHref,
  flags,
}: {
  onNavigate?: () => void;
  unreadNotifications: number;
  publicBrochureHref: string;
  flags: {
    isDashboard: boolean;
    isTripsListOrDetail: boolean;
    isNewTrip: boolean;
    isPayments: boolean;
    isNotifications: boolean;
    isProfile: boolean;
  };
}) {
  const badge =
    unreadNotifications > 0 ? (
      <span className="ml-auto flex min-h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-brand">
        {unreadNotifications > 99 ? "99+" : unreadNotifications}
      </span>
    ) : null;

  return (
    <nav className="flex flex-1 flex-col gap-0.5 sm:gap-1" aria-label="เมนูผู้จัด">
      <NavLink href="/organizer" active={flags.isDashboard} onNavigate={onNavigate}>
        <LayoutDashboard className="size-[18px] shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
        แดชบอร์ด
      </NavLink>
      <NavLink href="/organizer/trips" active={flags.isTripsListOrDetail} onNavigate={onNavigate}>
        <LayoutGrid className="size-[18px] shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
        ทริปของฉัน
      </NavLink>
      <NavLink href="/organizer/trips/new" active={flags.isNewTrip} onNavigate={onNavigate}>
        <PlusCircle className="size-[18px] shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
        สร้างทริปใหม่
      </NavLink>
      <NavLink href="/organizer/payments" active={flags.isPayments} onNavigate={onNavigate}>
        <CreditCard className="size-[18px] shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
        รับเงิน
      </NavLink>
      <NavLink href="/organizer/notifications" active={flags.isNotifications} onNavigate={onNavigate}>
        <Bell className="size-[18px] shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
        <span className="min-w-0 flex-1 truncate">แจ้งเตือน</span>
        {badge}
      </NavLink>
      <NavLink href="/organizer/profile" active={flags.isProfile} onNavigate={onNavigate}>
        <UserRound className="size-[18px] shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
        โปรไฟล์
      </NavLink>
      <div className="my-1.5 border-t border-white/15 sm:my-2" />
      <Link
        href={publicBrochureHref}
        onClick={() => onNavigate?.()}
        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white sm:gap-3 sm:px-3 sm:py-2.5 sm:text-sm"
      >
        <MapPin className="size-[18px] shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
        ลิงก์รายการทริป (แชร์)
      </Link>
    </nav>
  );
}

export function OrganizerAppShell({
  children,
  unreadNotifications,
  publicBrochureHref,
}: {
  children: React.ReactNode;
  unreadNotifications: number;
  /** ลิงก์สาธารณะแชร์ให้ผู้จอง — มักเป็น `/o/…` (ย่อ) ไปหน้ารายการทริป */
  publicBrochureHref: string;
}) {
  const pathname = usePathname() ?? "";
  const [menuOpen, setMenuOpen] = useState(false);

  const isDashboard = pathname === "/organizer" || pathname === "/organizer/";
  const isTripsListOrDetail =
    pathname === "/organizer/trips" ||
    (pathname.startsWith("/organizer/trips/") && !pathname.startsWith("/organizer/trips/new"));
  const isNewTrip = pathname === "/organizer/trips/new";
  const isPayments = pathname.startsWith("/organizer/payments");
  const isNotifications = pathname.startsWith("/organizer/notifications");
  const isProfile = pathname.startsWith("/organizer/profile");

  const navFlags = {
    isDashboard,
    isTripsListOrDetail,
    isNewTrip,
    isPayments,
    isNotifications,
    isProfile,
  };

  useEffect(() => {
    setMenuOpen(false);
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
    <div
      data-organizer-shell="1"
      className="flex min-h-dvh flex-col bg-canvas md:flex-row"
    >
      {/* มือถือ: แถบบน + เมนูเบอร์เกอร์ */}
      <header className="sticky top-0 z-30 shrink-0 border-b border-border bg-surface shadow-sm md:hidden">
        <div className="flex items-center justify-between gap-2 px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top,0px))] sm:gap-3 sm:px-6 sm:pb-3 sm:pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
          <Link
            href="/organizer"
            className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg py-0.5 text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mid/30 focus-visible:ring-offset-2 sm:gap-2 sm:py-1"
          >
            <Compass className="size-[1.125rem] shrink-0 sm:size-5" strokeWidth={1.5} aria-hidden />
            <span className="truncate text-[15px] font-bold sm:text-base">Just Trip</span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="relative inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-fg transition-colors hover:border-brand/35 hover:bg-brand-light/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mid/30 focus-visible:ring-offset-2 sm:min-h-11 sm:min-w-11"
            aria-expanded={menuOpen}
            aria-controls="organizer-mobile-drawer"
            aria-label="เปิดเมนู"
          >
            <Menu className="size-5" strokeWidth={1.5} aria-hidden />
            {unreadNotifications > 0 ? (
              <span
                className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent ring-2 ring-surface"
                aria-hidden
              />
            ) : null}
          </button>
        </div>
      </header>

      {menuOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] md:hidden"
            aria-label="ปิดเมนู"
            onClick={() => setMenuOpen(false)}
          />
          <div
            id="organizer-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="เมนูผู้จัด"
            className="fixed inset-y-0 left-0 z-50 flex w-[min(18rem,88vw)] flex-col border-r border-white/10 bg-brand text-white shadow-2xl md:hidden"
            style={{
              paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))",
              paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-white/15 px-3 py-2.5 sm:px-4 sm:py-3">
              <p className="text-[13px] font-semibold tracking-wide text-white/95 sm:text-sm">เมนูผู้จัด</p>
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
              <OrganizerNavLinks
                onNavigate={() => setMenuOpen(false)}
                unreadNotifications={unreadNotifications}
                publicBrochureHref={publicBrochureHref}
                flags={navFlags}
              />
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

      {/* เดสก์ท็อป: sidebar */}
      <aside className="relative z-10 hidden w-56 shrink-0 flex-col border-r border-brand-active/25 bg-brand text-white shadow-md md:flex md:min-h-dvh md:w-62 xl:w-60">
        <div className="flex flex-1 flex-col px-3 pb-6 pt-8">
          <Link
            href="/organizer"
            className="mb-8 flex items-center gap-2.5 rounded-lg px-2 py-1 text-white hover:bg-white/10"
          >
            <Compass className="size-7 shrink-0" strokeWidth={1.5} aria-hidden />
            <div className="leading-tight">
              <span className="block text-lg font-bold tracking-tight">Just Trip</span>
              <span className="text-xs font-medium text-white/75">ผู้จัดทริป</span>
            </div>
          </Link>
          <OrganizerNavLinks
            unreadNotifications={unreadNotifications}
            publicBrochureHref={publicBrochureHref}
            flags={navFlags}
          />
          <div className="mt-auto pt-6">
            <SignOutButton
              variant="onBrand"
              className="w-full justify-center rounded-lg border-white/35 py-2.5"
            />
          </div>
        </div>
      </aside>

      <div className="min-h-0 min-w-0 flex-1">
        <div className="jad-container px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] sm:px-6 sm:py-10 md:py-10">
          {children}
        </div>
      </div>
    </div>
  );
}
