import Link from "next/link";
import { redirect } from "next/navigation";
import { safeAuth } from "@/lib/auth-session";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await safeAuth();
  if (!session?.user) redirect("/login");
  if (!session.user.id) redirect("/login");
  if (session.user.role !== "ORGANIZER") redirect("/admin");

  return (
    <div className="min-h-screen bg-canvas">
      <header className="jad-public-header sticky top-0 z-30 border-b border-white/10">
        <div className="mx-auto flex max-w-4xl items-center px-4 py-3 sm:px-6">
          <Link href="/" className="text-base font-bold tracking-tight text-white">
            Say Hi Trip
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>
    </div>
  );
}
