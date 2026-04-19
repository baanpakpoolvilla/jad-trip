import Link from "next/link";
import { TripForm } from "@/components/trip-form";

export default function NewTripPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/organizer/trips"
        className="text-sm font-medium text-brand hover:text-brand-mid"
      >
        ← กลับรายการทริป
      </Link>
      <div>
        <h1 className="text-[1.625rem] font-semibold text-fg">สร้างทริป</h1>
        <p className="mt-1 text-sm text-fg-muted">
          กรอกครบแล้วเลือก &quot;เผยแพร่&quot; หรือบันทึกฉบับร่าง
        </p>
      </div>
      <div className="jad-card">
        <TripForm mode="create" />
      </div>
    </div>
  );
}
