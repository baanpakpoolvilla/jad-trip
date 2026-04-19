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

      <div className="jad-card space-y-4">
        <p className="text-xs font-medium uppercase tracking-wide text-brand">บัญชี</p>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
            อีเมล (แก้ไขไม่ได้)
          </label>
          <p className="mt-1 text-sm font-medium text-fg">{defaults.email}</p>
        </div>
      </div>

      <div className="jad-card space-y-4">
        <p className="text-xs font-medium uppercase tracking-wide text-brand">ข้อมูลที่แสดงบนทริป</p>
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
            เบอร์โทร (ไม่บังคับ)
          </label>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={defaults.phone}
            className="jad-input mt-1"
          />
        </div>
        <input type="hidden" name="avatarUrl" value={avatarUrl} readOnly />
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
            รูปโปรไฟล์ — อัปโหลด (JPEG / PNG / WebP / GIF ไม่เกิน 5 MB)
          </label>
          {avatarUrl ? (
            <div className="relative mt-2 inline-block max-w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt=""
                className="max-h-32 max-w-[200px] rounded-xl border border-border object-cover"
              />
            </div>
          ) : null}
          <input
            type="file"
            accept={ORGANIZER_IMAGE_ACCEPT}
            disabled={pending || avatarBusy}
            className="jad-input mt-2 file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-brand-mid"
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
            <p className="mt-1 text-xs text-fg-muted">กำลังอัปโหลด…</p>
          ) : null}
          {uploadErr ? (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{uploadErr}</p>
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

      <button type="submit" disabled={pending} className="jad-btn-primary h-12 w-full sm:w-auto">
        {pending ? "กำลังบันทึก…" : "บันทึกโปรไฟล์"}
      </button>
    </form>
  );
}
