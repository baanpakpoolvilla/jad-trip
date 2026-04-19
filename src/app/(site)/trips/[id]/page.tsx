import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Users } from "lucide-react";
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
    <div className="space-y-6">
      <Link
        href="/trips"
        className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-mid"
      >
        ← กลับรายการทริป
      </Link>

      <TripSharePanel
        tripTitle={trip.title}
        tripId={trip.id}
        shareCode={shareCode}
        appBaseUrl={appBaseUrl}
      />

      {trip.coverImageUrl?.trim() ? (
        <TripCoverImage src={trip.coverImageUrl.trim()} alt={trip.title} />
      ) : null}

      <article className="jad-card space-y-5">
        <header className="space-y-2">
          <h1 className="text-[1.625rem] font-semibold leading-snug text-fg">{trip.title}</h1>
          <p className="text-fg-muted">{trip.shortDescription}</p>
        </header>

        <OrganizerProfileCard
          name={org.name}
          phone={org.phone}
          bio={org.bio}
          avatarUrl={org.avatarUrl}
        />

        <dl className="grid gap-0 text-sm">
          <div className="flex justify-between gap-4 border-b border-border py-2.5">
            <dt className="text-fg-muted">วันเวลา</dt>
            <dd className="text-right font-medium text-fg">
              {formatBangkok(trip.startAt)} — {formatBangkok(trip.endAt)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-border py-2.5">
            <dt className="inline-flex items-center gap-1 text-fg-muted">
              <MapPin className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
              จุดนัดพบครั้งแรก
            </dt>
            <dd className="max-w-[60%] text-right text-fg">{trip.meetPoint}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-border py-2.5">
            <dt className="text-fg-muted">ราคา</dt>
            <dd className="text-right font-semibold text-brand">
              ฿{trip.pricePerPerson.toLocaleString("th-TH")} / คน
            </dd>
          </div>
          <div className="flex justify-between gap-4 py-2.5">
            <dt className="inline-flex items-center gap-1 text-fg-muted">
              <Users className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
              จำนวนผู้เข้าร่วม
            </dt>
            <dd className="text-right font-medium text-fg">
              เหลือ {spotsLeft} / {trip.maxParticipants} ที่
            </dd>
          </div>
        </dl>
      </article>

      <TripRichBlock title="ภาพรวมทริป" body={trip.description} />

      <TripRichBlock title="รายละเอียดไกด์ / ทีมงาน" body={trip.guideDetails} />

      <TripRichBlock title="กำหนดการเดินทาง" body={trip.itinerary} />

      <TripRichBlock title="การเดินทาง" body={trip.travelNotes} />

      <TripRichBlock title="จุดเด่น · สิ่งที่จะได้เจอ · จุดหมาย" body={trip.highlights} />

      <div className="grid gap-4 sm:grid-cols-2">
        <TripRichBlock title="สิ่งที่ต้องเตรียม" body={trip.packingList} />
        <TripRichBlock title="สิ่งที่ต้องระวัง" body={trip.safetyNotes} variant="plain" />
      </div>

      <TripRichBlock title="สิ่งที่ไกด์เตรียมให้" body={trip.guideProvides} />

      <TripGalleryGrid urls={gallery} altBase={trip.title} />

      {trip.policyNotes?.trim() ? (
        <section className="rounded-lg bg-brand-light/80 p-4 text-sm leading-relaxed text-fg">
          <h2 className="font-semibold text-brand">ข้อกำหนด / การยกเลิก</h2>
          <p className="mt-2 whitespace-pre-wrap text-fg-muted">{trip.policyNotes.trim()}</p>
        </section>
      ) : null}

      <div className="sticky bottom-4 pb-[env(safe-area-inset-bottom)]">
        {canBook ? (
          <Link
            href={`/trips/${trip.id}/book`}
            className="jad-btn-primary flex h-14 w-full text-base shadow-[0_2px_8px_rgba(30,77,58,0.15)]"
          >
            จองที่นั่ง
          </Link>
        ) : (
          <p className="jad-card text-center text-sm text-fg-muted">
            ทริปนี้เต็มแล้วหรือปิดรับจอง
          </p>
        )}
      </div>
    </div>
  );
}
