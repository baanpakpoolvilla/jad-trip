import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { formatBangkok } from "@/lib/datetime";
import { NotificationList } from "@/components/notification-list";

export const dynamic = "force-dynamic";

export default async function OrganizerNotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ORGANIZER") {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/");
  }

  const userId = session.user.id;

  const [items, unreadCount, totalCount] = await Promise.all([
    db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 80,
    }),
    db.notification.count({ where: { userId, readAt: null } }),
    db.notification.count({ where: { userId } }),
  ]);

  return (
    <div className="space-y-8">
      <Link href="/organizer" className="jad-back-link">
        <ArrowLeft className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
        แดชบอร์ด
      </Link>

      <header className="jad-page-header">
        <p className="jad-section-label">ผู้จัด</p>
        <h1 className="jad-page-title">การแจ้งเตือน</h1>
        <p className="text-sm text-fg-muted">
          รวม {totalCount} รายการ
          {unreadCount > 0 ? (
            <span className="font-medium text-brand"> · ยังไม่อ่าน {unreadCount} รายการ</span>
          ) : (
            <span> · อ่านครบแล้ว</span>
          )}
        </p>
      </header>

      <div className="space-y-4">
        <NotificationList
          totalCount={totalCount}
          unreadCount={unreadCount}
          items={items.map((n) => ({
            id: n.id,
            kind: n.kind,
            title: n.title,
            message: n.message,
            href: n.href,
            readAt: n.readAt?.toISOString() ?? null,
            createdAtIso: n.createdAt.toISOString(),
            createdAtLabel: formatBangkok(n.createdAt),
          }))}
        />
      </div>
    </div>
  );
}
