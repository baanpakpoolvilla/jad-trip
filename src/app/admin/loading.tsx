import { Sk, SkPageHeader } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-8">
      <SkPageHeader titleW="w-32" />
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="jad-card space-y-2 px-2 py-2.5 sm:px-4 sm:py-4">
            <Sk className="h-3.5 w-20" />
            <Sk className="h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
