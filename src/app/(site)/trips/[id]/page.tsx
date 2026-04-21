import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import {
  OrganizerProfileCard,
  parseGalleryUrls,
  TripDestinationSection,
  TripGalleryGrid,
  TripHero,
  TripRichBlock,
} from "@/components/trip-public-parts";
import {
  getPublishedTripById,
  organizerPublicBrochureHrefFromOrganizer,
  organizerPublicProfilePath,
} from "@/lib/trips-public";
import {
  tripDestinationMapEmbedUrl,
  tripDestinationOpenStreetMapUrl,
} from "@/lib/trip-destination-map-embed";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

const fetchTripData = cache(getPublishedTripById);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchTripData(id);
  if (!data) return {};

  const { trip } = data;
  const title = trip.title;
  const description =
    trip.shortDescription?.trim() ||
    (trip.description?.replace(/<[^>]*>/g, "").slice(0, 155) ?? "");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      ...(trip.coverImageUrl ? { images: [{ url: trip.coverImageUrl, alt: title }] } : {}),
    },
    twitter: {
      card: trip.coverImageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(trip.coverImageUrl ? { images: [trip.coverImageUrl] } : {}),
    },
    alternates: {
      canonical: `/trips/${id}`,
    },
  };
}

export default async function TripDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await fetchTripData(id);
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
  const organizerPublicProfileHref = org.brochureShareCode?.trim()
    ? organizerPublicProfilePath(org.brochureShareCode)
    : null;

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

      {/* ลำดับเดียวกับหมวด «เล่าเรื่องทริป» ในฟอร์มผู้จัด */}
      <TripRichBlock title="การเดินทางระหว่างทริป" body={trip.travelNotes} variant="travel" />
      <TripRichBlock
        title="รวมในราคา · ค่าใช้จ่ายเพิ่ม"
        body={trip.highlights}
        variant="highlight"
        bodyAsList
      />
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
        <TripRichBlock
          title="ของที่ควรเตรียม"
          body={trip.packingList}
          variant="packing"
          bodyAsList
        />
        <TripRichBlock title="ข้อควรระวัง" body={trip.safetyNotes} variant="warning" bodyAsList />
      </div>
      <TripRichBlock
        title="สิ่งที่ทีมงานจัดให้"
        body={trip.guideProvides}
        variant="guide"
        bodyAsList
      />

      <TripRichBlock title="กำหนดการ (ไทม์ไลน์)" body={trip.itinerary} variant="itinerary" />

      {/* Meet point */}
      <section className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:rounded-2xl sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-light text-brand sm:size-9 sm:rounded-lg">
            <MapPin className="size-4 sm:size-4.5" strokeWidth={1.5} aria-hidden />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 className="text-[15px] font-semibold text-fg sm:text-[17px]">จุดนัดพบ / จุดรวมกลุ่ม</h2>
            <p className="jad-prose-flow mt-2 whitespace-pre-wrap sm:mt-2.5">{trip.meetPoint}</p>
            {trip.meetPointLat != null &&
            trip.meetPointLng != null &&
            Number.isFinite(trip.meetPointLat) &&
            Number.isFinite(trip.meetPointLng) ? (
              <>
                <div className="relative mt-4 aspect-video w-full min-h-48 overflow-hidden rounded-lg border border-border/70 bg-canvas-muted/40 sm:min-h-56">
                  <iframe
                    title="แผนที่จุดนัดพบ"
                    src={tripDestinationMapEmbedUrl(trip.meetPointLat, trip.meetPointLng, 15)}
                    className="absolute inset-0 h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
                <p className="mt-2 text-[10px] text-fg-hint sm:text-xs">
                  <a
                    href={tripDestinationOpenStreetMapUrl(trip.meetPointLat, trip.meetPointLng, 16)}
                    className="font-medium text-brand hover:text-brand-mid"
                    target="_blank"
                    rel="noreferrer"
                  >
                    เปิดจุดนี้ใน OpenStreetMap
                  </a>
                </p>
              </>
            ) : null}
          </div>
        </div>
      </section>

      {trip.destinationLat != null &&
      trip.destinationLng != null &&
      Number.isFinite(trip.destinationLat) &&
      Number.isFinite(trip.destinationLng) ? (
        <TripDestinationSection
          name={trip.destinationName ?? ""}
          lat={trip.destinationLat}
          lon={trip.destinationLng}
        />
      ) : null}

      {/* Gallery */}
      <TripGalleryGrid urls={gallery} altBase={trip.title} />

      <OrganizerProfileCard
        name={org.name}
        phone={org.phone}
        bio={org.bio}
        avatarUrl={org.avatarUrl}
        publicProfileHref={organizerPublicProfileHref}
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

      <TripRichBlock title="รู้จักไกด์ / ทีมงาน" body={trip.guideDetails} variant="guide" />

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
