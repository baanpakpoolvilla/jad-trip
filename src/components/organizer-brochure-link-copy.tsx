"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";

type Props = {
  /** เช่น `/o/abc12xyz` */
  brochureShortPath: string;
  /** NEXT_PUBLIC_APP_URL — ถ้าว่างจะใช้ origin หลัง hydrate */
  appBaseUrl: string;
};

export function OrganizerBrochureLinkCopy({ brochureShortPath, appBaseUrl }: Props) {
  const [clientReady, setClientReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setClientReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const base = useMemo(() => {
    const envBase = appBaseUrl.replace(/\/$/, "");
    return (
      envBase ||
      (clientReady && typeof window !== "undefined" ? window.location.origin : "")
    );
  }, [appBaseUrl, clientReady]);

  const toAbsolute = useCallback(
    (path: string) => {
      if (path.startsWith("http://") || path.startsWith("https://")) return path;
      if (typeof window !== "undefined") {
        return `${window.location.origin}${path.startsWith("/") ? path : `/${path}`}`;
      }
      const b = appBaseUrl.replace(/\/$/, "");
      return b ? `${b}${path.startsWith("/") ? path : `/${path}`}` : path;
    },
    [appBaseUrl],
  );

  const display = base ? `${base}${brochureShortPath}` : brochureShortPath;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(toAbsolute(brochureShortPath));
      showToast("คัดลอกลิงก์แล้ว");
    } catch {
      showToast("คัดลอกไม่สำเร็จ — ลองเลือกลิงก์แล้วคัดลอกเอง");
    }
  }, [brochureShortPath, showToast, toAbsolute]);

  return (
    <div className="space-y-1.5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-2">
        <p className="min-w-0 flex-1 rounded-lg border border-border/60 bg-surface/90 px-2.5 py-2 font-mono text-[11px] leading-snug break-all text-fg sm:self-center sm:py-1.5 sm:text-xs">
          {display || "…"}
        </p>
        <button
          type="button"
          onClick={() => void copy()}
          className="jad-btn-secondary inline-flex h-10 shrink-0 items-center justify-center gap-1.5 px-4 text-sm sm:h-auto sm:min-w-[104px]"
        >
          <Copy className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
          คัดลอก
        </button>
      </div>

      {toast ? (
        <p className="flex items-center gap-1.5 text-xs font-medium text-success" role="status">
          <Check className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
          {toast}
        </p>
      ) : null}
    </div>
  );
}
