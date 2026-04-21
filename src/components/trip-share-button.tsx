"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

export function TripShareButton({ url, tripTitle }: { url: string; tripTitle: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareUrl = url || window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: tripTitle, url: shareUrl });
        return;
      } catch {
        // user cancelled or not supported — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="แชร์ลิงก์ทริปนี้"
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-fg shadow-sm transition-colors hover:border-brand/35 hover:bg-brand-light/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mid/30 focus-visible:ring-offset-2"
    >
      {copied ? (
        <>
          <Check className="size-4 shrink-0 text-success" strokeWidth={2} aria-hidden />
          คัดลอกแล้ว!
        </>
      ) : (
        <>
          <Share2 className="size-4 shrink-0 text-brand" strokeWidth={1.5} aria-hidden />
          แชร์ทริป
        </>
      )}
    </button>
  );
}
