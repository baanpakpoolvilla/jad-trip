import { Sk, SkPageHeader } from "@/components/ui/skeleton";

export default function TripsListLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <SkPageHeader titleW="w-56" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="jad-card overflow-hidden p-0">
            <Sk className="h-40 w-full rounded-none" />
            <div className="space-y-2 p-4">
              <Sk className="h-5 w-3/4" />
              <Sk className="h-4 w-1/2" />
              <div className="flex gap-2 pt-1">
                <Sk className="h-6 w-20 rounded-full" />
                <Sk className="h-6 w-16 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
