import Link from "next/link";
import { redirect } from "next/navigation";
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
        ← แดชบอร์ด
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

      <section className="jad-card space-y-4" aria-labelledby="notif-help-heading">
        <h2 id="notif-help-heading" className="text-sm font-semibold text-fg">
          แจ้งเตือนคืออะไร?
        </h2>
        <p className="text-sm leading-relaxed text-fg-muted">
          หน้านี้รวบรวมเหตุการณ์สำคัญของทริปที่คุณเป็นผู้จัด โดยเฉพาะเมื่อมีผู้จองชำระเงินสำเร็จ
          ระบบจะสร้างรายการพร้อมลิงก์ไปหน้าทริปเพื่อตรวจรายชื่อผู้จองและสถานะการชำระเงิน
        </p>
        <ul className="list-inside list-disc space-y-1.5 text-sm text-fg-muted">
          <li>
            <span className="font-medium text-fg">ชำระผ่านสลิป</span> — เมื่อผู้จองอัปโหลดสลิปและระบบตรวจสอบผ่าน
            (PromptPay / โอนธนาคารตามที่คุณตั้งค่า)
          </li>
          <li>
            <span className="font-medium text-fg">ชำระผ่าน Stripe</span> — เมื่อการชำระด้วยบัตรหรือช่องทางที่ Stripe รองรับสำเร็จ
          </li>
        </ul>
        <p className="text-xs leading-relaxed text-fg-hint">
          การกด «ทำเครื่องหมายว่าอ่านแล้ว» จะลดตัวเลขแจ้งเตือนบนเมนู — ไม่กระทบสถานะการจองในฐานข้อมูล
        </p>
      </section>

      <section className="space-y-4" aria-labelledby="notif-list-heading">
        <h2 id="notif-list-heading" className="text-lg font-semibold text-fg">
          รายการล่าสุด
        </h2>
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
          }))}
          formatDate={(iso) => formatBangkok(new Date(iso))}
        />
      </section>
    </div>
  );
}
