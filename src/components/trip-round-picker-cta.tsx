"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, Check } from "lucide-react";
import type { DepartureRound } from "@/lib/departure-options";

export function TripRoundPickerCta({
  tripId,
  rounds,
  canBook,
}: {
  tripId: string;
  rounds: DepartureRound[];
  canBook: boolean;
}) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const bookHref =
    selectedIdx !== null ? `/trips/${tripId}/book?round=${selectedIdx}` : null;

  return (
    <>
      {/* Round selector section — inline in document flow */}
      {canBook && (
        <section className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:rounded-2xl sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-light text-brand sm:size-9 sm:rounded-lg">
              <CalendarDays className="size-4 sm:size-4.5" strokeWidth={1.5} aria-hidden />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <h2 className="text-[15px] font-semibold text-fg sm:text-[17px]">
                เลือกรอบเดินทาง
              </h2>
              <p className="mt-0.5 text-xs text-fg-muted">
                มี {rounds.length} รอบ — เลือกรอบที่ต้องการก่อนจอง
              </p>
              <div className="mt-3 space-y-2">
                {rounds.map((round) => {
                  const isSelected = selectedIdx === round.index;
                  return (
                    <button
                      key={round.index}
                      type="button"
                      onClick={() => setSelectedIdx(round.index)}
                      className={[
                        "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-all",
                        isSelected
                          ? "border-brand bg-brand-light/60 font-medium text-brand shadow-sm"
                          : "border-border bg-canvas hover:border-brand/40 hover:bg-brand-light/30 text-fg",
                      ].join(" ")}
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className={[
                            "flex size-4.5 shrink-0 items-center justify-center rounded-full border text-[10px]",
                            isSelected
                              ? "border-brand bg-brand text-white"
                              : "border-border bg-surface",
                          ].join(" ")}
                          aria-hidden
                        >
                          {isSelected ? <Check className="size-3" strokeWidth={2.5} /> : null}
                        </span>
                        {round.label}
                      </span>
                      <span className="shrink-0 text-[11px] font-normal text-fg-hint">
                        รอบที่ {round.index + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Sticky bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/80 bg-canvas/95 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] backdrop-blur-md supports-backdrop-filter:bg-canvas/80 sm:px-6 sm:pt-3.5 sm:pb-[max(0.875rem,env(safe-area-inset-bottom,0px))]">
        <div className="jad-container">
          {canBook ? (
            bookHref ? (
              <Link
                href={bookHref}
                className="jad-btn-primary flex h-12 w-full text-[15px] font-semibold shadow-[0_4px_16px_rgba(30,77,58,0.22)] sm:h-14 sm:text-base"
              >
                จองที่นั่ง
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="flex h-12 w-full cursor-not-allowed items-center justify-center rounded-xl bg-brand/30 text-[15px] font-semibold text-white/70 sm:h-14 sm:text-base"
              >
                เลือกรอบก่อนจอง
              </button>
            )
          ) : (
            <p className="rounded-xl border border-border bg-surface py-4 text-center text-sm font-medium text-fg-hint">
              ทริปนี้เต็มแล้ว หรือปิดรับจองแล้ว
            </p>
          )}
        </div>
      </div>
    </>
  );
}
