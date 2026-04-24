import { Sk, SkPageHeader, SkFormSection } from "@/components/ui/skeleton";

export default function OrganizerProfileLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <SkPageHeader titleW="w-40" />

      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <Sk className="size-24 rounded-full" />
        <Sk className="h-4 w-48" />
        <Sk className="h-9 w-36 rounded-lg" />
      </div>

      <SkFormSection fields={3} />
      <SkFormSection fields={4} />

      {/* Social links */}
      <div className="jad-card space-y-3 p-4 sm:p-6">
        <Sk className="h-5 w-28" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Sk className="h-3.5 w-20" />
              <Sk className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>

      <Sk className="h-10 w-full rounded-lg" />
    </div>
  );
}
