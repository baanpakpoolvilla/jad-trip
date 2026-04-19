import Link from "next/link";
import { notFound } from "next/navigation";
import { TripForm } from "@/components/trip-form";
import { getTripEditDefaults } from "@/app/actions/trips";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditTripPage({ params }: Props) {
  const { id } = await params;
  const data = await getTripEditDefaults(id);
  if (!data) notFound();

  const { trip, hasBookings } = data;
  const locked = hasBookings && trip.status === "PUBLISHED";

  return (
    <div className="space-y-4">
      <Link href={`/organizer/trips/${trip.id}`} className="jad-back-link">
        ← หน้าทริป
      </Link>
      <header className="jad-page-header max-w-2xl">
        <h1 className="jad-page-title">แก้ไขทริป</h1>
        {locked ? (
          <p className="rounded-lg border border-warning/30 bg-warning-light px-3 py-2 text-xs text-warning sm:text-sm">
            มีผู้จองแล้ว — แก้ไม่ได้: ชื่อทริป วันเวลา จำนวนที่ ราคา · แก้ได้: รายละเอียด รูป ไกด์ประจำทริป
            กำหนดการ การเดินทาง จุดเด่น สิ่งเตรียม คำเตือน และนโยบาย (โปรไฟล์ผู้จัดแก้ที่หน้าโปรไฟล์)
          </p>
        ) : (
          <p className="text-xs text-fg-muted sm:text-sm">
            ปรับรายละเอียด ราคา และจำนวนที่ได้เมื่อยังไม่มีผู้จอง
          </p>
        )}
      </header>
      <div className="jad-card p-3 sm:p-5">
        <TripForm mode="edit" tripId={trip.id} trip={trip} locked={locked} />
      </div>
    </div>
  );
}
