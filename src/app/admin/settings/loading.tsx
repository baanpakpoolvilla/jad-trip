import { Sk, SkPageHeader, SkFormSection } from "@/components/ui/skeleton";

export default function AdminSettingsLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <SkPageHeader titleW="w-48" />
      <SkFormSection fields={3} />

      {/* Image upload sections */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="jad-card space-y-3 p-4 sm:p-6">
          <Sk className="h-5 w-32" />
          <Sk className="h-32 w-32 rounded-lg" />
          <Sk className="h-9 w-36 rounded-lg" />
        </div>
      ))}

      <Sk className="h-10 w-full rounded-lg" />
    </div>
  );
}
