"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const brandLinkClassName =
  "group flex min-w-0 shrink-0 items-center gap-2.5 rounded-lg py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 focus-visible:ring-offset-2 focus-visible:ring-offset-brand sm:py-1";

type BrandProps = {
  dashboardHref: string | null;
  siteName: string;
  siteTagline: string;
  logoUrl: string | null;
};

function BrandContent({ siteName, siteTagline, logoUrl }: Omit<BrandProps, "dashboardHref">) {
  if (logoUrl?.trim()) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl.trim()}
          alt={siteName}
          className="h-7 w-auto shrink-0 object-contain sm:h-8"
        />
        <span className="sr-only">{siteName}</span>
      </>
    );
  }
  return (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="text-base font-bold leading-tight tracking-tight text-white sm:text-xl">
        {siteName}
      </span>
      {siteTagline?.trim() ? (
        <span className="text-[10px] font-medium leading-none text-white/70 sm:text-[11px]">
          {siteTagline}
        </span>
      ) : null}
    </span>
  );
}

function PublicBrandLinkResolved({ dashboardHref, siteName, siteTagline, logoUrl }: BrandProps) {
  const searchParams = useSearchParams();
  const raw = searchParams.get("o")?.trim() ?? "";
  const d = dashboardHref?.trim();
  const href = d || (raw ? `/trips?o=${encodeURIComponent(raw)}` : "/");

  return (
    <Link href={href} className={brandLinkClassName}>
      <BrandContent siteName={siteName} siteTagline={siteTagline} logoUrl={logoUrl} />
    </Link>
  );
}

function PublicBrandLinkFallback({ dashboardHref, siteName, siteTagline, logoUrl }: BrandProps) {
  const d = dashboardHref?.trim();
  const href = d || "/";
  return (
    <Link href={href} className={brandLinkClassName}>
      <BrandContent siteName={siteName} siteTagline={siteTagline} logoUrl={logoUrl} />
    </Link>
  );
}

export function PublicBrandLink({
  dashboardHref = null,
  siteName,
  siteTagline,
  logoUrl = null,
}: {
  dashboardHref?: string | null;
  siteName: string;
  siteTagline: string;
  logoUrl?: string | null;
}) {
  return (
    <Suspense
      fallback={
        <PublicBrandLinkFallback
          dashboardHref={dashboardHref}
          siteName={siteName}
          siteTagline={siteTagline}
          logoUrl={logoUrl}
        />
      }
    >
      <PublicBrandLinkResolved
        dashboardHref={dashboardHref}
        siteName={siteName}
        siteTagline={siteTagline}
        logoUrl={logoUrl}
      />
    </Suspense>
  );
}
