import Link from "next/link";
import { TripForm } from "@/components/trip-form";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export default async function NewTripPage() {
  const session = await auth();
  let organizerProfile = {
    userId: "",
    name: "",
    bio: "",
    avatarUrl: "",
  };
  if (session?.user?.id) {
    const u = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, bio: true, avatarUrl: true },
    });
    if (u) {
      organizerProfile = {
        userId: u.id,
        name: u.name,
        bio: u.bio ?? "",
        avatarUrl: u.avatarUrl ?? "",
      };
    }
  }

  return (
    <div className="space-y-4">
      <Link href="/organizer/trips" className="jad-back-link">
        ← รายการทริป
      </Link>
      <header className="jad-page-header max-w-2xl">
        <h1 className="jad-page-title">สร้างทริปใหม่</h1>
        <p className="text-xs text-fg-muted sm:text-sm">
          บันทึกฉบับร่างได้ตลอด — กดเผยแพร่เมื่อพร้อมรับจอง
        </p>
      </header>
      <div className="jad-card p-4 sm:p-5">
        <TripForm mode="create" organizerProfile={organizerProfile} />
      </div>
    </div>
  );
}
