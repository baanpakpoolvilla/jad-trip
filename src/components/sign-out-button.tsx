"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

type Variant = "onBrand" | "onLight";

export function SignOutButton({
  variant = "onBrand",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const base =
    variant === "onBrand"
      ? "inline-flex items-center gap-1.5 rounded-full border border-white/30 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10"
      : "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-fg-muted hover:bg-canvas";
  const cls = className ? `${base} ${className}` : base;

  return (
    <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className={cls}>
      <LogOut className="size-4" strokeWidth={1.5} aria-hidden />
      ออกจากระบบ
    </button>
  );
}
