import { Check } from "lucide-react";

type Step = { label: string; done: boolean; current: boolean };

export function BookingSteps({ current }: { current: "book" | "pay" }) {
  const steps: Step[] = [
    { label: "กรอกข้อมูล", done: current === "pay", current: current === "book" },
    { label: "ชำระเงิน", done: false, current: current === "pay" },
  ];

  return (
    <nav aria-label="ขั้นตอนการจอง" className="flex items-center gap-0">
      {steps.map((step, i) => (
        <div key={step.label} className="flex min-w-0 items-center">
          <div className="flex items-center gap-2">
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                step.done
                  ? "bg-success text-white"
                  : step.current
                    ? "bg-brand text-white"
                    : "border border-border bg-surface text-fg-muted"
              }`}
              aria-current={step.current ? "step" : undefined}
            >
              {step.done ? (
                <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
              ) : (
                i + 1
              )}
            </span>
            <span
              className={`text-xs font-medium ${
                step.current ? "text-fg" : step.done ? "text-success" : "text-fg-muted"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 ? (
            <div className="mx-3 h-px w-8 shrink-0 bg-border sm:w-12" aria-hidden />
          ) : null}
        </div>
      ))}
    </nav>
  );
}
