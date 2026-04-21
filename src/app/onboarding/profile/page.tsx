import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { OnboardingProfileForm } from "@/components/onboarding-profile-form";
import { OnboardingSteps } from "@/components/onboarding-steps";

export const dynamic = "force-dynamic";

export default async function OnboardingProfilePage() {
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
      onboardingCompletedAt: true,
      socialLine: true,
      socialFacebook: true,
      socialInstagram: true,
    },
  });
  if (!user) redirect("/login");
  if (user.onboardingCompletedAt) redirect("/organizer");

  return (
    <div className="space-y-8">
      <OnboardingSteps current={1} />

      <header className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">
          ขั้นตอนที่ 1 จาก 2
        </p>
        <h1 className="text-2xl font-bold text-fg sm:text-3xl">แนะนำตัวของคุณ</h1>
        <p className="text-sm leading-relaxed text-fg-muted">
          ข้อมูลนี้จะแสดงบนหน้าทริปสาธารณะและการ์ดผู้จัด — สามารถแก้ไขได้ภายหลังจากหน้าโปรไฟล์
        </p>
      </header>

      <OnboardingProfileForm
        defaults={{
          name: user.name,
          phone: user.phone ?? "",
          bio: user.bio ?? "",
          avatarUrl: user.avatarUrl ?? "",
          socialLine: user.socialLine ?? "",
          socialFacebook: user.socialFacebook ?? "",
          socialInstagram: user.socialInstagram ?? "",
        }}
      />
    </div>
  );
}
