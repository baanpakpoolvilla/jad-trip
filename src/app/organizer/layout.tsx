import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { OrganizerAppShell } from "@/components/organizer-app-shell";
import { getOrganizerPublicBrochureHref } from "@/lib/organizer-brochure-share-code";

export default async function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ORGANIZER") {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/");
  }

  const userOnboarding = await db.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompletedAt: true },
  });

  if (!userOnboarding?.onboardingCompletedAt) redirect("/onboarding");

  const [unreadNotifications, publicBrochureHref] = await Promise.all([
    db.notification.count({ where: { userId: session.user.id, readAt: null } }),
    getOrganizerPublicBrochureHref(session.user.id),
  ]);

  return (
    <OrganizerAppShell
      unreadNotifications={unreadNotifications}
      publicBrochureHref={publicBrochureHref}
    >
      {children}
    </OrganizerAppShell>
  );
}
