export default function OrganizerLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-3 w-16 rounded-full bg-surface-alt" />
        <div className="h-7 w-40 rounded-lg bg-surface-alt" />
        <div className="h-4 w-56 rounded bg-surface-alt" />
      </div>
      <div className="jad-card space-y-3 py-4">
        <div className="h-4 w-32 rounded bg-surface-alt" />
        <div className="h-8 w-full rounded-lg bg-surface-alt" />
      </div>
      <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="jad-card h-20" />
        ))}
      </div>
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="h-6 w-36 rounded-lg bg-surface-alt" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="jad-card h-24" />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-6 w-28 rounded-lg bg-surface-alt" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="jad-card h-16" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
