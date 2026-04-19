"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarCheck,
  ExternalLink,
  MapPinned,
  Shield,
  Users,
} from "lucide-react";

const items = [
  { href: "/admin", label: "ภาพรวม", icon: BarChart3, match: "exact" as const },
  { href: "/admin/trips", label: "ทริปทั้งหมด", icon: MapPinned, match: "prefix" as const },
  { href: "/admin/users", label: "ผู้ใช้", icon: Users, match: "prefix" as const },
  { href: "/admin/bookings", label: "การจอง", icon: CalendarCheck, match: "prefix" as const },
  { href: "/trips", label: "หน้าเว็บ", icon: ExternalLink, match: "exact" as const },
];

function isActive(pathname: string, href: string, match: "exact" | "prefix") {
  if (match === "exact") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Variant = "sidebar" | "mobile";

export function AdminNav({ variant }: { variant: Variant }) {
  const pathname = usePathname();

  if (variant === "sidebar") {
    return (
      <ul className="flex flex-col gap-0.5">
        {items.map(({ href, label, icon: Icon, match }) => {
          const active = isActive(pathname, href, match);
          return (
            <li key={href}>
              <Link
                href={href}
                className={
                  active
                    ? "flex items-center gap-3 rounded-lg bg-white/15 px-3 py-2.5 text-sm font-medium text-white"
                    : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
                }
              >
                <Icon className="size-[1.125rem] shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <nav className="-mx-1 flex gap-1 overflow-x-auto pb-0.5 [scrollbar-width:thin]" aria-label="เมนูแอดมิน">
      {items.map(({ href, label, icon: Icon, match }) => {
        const active = isActive(pathname, href, match);
        return (
          <Link
            key={href}
            href={href}
            className={
              active
                ? "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand sm:text-sm"
                : "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white/95 hover:bg-white/10 sm:text-sm"
            }
          >
            <Icon className="size-3.5 shrink-0 opacity-90 sm:size-4" strokeWidth={1.5} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminBrandLink() {
  return (
    <Link href="/admin" className="flex items-center gap-2 text-white">
      <Shield className="size-5 shrink-0" strokeWidth={1.5} aria-hidden />
      <span className="text-lg font-bold">จัดทริป</span>
      <span className="text-sm font-medium text-white/85">แอดมิน</span>
    </Link>
  );
}
