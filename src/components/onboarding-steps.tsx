import { Check } from "lucide-react";

const STEPS = [
  { n: 1, label: "แนะนำตัว" },
  { n: 2, label: "ช่องรับเงิน" },
];

export function OnboardingSteps({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, idx) => {
        const done = step.n < current;
        const active = step.n === current;
        return (
          <div key={step.n} className="flex min-w-0 flex-1 items-center">
            {/* Connector line before: colored when user has reached this step */}
            {idx > 0 && (
              <div
                className={`h-0.5 flex-1 ${current >= step.n ? "bg-brand" : "bg-border"}`}
              />
            )}

            <div className="flex flex-col items-center gap-1.5 px-2">
              <div
                className={`flex size-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                  done
                    ? "border-brand bg-brand text-white"
                    : active
                      ? "border-brand bg-brand-light text-brand"
                      : "border-border bg-canvas text-fg-hint"
                }`}
              >
                {done ? <Check className="size-4" strokeWidth={2.5} aria-hidden /> : step.n}
              </div>
              <span
                className={`text-[11px] font-medium leading-none ${
                  active ? "text-brand" : done ? "text-fg-muted" : "text-fg-hint"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line (after last item hidden) */}
            {idx < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 ${current > step.n ? "bg-brand" : "bg-border"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
