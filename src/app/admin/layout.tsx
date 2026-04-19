import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminBrandLink, AdminMobileHeader, AdminNav } from "@/components/admin-nav";
import { SignOutButton } from "@/components/sign-out-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/organizer");

  return (
    <div className="flex min-h-full bg-canvas">
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-white/10 bg-brand text-white md:flex">
        <div className="border-b border-white/10 px-4 py-4">
          <AdminBrandLink />
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="เมนูหลักแอดมิน">
          <AdminNav />
        </nav>
        <div className="border-t border-white/10 p-3">
          <SignOutButton variant="onBrand" className="w-full justify-center" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-brand-active/30 bg-brand shadow-sm md:hidden">
          <AdminMobileHeader />
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
