import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, ChevronDown, MapPin, Share2, Users } from "lucide-react";
import { TripSharePanel } from "@/components/trip-share-panel";
import {
  OrganizerProfileCard,
  parseGalleryUrls,
  TripCoverImage,
  TripGalleryGrid,
  TripRichBlock,
} from "@/components/trip-public-parts";
import { formatBangkok } from "@/lib/datetime";
import { getPublishedTripById } from "@/lib/trips-public";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function TripDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await getPublishedTripById(id);
  if (!data) notFound();

  const { trip, spotsLeft } = data;
  const canBook = spotsLeft > 0;
  const shareCode = trip.shareCode;
  const appBaseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  if (!shareCode) notFound();

  const gallery = parseGalleryUrls(trip.galleryImageUrls ?? "");
  const org = trip.organizer;

  return (
    <article className="space-y-8 pb-28 sm:space-y-10 sm:pb-32">
      <nav aria-label="เส้นทางกลับ">
        <Link href="/trips" className="jad-back-link">
          <ArrowLeft className="size-4 shrink-0" strokeWidth={2} aria-hidden />
          ทริปที่เปิดรับ
        </Link>
      </nav>

      {trip.coverImageUrl?.trim() ? (
        <TripCoverImage src={trip.coverImageUrl.trim()} alt={trip.title} />
      ) : null}

      <header className="space-y-4">
        <p className="jad-section-label">รายละเอียดทริป</p>
        <h1 className="jad-page-title">{trip.title}</h1>
        <p className="jad-page-lead max-w-3xl">{trip.shortDescription}</p>

        <ul className="flex flex-wrap gap-2 pt-1" aria-label="ข้อมูลสรุป">
          <li className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-fg-muted sm:text-sm">
            <Calendar className="size-3.5 shrink-0 text-brand sm:size-4" strokeWidth={1.5} aria-hidden />
            <span className="text-fg">{formatBangkok(trip.startAt)}</span>
          </li>
          <li className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium sm:text-sm">
            <span className="font-semibold text-brand tabular-nums">
              ฿{trip.pricePerPerson.toLocaleString("th-TH")}
            </span>
            <span className="text-fg-muted">/ คน</span>
          </li>
          <li className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-fg-muted sm:text-sm">
            <Users className="size-3.5 shrink-0 text-brand sm:size-4" strokeWidth={1.5} aria-hidden />
            <span className="text-fg">
              เหลือ {spotsLeft}/{trip.maxParticipants} ที่
            </span>
          </li>
        </ul>
      </header>

      <OrganizerProfileCard
        name={org.name}
        phone={org.phone}
        bio={org.bio}
        avatarUrl={org.avatarUrl}
      />

      <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-fg sm:text-base">
          <MapPin className="size-4 shrink-0 text-brand" strokeWidth={1.5} aria-hidden />
          จุดนัดพบครั้งแรก
        </h2>
        <p className="jad-prose-flow mt-3 text-fg">{trip.meetPoint}</p>
      </section>

      <details className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-sm open:shadow-md">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-sm font-semibold text-fg marker:content-none [&::-webkit-details-marker]:hidden sm:px-5 sm:text-base">
          <span className="inline-flex items-center gap-2">
            <Share2 className="size-4 text-brand" strokeWidth={1.5} aria-hidden />
            แชร์ลิงก์ทริป
          </span>
          <ChevronDown
            className="size-5 shrink-0 text-fg-hint transition-transform duration-200 group-open:rotate-180"
            strokeWidth={1.75}
            aria-hidden
          />
        </summary>
        <div className="border-t border-border bg-brand-light/30 px-4 py-4 sm:px-5 sm:py-5">
          <TripSharePanel
            tripTitle={trip.title}
            tripId={trip.id}
            shareCode={shareCode}
            appBaseUrl={appBaseUrl}
            bare
          />
        </div>
      </details>

      <TripRichBlock title="ภาพรวมทริป" body={trip.description} />

      <TripRichBlock title="รายละเอียดไกด์ / ทีมงาน" body={trip.guideDetails} />

      <TripRichBlock title="กำหนดการเดินทาง" body={trip.itinerary} />

      <TripRichBlock title="การเดินทาง" body={trip.travelNotes} />

      <TripRichBlock title="จุดเด่น · สิ่งที่จะได้เจอ · จุดหมาย" body={trip.highlights} />

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
        <TripRichBlock title="สิ่งที่ต้องเตรียม" body={trip.packingList} />
        <TripRichBlock title="สิ่งที่ต้องระวัง" body={trip.safetyNotes} variant="plain" />
      </div>

      <TripRichBlock title="สิ่งที่ไกด์เตรียมให้" body={trip.guideProvides} />

      <TripGalleryGrid urls={gallery} altBase={trip.title} />

      {trip.policyNotes?.trim() ? (
        <section className="rounded-2xl border border-brand/15 bg-brand-light/90 p-5 sm:p-6">
          <h2 className="text-base font-semibold text-brand">ข้อกำหนด / การยกเลิก</h2>
          <p className="jad-prose-flow mt-3 text-fg-muted">{trip.policyNotes.trim()}</p>
        </section>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/90 bg-canvas/95 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/80 sm:px-6">
        <div className="mx-auto w-full max-w-2xl sm:max-w-3xl">
          {canBook ? (
            <Link
              href={`/trips/${trip.id}/book`}
              className="jad-btn-primary flex h-12 w-full text-base font-semibold shadow-[0_4px_14px_rgba(30,77,58,0.22)] sm:h-14"
            >
              จองที่นั่ง
            </Link>
          ) : (
            <p className="rounded-xl border border-border bg-surface py-3.5 text-center text-sm font-medium text-fg-muted">
              ทริปนี้เต็มแล้วหรือปิดรับจอง
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
