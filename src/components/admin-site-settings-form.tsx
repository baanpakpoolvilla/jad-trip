"use client";

import { useActionState, useState } from "react";
import { Image as ImageIcon, Info, Trash2, Type, Upload } from "lucide-react";
import { saveSiteSettings } from "@/app/actions/admin-site-settings";
import type { SiteSettings } from "@/lib/site-settings";

const ACCEPT = "image/jpeg,image/png,image/webp,image/svg+xml,image/x-icon";
const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MB — must match route.ts

async function uploadSiteImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/site-images", { method: "POST", body: fd });
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok) throw new Error(data.error ?? "อัปโหลดไม่สำเร็จ");
  if (!data.url) throw new Error("ไม่ได้รับ URL จากเซิร์ฟเวอร์");
  return data.url;
}

function ImageUploadField({
  label,
  hint,
  name,
  initialUrl,
  previewShape,
  disabled,
}: {
  label: string;
  hint: string;
  name: string;
  initialUrl: string | null;
  previewShape: "square" | "wide";
  disabled: boolean;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-sm font-medium text-fg">{label}</label>
        {url ? (
          <button
            type="button"
            onClick={() => { setUrl(""); setErr(null); }}
            className="flex items-center gap-1 text-xs text-fg-muted hover:text-error"
          >
            <Trash2 className="size-3" strokeWidth={1.5} aria-hidden />
            ลบรูป
          </button>
        ) : null}
      </div>

      <input type="hidden" name={name} value={url} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {/* Preview */}
        <div
          className={
            previewShape === "wide"
              ? "flex h-14 w-40 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-canvas-muted/60 px-2"
              : "flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-canvas-muted/60"
          }
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt=""
              className={
                previewShape === "wide"
                  ? "h-full w-auto max-w-full object-contain"
                  : "size-full object-contain"
              }
            />
          ) : (
            <ImageIcon className="size-6 text-fg-hint/50" strokeWidth={1.5} aria-hidden />
          )}
        </div>

        {/* Upload button + status */}
        <div className="flex flex-1 flex-col gap-1.5">
          <label
            className={
              busy || disabled
                ? "pointer-events-none flex cursor-not-allowed items-center gap-2 self-start rounded-lg border border-border bg-canvas px-3 py-2 text-sm font-medium text-fg-muted opacity-50"
                : "flex cursor-pointer items-center gap-2 self-start rounded-lg border border-border bg-canvas px-3 py-2 text-sm font-medium text-fg shadow-sm transition-colors hover:border-brand/40 hover:bg-brand-light/30"
            }
          >
            <Upload className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
            {busy ? "กำลังอัปโหลด…" : "เลือกไฟล์"}
            <input
              type="file"
              accept={ACCEPT}
              disabled={busy || disabled}
              className="sr-only"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                setErr(null);
                if (f.size > MAX_FILE_BYTES) {
                  setErr("ไฟล์ต้องไม่เกิน 2 MB");
                  return;
                }
                setBusy(true);
                try {
                  setUrl(await uploadSiteImage(f));
                } catch (error) {
                  setErr(error instanceof Error ? error.message : "อัปโหลดไม่สำเร็จ");
                } finally {
                  setBusy(false);
                }
              }}
            />
          </label>
          <p className="text-xs text-fg-hint">{hint}</p>
          {err ? <p className="text-xs font-medium text-error">{err}</p> : null}
          {url ? (
            <p className="max-w-xs truncate font-mono text-[11px] text-fg-hint">{url}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type ActionState = { error?: string; ok?: boolean } | null;

export function AdminSiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(
    saveSiteSettings as (p: ActionState, fd: FormData) => Promise<ActionState>,
    null,
  );

  return (
    <form action={formAction} className="space-y-6">
      {state?.error ? (
        <p className="jad-alert-error text-sm" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p
          className="rounded-lg border border-success/25 bg-success-light px-4 py-3 text-sm text-success"
          role="status"
        >
          บันทึกการตั้งค่าแล้ว — เว็บไซต์จะแสดงข้อมูลใหม่ทันที
        </p>
      ) : null}

      {/* ชื่อและข้อความ */}
      <section className="jad-card space-y-5">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <Type className="size-4 text-brand" strokeWidth={1.5} aria-hidden />
          <h2 className="text-sm font-semibold text-fg">ชื่อและข้อความ</h2>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="siteName" className="block text-sm font-medium text-fg">
            ชื่อเว็บไซต์ <span className="text-error">*</span>
          </label>
          <input
            id="siteName"
            name="siteName"
            type="text"
            required
            maxLength={80}
            defaultValue={settings.siteName}
            placeholder="Say Hi Trip"
            className="jad-input w-full"
          />
          <p className="text-xs text-fg-hint">แสดงในแถบชื่อเบราว์เซอร์ และ Open Graph</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="siteTagline" className="block text-sm font-medium text-fg">
            แท็กไลน์{" "}
            <span className="text-xs font-normal text-fg-hint">(ข้อความรองใต้โลโก้)</span>
          </label>
          <input
            id="siteTagline"
            name="siteTagline"
            type="text"
            maxLength={120}
            defaultValue={settings.siteTagline}
            placeholder="ส่ง Trip ให้ทุกคน"
            className="jad-input w-full"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="siteDescription" className="block text-sm font-medium text-fg">
            คำอธิบายเว็บไซต์
          </label>
          <textarea
            id="siteDescription"
            name="siteDescription"
            rows={3}
            maxLength={500}
            defaultValue={settings.siteDescription}
            placeholder="คำอธิบายสั้นๆ สำหรับ SEO และ Open Graph"
            className="jad-input w-full resize-none"
          />
          <p className="text-xs text-fg-hint">ใช้ใน meta description และ Open Graph description</p>
        </div>
      </section>

      {/* รูปภาพ */}
      <section className="jad-card space-y-5">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <ImageIcon className="size-4 text-brand" strokeWidth={1.5} aria-hidden />
          <h2 className="text-sm font-semibold text-fg">รูปภาพ</h2>
        </div>

        <ImageUploadField
          label="โลโก้เว็บไซต์"
          hint="แสดงในเฮดเดอร์แทนข้อความ — JPEG, PNG, WebP, SVG ไม่เกิน 2 MB"
          name="logoUrl"
          initialUrl={settings.logoUrl}
          previewShape="wide"
          disabled={pending}
        />

        <div className="border-t border-border/60 pt-4">
          <ImageUploadField
            label="Favicon"
            hint="ไอคอนในแท็บเบราว์เซอร์ — ICO, PNG, SVG แนะนำ 32×32 px ไม่เกิน 2 MB"
            name="faviconUrl"
            initialUrl={settings.faviconUrl}
            previewShape="square"
            disabled={pending}
          />
        </div>

        <div className="border-t border-border/60 pt-4">
          <ImageUploadField
            label="รูปพรีวิวลิ้งค์ (OG Image)"
            hint="แสดงเมื่อแชร์ลิ้งค์บน Facebook, LINE, Twitter ฯลฯ — JPEG, PNG, WebP แนะนำ 1200×630 px ไม่เกิน 2 MB"
            name="ogImageUrl"
            initialUrl={settings.ogImageUrl}
            previewShape="wide"
            disabled={pending}
          />
        </div>
      </section>

      {/* หมายเหตุ */}
      <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-canvas px-4 py-3 text-xs text-fg-muted">
        <Info className="mt-0.5 size-3.5 shrink-0 text-fg-hint" strokeWidth={1.5} aria-hidden />
        <p>
          การเปลี่ยนชื่อเว็บจะมีผลต่อ metadata ของทุกหน้า (title, OG, Twitter Card) —
          บางค่าอาจใช้เวลาสักครู่กว่า CDN / cache จะอัปเดต
        </p>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="jad-btn-primary px-6">
          {pending ? "กำลังบันทึก…" : "บันทึกการตั้งค่า"}
        </button>
      </div>
    </form>
  );
}
