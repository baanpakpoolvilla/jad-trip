"use client";

import { useActionState, useState } from "react";
import {
  saveOnboardingProfile,
  type OnboardingProfileState,
} from "@/app/actions/onboarding";
import {
  ORGANIZER_IMAGE_ACCEPT,
  uploadOrganizerImageFile,
} from "@/lib/organizer-upload-image";
import { ArrowRight } from "lucide-react";

type Defaults = {
  name: string;
  phone: string;
  bio: string;
  avatarUrl: string;
  socialLine: string;
  socialFacebook: string;
  socialInstagram: string;
};

export function OnboardingProfileForm({ defaults }: { defaults: Defaults }) {
  const [state, formAction, pending] = useActionState(
    saveOnboardingProfile as (
      p: OnboardingProfileState,
      fd: FormData,
    ) => Promise<OnboardingProfileState>,
    {} as OnboardingProfileState,
  );

  const [avatarUrl, setAvatarUrl] = useState(defaults.avatarUrl);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  const initial = defaults.name.trim().charAt(0) || "?";

  return (
    <form action={formAction} className="space-y-6">
      {state && "error" in state && state.error ? (
        <p className="jad-alert-error">{state.error}</p>
      ) : null}

      <input type="hidden" name="avatarUrl" value={avatarUrl} readOnly />

      {/* Avatar */}
      <div className="jad-card space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">รูปโปรไฟล์</p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
          <div
            className="relative size-24 shrink-0 overflow-hidden rounded-full border-2 border-border bg-canvas-muted shadow-sm ring-1 ring-black/5"
            role="img"
            aria-label={avatarUrl ? "รูปโปรไฟล์ปัจจุบัน" : "ยังไม่มีรูปโปรไฟล์"}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center bg-brand-light/40 text-2xl font-semibold text-brand">
                {initial}
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <p className="text-xs leading-relaxed text-fg-hint">
              แสดงบนการ์ดผู้จัดในหน้าทริป — JPEG / PNG / WebP ไม่เกิน 5 MB
            </p>
            <input
              type="file"
              accept={ORGANIZER_IMAGE_ACCEPT}
              disabled={pending || avatarBusy}
              className="jad-input file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-brand-mid"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                setUploadErr(null);
                setAvatarBusy(true);
                try {
                  setAvatarUrl(await uploadOrganizerImageFile(f));
                } catch (err) {
                  setUploadErr(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
                } finally {
                  setAvatarBusy(false);
                }
              }}
            />
            {avatarBusy ? <p className="text-xs text-fg-muted">กำลังอัปโหลด…</p> : null}
            {uploadErr ? <p className="text-sm text-danger">{uploadErr}</p> : null}
            {avatarUrl ? (
              <button
                type="button"
                className="self-start text-xs font-medium text-fg-muted hover:text-danger"
                onClick={() => { setAvatarUrl(""); setUploadErr(null); }}
              >
                ลบรูปโปรไฟล์
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Basic info */}
      <div className="jad-card space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">ข้อมูลส่วนตัว</p>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
            ชื่อที่แสดง <span className="text-danger">*</span>
          </label>
          <input
            name="name"
            required
            minLength={2}
            defaultValue={defaults.name}
            className="jad-input mt-1"
            placeholder="ชื่อ-นามสกุล หรือชื่อเพจ"
          />
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
            เบอร์โทร{" "}
            <span className="ml-1 font-normal text-fg-hint">(ไม่บังคับ — แสดงเฉพาะผู้จองทริปของคุณ)</span>
          </label>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={defaults.phone}
            className="jad-input mt-1"
            placeholder="เช่น 0812345678"
          />
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
            แนะนำตัว / ประสบการณ์นำทริป{" "}
            <span className="ml-1 font-normal text-fg-hint">(ไม่บังคับ)</span>
          </label>
          <textarea
            name="bio"
            rows={4}
            defaultValue={defaults.bio}
            className="jad-input mt-1 min-h-[96px] resize-y"
            placeholder="เล่าให้ผู้จองรู้จักคุณ — ประสบการณ์นำทริป ความเชี่ยวชาญเส้นทาง ฯลฯ"
          />
        </div>
      </div>

      {/* Social links (optional, just the most common ones) */}
      <div className="jad-card space-y-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">โซเชียลมีเดีย</p>
          <span className="text-[10px] text-fg-hint">ไม่บังคับ</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">LINE</label>
            <input
              name="socialLine"
              type="text"
              inputMode="url"
              placeholder="https://line.me/…"
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
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-fg-hint">* จำเป็นต้องกรอก</p>
        <button
          type="submit"
          disabled={pending || avatarBusy}
          className="jad-btn-primary flex h-12 items-center gap-2 px-6"
        >
          {pending ? "กำลังบันทึก…" : (
            <>
              ถัดไป: ตั้งค่ารับเงิน
              <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
