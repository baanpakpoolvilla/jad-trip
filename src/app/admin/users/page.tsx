import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { trips: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-[1.625rem] font-semibold text-fg">ผู้ใช้</h1>
      <div className="jad-card overflow-x-auto p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-canvas text-xs font-medium uppercase tracking-wide text-fg-muted">
            <tr>
              <th className="px-4 py-3">ชื่อ</th>
              <th className="px-4 py-3">อีเมล</th>
              <th className="px-4 py-3">บทบาท</th>
              <th className="px-4 py-3">ทริป</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-canvas/80">
                <td className="px-4 py-3 font-medium text-fg">{u.name}</td>
                <td className="px-4 py-3 text-fg-muted">{u.email}</td>
                <td className="px-4 py-3 text-fg-muted">{u.role}</td>
                <td className="px-4 py-3 text-fg-muted">{u._count.trips}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
