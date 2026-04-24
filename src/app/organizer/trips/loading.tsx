import { Sk, SkPageHeader } from "@/components/ui/skeleton";

export default function OrganizerTripsLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-start justify-between gap-4">
        <SkPageHeader titleW="w-36" />
        <Sk className="h-9 w-28 shrink-0" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="jad-card space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1 min-w-0">
                <Sk className="h-5 w-48" />
                <Sk className="h-4 w-64" />
              </div>
              <Sk className="h-6 w-16 shrink-0 rounded-full" />
            </div>
            <div className="flex gap-4">
              <Sk className="h-4 w-28" />
              <Sk className="h-4 w-20" />
            </div>
            <div className="flex gap-2 pt-1">
              <Sk className="h-8 w-20 rounded-lg" />
              <Sk className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
