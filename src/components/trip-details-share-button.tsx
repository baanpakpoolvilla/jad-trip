"use client";

import { useState } from "react";

type Props = {
  tripTitle: string;
  dateRange: string;
  meetPoint?: string;
  packingList?: string;
  policyNotes?: string;
  /** URL เต็ม เช่น https://example.com/bookings/... */
  bookingUrl: string;
  /** Short URL เช่น https://example.com/b/ed50f3c8fafc */
  shortBookingUrl: string;
};

function buildShareText(props: Props): string {
  const lines: string[] = [];
  lines.push(`✈️ ${props.tripTitle}`);
  lines.push(`📅 วันเดินทาง: ${props.dateRange}`);
  if (props.meetPoint?.trim()) {
    lines.push(`📍 จุดนัดพบ: ${props.meetPoint.trim()}`);
  }
  if (props.packingList?.trim()) {
    const items = props.packingList.trim().split("\n").filter(Boolean);
    lines.push(`🎒 สิ่งที่ต้องเตรียม:`);
    items.forEach((item) => lines.push(`  – ${item.trim()}`));
  }
  if (props.policyNotes?.trim()) {
    lines.push(`📋 นโยบาย: ${props.policyNotes.trim()}`);
  }
  lines.push(`\n🔗 ดูรายละเอียดการจอง: ${props.shortBookingUrl}`);
  return lines.join("\n");
}

export function TripDetailsShareButton(props: Props) {
  const [copied, setCopied] = useState(false);

  const text = buildShareText(props);
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  async function handleShare() {
    if (canShare) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // user cancelled or not supported — fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <button
      type="button"
      onClick={() => void handleShare()}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-fg-muted transition-colors hover:bg-canvas hover:text-fg"
    >
      {copied ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 text-success" aria-hidden>
            <path d="M20 6 9 17l-5-5"/>
          </svg>
          คัดลอกแล้ว
        </>
      ) : canShare ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5" aria-hidden>
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <polyline points="16 6 12 2 8 6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
          แชร์รายละเอียด
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5" aria-hidden>
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
          คัดลอกรายละเอียด
        </>
      )}
    </button>
  );
}
