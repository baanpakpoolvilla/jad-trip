import Link from "next/link";
import { notFound } from "next/navigation";
import { UserRound } from "lucide-react";
import { OrganizerPublicSocialLinks } from "@/components/organizer-public-social-links";
import {
  getPublicOrganizerProfileByBrochureShareCode,
  organizerTripsBrochurePath,
} from "@/lib/trips-public";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ shareCode: string }> };

export default async function PublicOrganizerProfilePage({ params }: Props) {
  const { shareCode } = await params;
  const profile = await getPublicOrganizerProfileByBrochureShareCode(shareCode);
  if (!profile) notFound();

  const tripsHref = organizerTripsBrochurePath(profile.id);
  const initial = profile.name.trim().charAt(0) || "?";

  return (
    <div className="space-y-8">
      <nav aria-label="เส้นทางกลับ">
        <Link href="/" className="jad-back-link">
          หน้าแรก
        </Link>
      </nav>

      <header className="flex flex-col items-center text-center">
        <div className="relative size-28 shrink-0 overflow-hidden rounded-full border-2 border-border bg-brand-light/35 shadow-sm ring-1 ring-black/5 sm:size-36">
          {profile.avatarUrl?.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl.trim()}
              alt=""
              className="size-full object-cover"
              loading="eager"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-2xl font-semibold text-brand sm:text-3xl">
              {initial}
            </div>
          )}
        </div>
        <p className="jad-section-label mt-4">ผู้จัดทริป</p>
        <h1 className="jad-page-title mt-1 max-w-2xl">{profile.name}</h1>
        {profile.isGuide ? (
          <p className="mt-2">
            <span className="jad-badge-success text-xs">ลงทะเบียนเป็นไกด์</span>
          </p>
        ) : null}
      </header>

      <section className="jad-card mx-auto max-w-2xl space-y-4">
        <h2 className="text-sm font-semibold text-fg">แนะนำตัว</h2>
        {profile.bio?.trim() ? (
          <p className="jad-prose-flow whitespace-pre-wrap text-sm leading-relaxed text-fg-muted sm:text-base">
            {profile.bio.trim()}
          </p>
        ) : (
          <p className="flex items-start gap-3 text-sm text-fg-muted">
            <UserRound className="mt-0.5 size-5 shrink-0 text-fg-hint" strokeWidth={1.5} aria-hidden />
            ผู้จัดยังไม่ได้เติมแนะนำตัว — ดูทริปที่เปิดรับจองด้านล่างได้เลย
          </p>
        )}
      </section>

      <OrganizerPublicSocialLinks profile={profile} />

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link href={tripsHref} className="jad-btn-primary inline-flex h-12 min-w-[200px] items-center justify-center px-6 text-sm font-semibold">
          ดูทริปที่เปิดรับจอง
        </Link>
        <Link
          href="/trips"
          className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-lg border border-border bg-surface px-6 text-sm font-medium text-fg shadow-sm transition-colors hover:border-brand/35 hover:bg-brand-light/40"
        >
          รายการทริปทั้งหมด
        </Link>
      </div>

      <p className="text-center text-xs text-fg-hint">
        หน้านี้เป็นข้อมูลสาธารณะเท่านั้น — ไม่แสดงอีเมลหรือเบอร์โทร
      </p>
    </div>
  );
}
