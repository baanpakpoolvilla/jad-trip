import { Sk } from "@/components/ui/skeleton";

export default function OrganizerProfilePublicLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Hero */}
      <div className="flex flex-col items-center gap-4 py-6 sm:flex-row sm:items-start sm:gap-6">
        <Sk className="size-24 shrink-0 rounded-full sm:size-32" />
        <div className="w-full space-y-3 text-center sm:text-left">
          <Sk className="mx-auto h-8 w-48 sm:mx-0" />
          <Sk className="mx-auto h-4 w-full max-w-sm sm:mx-0" />
          <Sk className="mx-auto h-4 w-3/4 sm:mx-0" />
          <div className="flex justify-center gap-2 sm:justify-start">
            {Array.from({ length: 4 }).map((_, i) => (
              <Sk key={i} className="size-8 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Trips section */}
      <div className="space-y-4">
        <Sk className="h-6 w-40" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="jad-card overflow-hidden p-0">
              <Sk className="h-36 w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Sk className="h-5 w-3/4" />
                <Sk className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
