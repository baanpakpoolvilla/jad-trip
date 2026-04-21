import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { OrganizerProfileForm } from "@/components/organizer-profile-form";

export const dynamic = "force-dynamic";

export default async function OrganizerProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      bio: true,
      avatarUrl: true,
      isGuide: true,
      updatedAt: true,
      socialWebsite: true,
      socialLine: true,
      socialFacebook: true,
      socialInstagram: true,
      socialTiktok: true,
      socialYoutube: true,
      socialX: true,
    },
  });
  if (!user) redirect("/login");

  const defaults = {
    userId: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    bio: user.bio ?? "",
    avatarUrl: user.avatarUrl ?? "",
    isGuide: user.isGuide,
    socialWebsite: user.socialWebsite ?? "",
    socialLine: user.socialLine ?? "",
    socialFacebook: user.socialFacebook ?? "",
    socialInstagram: user.socialInstagram ?? "",
    socialTiktok: user.socialTiktok ?? "",
    socialYoutube: user.socialYoutube ?? "",
    socialX: user.socialX ?? "",
  };

  return (
    <div className="space-y-6">
      <Link href="/organizer" className="jad-back-link">
        <ArrowLeft className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
        แดชบอร์ด
      </Link>
      <header className="jad-page-header">
        <p className="jad-section-label">ผู้จัด</p>
        <h1 className="jad-page-title">แก้ไขโปรไฟล์</h1>
        <p className="text-sm text-fg-muted">
          ข้อมูลนี้ใช้กับการ์ดผู้จัดบนหน้าทริป — หากเปิดโหมดไกด์ ผู้จัดคนอื่นสามารถเลือกคุณเป็นผู้นำทริปได้
        </p>
      </header>
      <OrganizerProfileForm key={user.updatedAt.toISOString()} defaults={defaults} />
    </div>
  );
}
