import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import {
  OrganizerProfileCard,
  parseGalleryUrls,
  TripGalleryGrid,
  TripHero,
  TripRichBlock,
} from "@/components/trip-public-parts";
import { getPublishedTripById, organizerPublicBrochureHrefFromOrganizer } from "@/lib/trips-public";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function TripDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await getPublishedTripById(id);
  if (!data) notFound();

  const { trip, spotsLeft } = data;
  const canBook = spotsLeft > 0;
  if (!trip.shareCode) notFound();

  const backHref = organizerPublicBrochureHrefFromOrganizer({
    id: trip.organizerId,
    brochureShareCode: trip.organizer.brochureShareCode ?? null,
  });
  const backLabel = "ทริปทั้งหมดจากผู้จัดนี้";

  const gallery = parseGalleryUrls(trip.galleryImageUrls ?? "");
  const org = trip.organizer;

  return (
    <article className="space-y-4 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] sm:space-y-6 sm:pb-[calc(8rem+env(safe-area-inset-bottom,0px))]">
      {/* Back navigation */}
      <nav aria-label="เส้นทางกลับ">
        <Link href={backHref} className="jad-back-link">
          <ArrowLeft className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
          {backLabel}
        </Link>
      </nav>

      {/* Hero — cover image overlay or brand gradient */}
      <TripHero
        title={trip.title}
        shortDescription={trip.shortDescription}
        coverImageUrl={trip.coverImageUrl}
        startAt={trip.startAt}
        endAt={trip.endAt}
        pricePerPerson={trip.pricePerPerson}
        spotsLeft={spotsLeft}
        maxParticipants={trip.maxParticipants}
      />

      <TripRichBlock title="ภาพรวมทริป" body={trip.description} variant="card" />

      {/* Organizer */}
      <OrganizerProfileCard
        name={org.name}
        phone={org.phone}
        bio={org.bio}
        avatarUrl={org.avatarUrl}
      />

      {trip.guide ? (
        <OrganizerProfileCard
          variant="guide"
          name={trip.guide.name}
          phone={trip.guide.phone}
          bio={trip.guide.bio}
          avatarUrl={trip.guide.avatarUrl}
        />
      ) : null}

      {/* Meet point */}
      <section className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:rounded-2xl sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-light text-brand sm:size-9 sm:rounded-lg">
            <MapPin className="size-4 sm:size-4.5" strokeWidth={1.5} aria-hidden />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 className="text-[15px] font-semibold text-fg sm:text-[17px]">จุดนัดพบ / จุดรวมกลุ่ม</h2>
            <p className="jad-prose-flow mt-2 whitespace-pre-wrap sm:mt-2.5">{trip.meetPoint}</p>
          </div>
        </div>
      </section>

      {/* กำหนดการ → ราคารวมอะไร → ทีมงาน → การเดินทาง → ของใช้ / ความปลอดภัย → สิ่งที่ทีมจัดให้ */}
      <TripRichBlock title="กำหนดการเดินทาง" body={trip.itinerary} variant="itinerary" />

      <TripRichBlock
        title="รวมในราคา · ค่าใช้จ่ายเพิ่ม"
        body={trip.highlights}
        variant="highlight"
      />

      <TripRichBlock title="รู้จักไกด์ / ทีมงาน" body={trip.guideDetails} variant="guide" />

      <TripRichBlock title="การเดินทาง" body={trip.travelNotes} variant="card" />

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
        <TripRichBlock title="สิ่งที่ต้องเตรียม" body={trip.packingList} variant="packing" />
        <TripRichBlock title="สิ่งที่ต้องระวัง" body={trip.safetyNotes} variant="warning" />
      </div>

      <TripRichBlock title="สิ่งที่ทีมงานจัดให้" body={trip.guideProvides} variant="guide" />

      {/* Gallery */}
      <TripGalleryGrid urls={gallery} altBase={trip.title} />

      {/* Policy / cancellation */}
      {trip.policyNotes?.trim() ? (
        <section className="rounded-xl border border-brand/15 bg-brand-light/80 p-4 sm:rounded-2xl sm:p-6">
          <h2 className="text-[15px] font-semibold text-brand sm:text-base">นโยบายและการยกเลิก</h2>
          <p className="jad-prose-flow mt-2 whitespace-pre-wrap sm:mt-3">{trip.policyNotes.trim()}</p>
        </section>
      ) : null}

      {/* Sticky bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/80 bg-canvas/95 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] backdrop-blur-md supports-backdrop-filter:bg-canvas/80 sm:px-6 sm:pt-3.5 sm:pb-[max(0.875rem,env(safe-area-inset-bottom,0px))]">
        <div className="jad-container">
          {canBook ? (
            <Link
              href={`/trips/${trip.id}/book`}
              className="jad-btn-primary flex h-12 w-full text-[15px] font-semibold shadow-[0_4px_16px_rgba(30,77,58,0.22)] sm:h-14 sm:text-base"
            >
              จองที่นั่ง
            </Link>
          ) : (
            <p className="rounded-xl border border-border bg-surface py-4 text-center text-sm font-medium text-fg-hint">
              ทริปนี้เต็มแล้ว หรือปิดรับจองแล้ว
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
