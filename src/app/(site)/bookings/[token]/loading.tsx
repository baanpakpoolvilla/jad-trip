import { Sk } from "@/components/ui/skeleton";

export default function BookingLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Steps */}
      <div className="flex items-center gap-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Sk className="size-7 rounded-full" />
            <Sk className="h-4 w-16" />
            {i === 0 && <Sk className="h-px w-8" />}
          </div>
        ))}
      </div>

      {/* Trip summary */}
      <div className="jad-card space-y-3 p-4">
        <Sk className="h-3 w-16" />
        <Sk className="h-6 w-48" />
        <div className="flex flex-wrap gap-3">
          <Sk className="h-4 w-28" />
          <Sk className="h-4 w-20" />
        </div>
      </div>

      {/* Status icon */}
      <div className="flex flex-col items-center gap-3 py-4">
        <Sk className="size-14 rounded-full" />
        <Sk className="h-5 w-32" />
        <Sk className="h-4 w-48" />
      </div>

      {/* Payment details */}
      <div className="jad-card space-y-4 p-4">
        <Sk className="h-5 w-36" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <Sk className="h-4 w-24" />
              <Sk className="h-4 w-20" />
            </div>
          ))}
        </div>
        {/* QR placeholder */}
        <Sk className="mx-auto h-48 w-48 rounded-lg" />
        <Sk className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}
