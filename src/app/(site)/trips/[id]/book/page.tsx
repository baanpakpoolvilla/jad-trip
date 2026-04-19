import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking-form";
import { formatBangkok } from "@/lib/datetime";
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
      <Link
        href={`/trips/${trip.id}`}
        className="text-sm font-medium text-brand hover:text-brand-mid"
      >
        ← กลับรายละเอียดทริป
      </Link>
      <div>
        <h1 className="text-xl font-semibold text-fg">จอง: {trip.title}</h1>
        <p className="mt-1 text-sm text-fg-muted">
          {formatBangkok(trip.startAt)} · ฿{trip.pricePerPerson.toLocaleString("th-TH")}{" "}
          ต่อคน · ชำระเต็มภายใน {PAYMENT_MINUTES} นาทีหลังกดจอง
        </p>
      </div>
      <div className="jad-card">
        <BookingForm tripId={trip.id} />
      </div>
    </div>
  );
}
