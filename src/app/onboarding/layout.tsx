import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ORGANIZER") redirect("/admin");

  return (
    <div className="min-h-screen bg-canvas">
      {/* Minimal header */}
      <header
        className="sticky top-0 z-30 border-b border-white/10"
        style={{ background: "linear-gradient(to right, #163829, #1e4d3a)" }}
      >
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
