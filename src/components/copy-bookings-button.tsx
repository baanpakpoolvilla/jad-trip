"use client";

import { useState } from "react";
import { Check, ClipboardList } from "lucide-react";

type BookingRow = {
  name: string;
  phone: string;
  status: string;
  round?: string;
};

function statusLabel(s: string) {
  if (s === "CONFIRMED") return "จองแล้ว";
  if (s === "PENDING_PAYMENT") return "รอชำระ";
  return s;
}

export function CopyBookingsButton({
  bookings,
  tripTitle,
}: {
  bookings: BookingRow[];
  tripTitle: string;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const lines = [
      `รายชื่อผู้จอง: ${tripTitle}`,
      `รวม ${bookings.length} คน`,
      "",
      ...bookings.map(
        (b, i) =>
          `${i + 1}. ${b.name} | ${b.phone} | ${statusLabel(b.status)}${b.round ? ` | ${b.round}` : ""}`,
      ),
    ];
    void navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  if (bookings.length === 0) return null;

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-fg shadow-sm transition-colors hover:border-brand/35 hover:bg-brand-light/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mid/30 focus-visible:ring-offset-2"
    >
      {copied ? (
        <>
          <Check className="size-3.5 shrink-0 text-success" strokeWidth={2} aria-hidden />
          คัดลอกแล้ว!
        </>
      ) : (
        <>
          <ClipboardList className="size-3.5 shrink-0 text-brand" strokeWidth={1.5} aria-hidden />
          คัดลอกรายชื่อ
        </>
      )}
    </button>
  );
}
