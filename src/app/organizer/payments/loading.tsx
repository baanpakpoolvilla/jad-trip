import { Sk, SkPageHeader, SkFormSection } from "@/components/ui/skeleton";

export default function OrganizerPaymentsLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <SkPageHeader titleW="w-44" />

      {/* Info card */}
      <div className="jad-card space-y-2 p-4">
        <Sk className="h-4 w-full" />
        <Sk className="h-4 w-3/4" />
      </div>

      <SkFormSection fields={2} />

      {/* QR upload */}
      <div className="jad-card space-y-3 p-4 sm:p-6">
        <Sk className="h-5 w-32" />
        <Sk className="h-40 w-full rounded-lg" />
        <Sk className="h-9 w-36 rounded-lg" />
      </div>

      <SkFormSection fields={3} />
      <Sk className="h-10 w-full rounded-lg" />
    </div>
  );
}
