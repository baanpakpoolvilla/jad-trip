import { Sk } from "@/components/ui/skeleton";

export default function TripDetailLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Back link */}
      <Sk className="h-5 w-36" />

      {/* Hero card */}
      <div className="overflow-hidden rounded-xl sm:rounded-2xl">
        <Sk className="h-48 w-full sm:h-64" />
        <div className="space-y-3 bg-brand p-5">
          <Sk className="h-4 w-20" />
          <Sk className="h-8 w-3/4" />
          <Sk className="h-5 w-1/2" />
          <div className="flex flex-wrap gap-2 pt-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Sk key={i} className="h-7 w-28 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Content sections */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="jad-card space-y-3 p-4 sm:p-5">
          <Sk className="h-5 w-32" />
          <Sk className="h-4 w-full" />
          <Sk className="h-4 w-5/6" />
          <Sk className="h-4 w-4/6" />
        </div>
      ))}

      {/* Organizer card */}
      <div className="jad-card flex gap-4 p-4">
        <Sk className="size-14 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2 min-w-0">
          <Sk className="h-5 w-32" />
          <Sk className="h-4 w-48" />
          <Sk className="h-4 w-24" />
        </div>
      </div>

      {/* Book button */}
      <Sk className="fixed bottom-0 left-0 right-0 h-14 rounded-none sm:static sm:rounded-lg" />
    </div>
  );
}
