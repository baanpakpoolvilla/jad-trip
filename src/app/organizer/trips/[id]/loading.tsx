import { Sk, SkPageHeader } from "@/components/ui/skeleton";

export default function TripDetailLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <Sk className="h-5 w-24" />
      <div className="flex items-start justify-between gap-4">
        <SkPageHeader titleW="w-56" />
        <div className="flex gap-2 shrink-0">
          <Sk className="h-9 w-20 rounded-lg" />
          <Sk className="h-9 w-24 rounded-lg" />
        </div>
      </div>

      {/* Stats bar */}
      <div className="jad-card flex flex-wrap gap-4 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Sk className="h-3 w-16" />
            <Sk className="h-5 w-24" />
          </div>
        ))}
      </div>

      {/* Bookings table */}
      <div className="space-y-3">
        <Sk className="h-6 w-32" />
        <div className="jad-card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["ชื่อ", "เบอร์โทร", "สถานะ", ""].map((h) => (
                  <th key={h} className="px-3 py-3 text-left">
                    <Sk className="h-3.5 w-16" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-3 py-3"><Sk className="h-4 w-28" /></td>
                  <td className="px-3 py-3"><Sk className="h-4 w-24" /></td>
                  <td className="px-3 py-3"><Sk className="h-6 w-16 rounded-full" /></td>
                  <td className="px-3 py-3"><Sk className="h-4 w-14" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
