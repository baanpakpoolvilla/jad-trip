"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateOrganizerProfile,
  type OrganizerProfileActionState,
} from "@/app/actions/organizer-profile";
import {
  ORGANIZER_IMAGE_ACCEPT,
  uploadOrganizerImageFile,
} from "@/lib/organizer-upload-image";

type Defaults = {
  userId: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  avatarUrl: string;
  isGuide: boolean;
  socialWebsite: string;
  socialLine: string;
  socialFacebook: string;
  socialInstagram: string;
  socialTiktok: string;
  socialYoutube: string;
  socialX: string;
};

export function OrganizerProfileForm({ defaults }: { defaults: Defaults }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateOrganizerProfile as (
      p: OrganizerProfileActionState,
      fd: FormData,
    ) => Promise<OrganizerProfileActionState>,
    {} as OrganizerProfileActionState,
  );

  const [avatarUrl, setAvatarUrl] = useState(defaults.avatarUrl);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      router.refresh();
    }
  }, [state, router]);

  const initial = defaults.name.trim().charAt(0) || "?";

  return (
    <form action={formAction} className="space-y-6">
      {state && "error" in state && state.error ? (
        <p className="jad-alert-error">{state.error}</p>
      ) : null}
      {state && "ok" in state && state.ok ? (
        <p className="rounded-lg border border-success/25 bg-success-light px-4 py-3 text-sm text-success">
          บันทึกโปรไฟล์แล้ว
        </p>
      ) : null}

      <input type="hidden" name="avatarUrl" value={avatarUrl} readOnly />

      <div className="flex flex-col items-center text-center">
        <div
          className="relative size-28 shrink-0 overflow-hidden rounded-full border-2 border-border bg-canvas-muted shadow-sm ring-1 ring-black/5 sm:size-36"
          role="img"
          aria-label={
            avatarUrl ? "รูปโปรไฟล์ปัจจุบัน" : "ยังไม่มีรูปโปรไฟล์"
          }
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center bg-brand-light/40 text-2xl font-semibold text-brand sm:text-3xl">
              {initial}
            </div>
          )}
        </div>
        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-fg-muted">
          รูปโปรไฟล์
        </p>
        <p className="mt-1 max-w-sm text-[11px] leading-relaxed text-fg-hint sm:text-xs">
          แสดงบนการ์ดผู้จัดในหน้าทริป — JPEG / PNG / WebP / GIF ไม่เกิน 5 MB
        </p>
        <input
          type="file"
          accept={ORGANIZER_IMAGE_ACCEPT}
          disabled={pending || avatarBusy}
          className="jad-input mx-auto mt-3 max-w-full file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-brand-mid sm:max-w-md"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            setUploadErr(null);
            setAvatarBusy(true);
            try {
              setAvatarUrl(await uploadOrganizerImageFile(f));
            } catch (err) {
              setUploadErr(
                err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ",
              );
            } finally {
              setAvatarBusy(false);
            }
          }}
        />
        {avatarBusy ? (
          <p className="mt-2 text-xs text-fg-muted">กำลังอัปโหลด…</p>
        ) : null}
        {uploadErr ? (
          <p className="mt-2 max-w-md text-sm text-red-600 dark:text-red-400">{uploadErr}</p>
        ) : null}
        {avatarUrl ? (
          <button
            type="button"
            className="mt-2 text-xs font-medium text-brand hover:text-brand-mid"
            onClick={() => {
              setAvatarUrl("");
              setUploadErr(null);
            }}
          >
            ลบรูปโปรไฟล์
          </button>
        ) : null}
      </div>

      <div className="jad-card space-y-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-brand">บัญชี</p>
          <span className="rounded-full border border-border bg-canvas px-2 py-0.5 text-[10px] font-medium text-fg-hint">
            🔒 ส่วนตัว
          </span>
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
            อีเมล (แก้ไขไม่ได้)
          </label>
          <p className="mt-1 text-sm font-medium text-fg">{defaults.email}</p>
        </div>
      </div>

      <div className="jad-card space-y-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-brand">ข้อมูลที่แสดงบนทริป</p>
          <span className="rounded-full border border-brand/25 bg-brand-light px-2 py-0.5 text-[10px] font-medium text-brand">
            🌐 สาธารณะ
          </span>
        </div>
        <p className="text-[11px] leading-relaxed text-fg-hint">
          ข้อมูลในส่วนนี้จะแสดงบนหน้าทริปสาธารณะ, การ์ดผู้จัด, และหน้าโปรไฟล์สาธารณะ — ไม่มีอีเมลและไม่มีเบอร์โทรในหน้าสาธารณะ
        </p>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
            ชื่อที่แสดง
          </label>
          <input
            name="name"
            required
            minLength={2}
            defaultValue={defaults.name}
            className="jad-input mt-1"
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
            เบอร์โทร{" "}
            <span className="ml-1 font-normal text-fg-hint">(ไม่บังคับ — แสดงเฉพาะในหน้าการจองแก่ผู้จอง ไม่ใช่หน้าสาธารณะ)</span>
          </label>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={defaults.phone}
            className="jad-input mt-1"
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
            แนะนำตัว / ประสบการณ์นำทริป
          </label>
          <textarea
            name="bio"
            rows={4}
            defaultValue={defaults.bio}
            className="jad-input mt-1 min-h-[96px] resize-y"
          />
        </div>
        <div className="rounded-lg border border-border bg-canvas/80 px-3 py-3">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="isGuide"
              value="on"
              defaultChecked={defaults.isGuide}
              className="mt-1 size-4 shrink-0 rounded border-border text-brand focus:ring-brand-mid"
            />
            <span>
              <span className="block text-sm font-medium text-fg">ลงทะเบียนเป็นไกด์</span>
              <span className="mt-1 block text-xs leading-relaxed text-fg-muted">
                เมื่อเปิดแล้ว ผู้จัดคนอื่นสามารถค้นหาด้วยรหัสผู้ใช้หรือชื่อของคุณ แล้วเลือกคุณเป็นไกด์ในฟอร์มทริปได้
              </span>
            </span>
          </label>
          <p className="mt-2 font-mono text-[11px] text-fg-hint">
            รหัสผู้ใช้ของคุณ: {defaults.userId}
          </p>
        </div>
      </div>

      <div className="jad-card space-y-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-brand">โซเชียลมีเดีย</p>
          <span className="rounded-full border border-brand/25 bg-brand-light px-2 py-0.5 text-[10px] font-medium text-brand">
            🌐 สาธารณะ
          </span>
        </div>
        <p className="text-[11px] leading-relaxed text-fg-muted sm:text-xs">
          ไม่บังคับ — วาง URL เต็ม (เช่น <span className="font-mono text-fg-hint">https://…</span>) จะแสดงในหน้าโปรไฟล์สาธารณะของคุณเท่านั้น
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
              เว็บไซต์ / Linktree
            </label>
            <input
              name="socialWebsite"
              type="text"
              inputMode="url"
              placeholder="https://"
              defaultValue={defaults.socialWebsite}
              autoComplete="url"
              className="jad-input mt-1"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">LINE</label>
            <input
              name="socialLine"
              type="text"
              inputMode="url"
              placeholder="https://line.me/… หรือลิงก์อื่น"
              defaultValue={defaults.socialLine}
              className="jad-input mt-1"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">Facebook</label>
            <input
              name="socialFacebook"
              type="text"
              inputMode="url"
              placeholder="https://facebook.com/…"
              defaultValue={defaults.socialFacebook}
              className="jad-input mt-1"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">Instagram</label>
            <input
              name="socialInstagram"
              type="text"
              inputMode="url"
              placeholder="https://instagram.com/…"
              defaultValue={defaults.socialInstagram}
              className="jad-input mt-1"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">TikTok</label>
            <input
              name="socialTiktok"
              type="text"
              inputMode="url"
              placeholder="https://tiktok.com/@…"
              defaultValue={defaults.socialTiktok}
              className="jad-input mt-1"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">YouTube</label>
            <input
              name="socialYoutube"
              type="text"
              inputMode="url"
              placeholder="https://youtube.com/…"
              defaultValue={defaults.socialYoutube}
              className="jad-input mt-1"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">X (Twitter)</label>
            <input
              name="socialX"
              type="text"
              inputMode="url"
              placeholder="https://x.com/…"
              defaultValue={defaults.socialX}
              className="jad-input mt-1"
            />
          </div>
        </div>
      </div>

      <button type="submit" disabled={pending} className="jad-btn-primary h-12 w-full sm:w-auto">
        {pending ? "กำลังบันทึก…" : "บันทึกโปรไฟล์"}
      </button>
    </form>
  );
}
