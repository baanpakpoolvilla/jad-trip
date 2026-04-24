import { Sk, SkFormSection } from "@/components/ui/skeleton";

export default function EditTripLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <Sk className="h-5 w-28" />
      <div className="space-y-2">
        <Sk className="h-8 w-44" />
        <Sk className="h-4 w-64" />
      </div>
      <SkFormSection fields={2} />
      <SkFormSection fields={3} />
      <SkFormSection fields={4} />
      <SkFormSection fields={2} />
      <div className="flex gap-3 pt-2">
        <Sk className="h-10 flex-1 rounded-lg" />
        <Sk className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  );
}
