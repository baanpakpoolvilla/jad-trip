import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { auth } from "@/auth";
import { PublicBrandLink } from "@/components/public-brand-link";
import { getOrganizerBrochureHrefForSession } from "@/lib/organizer-brochure-share-code";
import { getSiteSettings } from "@/lib/site-settings";

const navItemClass =
  "inline-flex min-h-10 min-w-10 items-center justify-center gap-1 rounded-full px-2.5 text-[13px] font-medium text-white/95 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-brand sm:min-h-11 sm:min-w-11 sm:gap-1.5 sm:px-3.5 sm:text-sm";

export async function PublicShell({ children }: { children: React.ReactNode }) {
  const [session, siteSettings] = await Promise.all([auth(), getSiteSettings()]);
  const dashboardHref =
    session?.user?.role === "ADMIN"
      ? "/admin"
      : session?.user?.role === "ORGANIZER"
        ? "/organizer"
        : null;
  const organizerBrochureHref = await getOrganizerBrochureHrefForSession(session);

  return (
    <div className="flex min-h-full flex-col bg-canvas">
      <header className="jad-public-header sticky top-0 z-30">
        <div className="jad-container flex min-h-12 items-center gap-2 px-3 py-2 sm:min-h-13 sm:gap-3 sm:px-6 sm:py-2.5">
          <PublicBrandLink
            dashboardHref={dashboardHref}
            siteName={siteSettings.siteName}
            siteTagline={siteSettings.siteTagline}
            logoUrl={siteSettings.logoUrl}
          />
          <nav
            className="flex min-w-0 flex-1 items-center justify-end gap-1.5 overflow-x-auto pb-0.5 text-sm [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-2 [&::-webkit-scrollbar]:hidden"
            aria-label="เมนูหลัก"
          >
            {session?.user?.role === "ADMIN" ? (
              <Link
                href="/admin"
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-accent-light px-3 text-[13px] font-semibold text-accent transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-brand sm:min-h-11 sm:px-4 sm:text-sm"
              >
                แอดมิน
              </Link>
            ) : (
              <>
                {organizerBrochureHref ? (
                  <Link href={organizerBrochureHref} className={navItemClass}>
                    <CalendarDays className="size-4 shrink-0 opacity-90" strokeWidth={1.5} aria-hidden />
                    รายการทริป (แชร์)
                  </Link>
                ) : null}
                {session?.user?.role === "ORGANIZER" ? (
                  <Link
                    href="/organizer"
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-brand shadow-sm transition-colors hover:bg-brand-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-brand"
                  >
                    จัดการ
                  </Link>
                ) : (
                  <Link href="/login" className={navItemClass}>
                    เข้าสู่ระบบ
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="jad-container flex-1 px-3 py-5 sm:px-6 sm:py-10">{children}</main>

      <footer className="mt-auto border-t border-border bg-surface py-5 sm:py-8">
        <div className="jad-container flex flex-col items-center gap-1 px-3 sm:flex-row sm:justify-between sm:gap-1.5 sm:px-6">
          <p className="text-sm font-semibold text-fg-muted">{siteSettings.siteName}</p>
          <p className="text-xs text-fg-hint">{siteSettings.siteTagline}</p>
        </div>
      </footer>
    </div>
  );
}
