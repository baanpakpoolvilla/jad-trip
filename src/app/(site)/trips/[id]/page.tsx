import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <Link
        href="/trips"
        className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-mid"
      >
        ← กลับรายการทริป
      </Link>

      <article className="jad-card space-y-4">
        <h1 className="text-[1.625rem] font-semibold leading-snug text-fg">{trip.title}</h1>
        <p className="text-fg-muted">{trip.shortDescription}</p>
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
              จุดนัดพบ
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
            <dt className="text-fg-muted">ที่นั่ง</dt>
            <dd className="text-right font-medium text-fg">
              เหลือ {spotsLeft} / {trip.maxParticipants}
            </dd>
          </div>
        </dl>

        {trip.policyNotes ? (
          <section className="rounded-lg bg-brand-light/80 p-4 text-sm leading-relaxed text-fg">
            <h2 className="font-semibold text-brand">ข้อกำหนด / การยกเลิก</h2>
            <p className="mt-2 whitespace-pre-wrap text-fg-muted">{trip.policyNotes}</p>
          </section>
        ) : null}

        <section className="text-sm leading-relaxed text-fg-muted">
          <h2 className="text-base font-semibold text-fg">รายละเอียด</h2>
          <p className="mt-2 whitespace-pre-wrap">{trip.description}</p>
        </section>

        <section className="rounded-lg bg-canvas p-4 text-sm text-fg-muted">
          <h2 className="font-semibold text-fg">ผู้จัดทริป</h2>
          <p className="mt-1 text-fg">{trip.organizer.name}</p>
          {trip.organizer.phone ? <p className="mt-1">โทร {trip.organizer.phone}</p> : null}
        </section>
      </article>

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
