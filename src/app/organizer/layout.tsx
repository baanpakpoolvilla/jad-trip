import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { safeAuth, getOrganizerUser } from "@/lib/auth-session";
import { OrganizerAppShell } from "@/components/organizer-app-shell";
import { organizerBrochureShortPath } from "@/lib/trips-public";
import { ensureOrganizerBrochureShareCode } from "@/lib/organizer-brochure-share-code";

export default async function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await safeAuth();
  if (!session?.user) redirect("/login");
  if (!session.user.id) redirect("/login");
  if (session.user.role !== "ORGANIZER") {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/");
  }

  // รวม 3 DB round-trips เดิมเป็น 2 queries คู่ขนาน:
  // เดิม: findUnique(onboarding) → [notification.count, findUnique(brochureCode)]
  // ใหม่: [findUnique(onboarding+brochureCode), notification.count]  ← 1 round-trip น้อยกว่า
  const [user, unreadNotifications] = await Promise.all([
    getOrganizerUser(session.user.id),
    db.notification.count({ where: { userId: session.user.id, readAt: null } }),
  ]);

  if (!user?.onboardingCompletedAt) redirect("/onboarding");

  let publicBrochureHref = "/organizer";
  if (user.brochureShareCode) {
    publicBrochureHref = organizerBrochureShortPath(user.brochureShareCode);
  } else {
    try {
      const code = await ensureOrganizerBrochureShareCode(session.user.id);
      publicBrochureHref = organizerBrochureShortPath(code);
    } catch {
      // fail gracefully — sidebar ยังแสดงได้
    }
  }

  return (
    <OrganizerAppShell
      unreadNotifications={unreadNotifications}
      publicBrochureHref={publicBrochureHref}
    >
      {children}
    </OrganizerAppShell>
  );
}
