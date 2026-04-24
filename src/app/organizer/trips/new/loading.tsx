import { Sk, SkFormSection } from "@/components/ui/skeleton";

export default function NewTripLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <Sk className="h-5 w-28" />
      <div className="space-y-2">
        <Sk className="h-8 w-44" />
        <Sk className="h-4 w-72" />
      </div>
      <div className="jad-card space-y-4 p-3 sm:p-5">
        {/* AI panel placeholder */}
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Sk className="h-5 w-40" />
              <Sk className="h-3.5 w-56" />
            </div>
            <Sk className="h-8 w-20 rounded-lg" />
          </div>
        </div>
        <SkFormSection fields={2} />
        <SkFormSection fields={3} />
        <SkFormSection fields={4} />
        <div className="flex gap-3 pt-2">
          <Sk className="h-10 flex-1 rounded-lg" />
          <Sk className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
