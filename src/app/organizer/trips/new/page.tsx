import Link from "next/link";
import { TripForm } from "@/components/trip-form";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export default async function NewTripPage() {
  const session = await auth();
  let organizerDefaults = { bio: "", avatarUrl: "" };
  if (session?.user?.id) {
    const u = await db.user.findUnique({
      where: { id: session.user.id },
      select: { bio: true, avatarUrl: true },
    });
    if (u) {
      organizerDefaults = {
        bio: u.bio ?? "",
        avatarUrl: u.avatarUrl ?? "",
      };
    }
  }

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
        <TripForm mode="create" organizerDefaults={organizerDefaults} />
      </div>
    </div>
  );
}
