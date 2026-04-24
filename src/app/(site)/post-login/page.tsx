import { redirect } from "next/navigation";
import { safeAuth } from "@/lib/auth-session";
import { db } from "@/lib/db";

export default async function PostLoginPage() {
  const session = await safeAuth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompletedAt: true },
  });

  if (!user?.onboardingCompletedAt) redirect("/onboarding");
  redirect("/organizer");
}
