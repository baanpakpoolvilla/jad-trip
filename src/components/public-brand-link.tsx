"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const brandLinkClassName =
  "group flex min-w-0 shrink-0 flex-col gap-0.5 rounded-lg py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 focus-visible:ring-offset-2 focus-visible:ring-offset-brand sm:py-1";

function PublicBrandLinkResolved({
  dashboardHref,
}: {
  /** ล็อกอินแล้ว — โลโก้ไปแดชบอร์ด (แอดมิน/ผู้จัด) แทนหน้าแรก */
  dashboardHref: string | null;
}) {
  const searchParams = useSearchParams();
  const raw = searchParams.get("o")?.trim() ?? "";
  const d = dashboardHref?.trim();
  const href = d || (raw ? `/trips?o=${encodeURIComponent(raw)}` : "/");

  return (
    <Link href={href} className={brandLinkClassName}>
      <span className="text-base font-bold leading-tight tracking-tight text-white sm:text-xl">
        Just Trip
      </span>
      <span className="text-[10px] font-medium leading-none text-white/70 sm:text-[11px]">
        จัดทริปแล้วลุยเลย
      </span>
    </Link>
  );
}

function PublicBrandLinkFallback({
  dashboardHref,
}: {
  dashboardHref: string | null;
}) {
  const d = dashboardHref?.trim();
  const href = d || "/";
  return (
    <Link href={href} className={brandLinkClassName}>
      <span className="text-base font-bold leading-tight tracking-tight text-white sm:text-xl">
        Just Trip
      </span>
      <span className="text-[10px] font-medium leading-none text-white/70 sm:text-[11px]">
        จัดทริปแล้วลุยเลย
      </span>
    </Link>
  );
}

export function PublicBrandLink({
  dashboardHref = null,
}: {
  dashboardHref?: string | null;
}) {
  return (
    <Suspense fallback={<PublicBrandLinkFallback dashboardHref={dashboardHref} />}>
      <PublicBrandLinkResolved dashboardHref={dashboardHref} />
    </Suspense>
  );
}
