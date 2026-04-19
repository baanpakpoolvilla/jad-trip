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
    <div className="space-y-6">
      <Link
        href={`/organizer/trips/${trip.id}`}
        className="text-sm font-medium text-brand hover:text-brand-mid"
      >
        ← กลับหน้าทริป
      </Link>
      <div>
        <h1 className="text-[1.625rem] font-semibold text-fg">แก้ไขทริป</h1>
        {locked ? (
          <p className="mt-1 rounded-lg border border-warning/30 bg-warning-light px-3 py-2 text-sm text-warning">
            มีผู้จองแล้ว — แก้ไม่ได้: ชื่อทริป วันเวลา จำนวนที่ ราคา · แก้ได้: รายละเอียด รูป ไกด์
            กำหนดการ การเดินทาง จุดเด่น สิ่งเตรียม คำเตือน โปรไฟล์ผู้จัด และนโยบาย
          </p>
        ) : (
          <p className="mt-1 text-sm text-fg-muted">
            ปรับรายละเอียด ราคา และจำนวนที่ได้เมื่อยังไม่มีผู้จอง
          </p>
        )}
      </div>
      <div className="jad-card">
        <TripForm mode="edit" tripId={trip.id} trip={trip} locked={locked} />
      </div>
    </div>
  );
}
