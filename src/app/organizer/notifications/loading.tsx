import { Sk, SkPageHeader } from "@/components/ui/skeleton";

export default function NotificationsLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <SkPageHeader titleW="w-40" />

      {/* Tabs */}
      <div className="flex gap-2">
        <Sk className="h-9 w-28 rounded-lg" />
        <Sk className="h-9 w-28 rounded-lg" />
      </div>

      {/* Notification items */}
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="jad-card flex gap-3 p-4">
            <Sk className="size-9 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2 min-w-0">
              <Sk className="h-4 w-3/4" />
              <Sk className="h-3.5 w-1/2" />
              <Sk className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
