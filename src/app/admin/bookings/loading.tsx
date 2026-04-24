import { Sk, SkPageHeader, SkTableRows } from "@/components/ui/skeleton";

export default function AdminBookingsLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <SkPageHeader titleW="w-40" />
      <div className="jad-card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr>
              {["ทริป", "ผู้จอง", "สถานะ", "เวลา"].map((h) => (
                <th key={h} className="px-3 py-3 text-left">
                  <Sk className="h-3.5 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <SkTableRows rows={8} cols={4} />
          </tbody>
        </table>
      </div>
    </div>
  );
}
