import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BookingForm } from "@/components/booking-form";
import { BookingSteps } from "@/components/booking-steps";
import { formatBangkokTripDates } from "@/lib/datetime";
import { PAYMENT_MINUTES } from "@/lib/constants";
import { getPublishedTripById } from "@/lib/trips-public";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function BookTripPage({ params }: Props) {
  const { id } = await params;
  const data = await getPublishedTripById(id);
  if (!data) notFound();
  const { trip, spotsLeft } = data;
  if (spotsLeft <= 0) notFound();

  return (
    <div className="space-y-6">
      <nav aria-label="เส้นทางกลับ">
        <Link href={`/trips/${trip.id}`} className="jad-back-link">
          <ArrowLeft className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
          รายละเอียดทริป
        </Link>
      </nav>
      <BookingSteps current="book" />

      <header className="jad-page-header">
        <p className="jad-section-label">จองที่นั่ง</p>
        <h1 className="jad-page-title">จอง: {trip.title}</h1>
        <p className="text-sm text-fg-muted">
          {formatBangkokTripDates(trip.startAt, trip.endAt)} · ฿{trip.pricePerPerson.toLocaleString("th-TH")}{" "}
          ต่อคน · ชำระเต็มภายใน {PAYMENT_MINUTES} นาทีหลังกดจอง
        </p>
      </header>
      <div className="jad-card">
        <BookingForm
          tripId={trip.id}
          pricePerPerson={trip.pricePerPerson}
          policyNotes={trip.policyNotes ?? null}
          tripPageHref={`/trips/${trip.id}`}
        />
      </div>
    </div>
  );
}
