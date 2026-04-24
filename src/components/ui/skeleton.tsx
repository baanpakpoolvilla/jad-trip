/** กล่อง skeleton เดี่ยว — ใช้ใน loading.tsx */
export function Sk({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-border ${className}`} />;
}

/** Page header skeleton: section-label + title + description */
export function SkPageHeader({ titleW = "w-48" }: { titleW?: string }) {
  return (
    <div className="space-y-2">
      <Sk className="h-3 w-16" />
      <Sk className={`h-8 ${titleW}`} />
      <Sk className="h-4 w-64" />
    </div>
  );
}

/** Table rows skeleton */
export function SkTableRows({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-3 py-3">
              <Sk className={`h-4 ${c === 0 ? "w-32" : "w-20"}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/** Form section skeleton: heading + fields */
export function SkFormSection({ fields = 3 }: { fields?: number }) {
  return (
    <div className="jad-card space-y-4 p-4 sm:p-6">
      <Sk className="h-5 w-32" />
      <div className="space-y-3">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Sk className="h-3.5 w-24" />
            <Sk className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
