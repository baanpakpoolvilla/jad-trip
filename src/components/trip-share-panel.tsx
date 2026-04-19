"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, Link2, Share2 } from "lucide-react";

type Props = {
  tripTitle: string;
  tripId: string;
  shareCode: string;
  /** จาก NEXT_PUBLIC_APP_URL — ถ้าว่างจะใช้ origin ของหน้าตอนโหลดบน client */
  appBaseUrl: string;
};

export function TripSharePanel({ tripTitle, tripId, shareCode, appBaseUrl }: Props) {
  const [origin, setOrigin] = useState(() => appBaseUrl.replace(/\/$/, ""));
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!origin && typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, [origin]);

  const { fullUrl, shortUrl } = useMemo(() => {
    const base = origin || "";
    if (!base) {
      return {
        fullUrl: `/trips/${tripId}`,
        shortUrl: `/t/${shareCode}`,
      };
    }
    return {
      fullUrl: `${base}/trips/${tripId}`,
      shortUrl: `${base}/t/${shareCode}`,
    };
  }, [origin, tripId, shareCode]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, []);

  const copyText = useCallback(
    async (text: string, okMsg: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast(okMsg);
      } catch {
        showToast("คัดลอกไม่สำเร็จ — ลองเลือกลิงก์แล้วคัดลอกเอง");
      }
    },
    [showToast],
  );

  const shareNative = useCallback(async () => {
    const url = shortUrl.startsWith("http") ? shortUrl : `${window.location.origin}${shortUrl}`;
    const title = tripTitle;
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: `${title} — จองทริป`,
          url,
        });
        return;
      }
      await copyText(url, "คัดลอกลิงก์ย่อแล้ว");
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      await copyText(url, "คัดลอกลิงก์ย่อแล้ว");
    }
  }, [copyText, shortUrl, tripTitle]);

  return (
    <div className="jad-card space-y-3 border-brand-mid/25 bg-brand-light/40 p-4">
      <div className="flex items-start gap-2">
        <Link2 className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={1.5} aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-fg">แชร์ทริป</h2>
          <p className="mt-1 text-xs leading-relaxed text-fg-muted">
            ลิงก์ย่อเหมาะโพสต์โซเชียล — ลิงก์เต็มใช้ส่งตรงหรือเก็บอ้างอิง
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() => copyText(shortUrl, "คัดลอกลิงก์ย่อแล้ว")}
          className="jad-btn-secondary inline-flex h-11 flex-1 items-center justify-center gap-2 px-4 text-sm sm:min-w-[140px] sm:flex-none"
        >
          <Copy className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
          คัดลอกลิงก์ย่อ
        </button>
        <button
          type="button"
          onClick={() => copyText(fullUrl, "คัดลอกลิงก์เต็มแล้ว")}
          className="jad-btn-secondary inline-flex h-11 flex-1 items-center justify-center gap-2 px-4 text-sm sm:min-w-[140px] sm:flex-none"
        >
          <Copy className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
          คัดลอกลิงก์เต็ม
        </button>
        <button
          type="button"
          onClick={() => void shareNative()}
          className="jad-btn-primary inline-flex h-11 flex-1 items-center justify-center gap-2 px-4 text-sm sm:min-w-[140px] sm:flex-none"
        >
          <Share2 className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
          แชร์
        </button>
      </div>

      <dl className="space-y-2 rounded-lg bg-surface/80 px-3 py-2.5 text-xs text-fg-muted">
        <div>
          <dt className="font-medium text-fg-hint">ลิงก์ย่อ</dt>
          <dd className="mt-0.5 break-all font-mono text-fg">{shortUrl}</dd>
        </div>
        <div>
          <dt className="font-medium text-fg-hint">ลิงก์เต็ม</dt>
          <dd className="mt-0.5 break-all font-mono text-fg">{fullUrl}</dd>
        </div>
      </dl>

      {toast ? (
        <p
          className="flex items-center gap-1.5 text-xs font-medium text-success"
          role="status"
        >
          <Check className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
          {toast}
        </p>
      ) : null}
    </div>
  );
}
