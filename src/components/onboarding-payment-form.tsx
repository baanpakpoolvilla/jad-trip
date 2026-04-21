"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  saveOnboardingPayment,
  type OnboardingPaymentState,
} from "@/app/actions/onboarding";
import {
  ORGANIZER_IMAGE_ACCEPT,
  uploadOrganizerImageFile,
} from "@/lib/organizer-upload-image";
import { ArrowLeft, Sparkles } from "lucide-react";

type Defaults = {
  payoutPromptPayId: string;
  payoutQrImageUrl: string;
  payoutBankName: string;
  payoutBankAccountName: string;
  payoutBankAccountNumber: string;
};

export function OnboardingPaymentForm({ defaults }: { defaults: Defaults }) {
  const [state, formAction, pending] = useActionState(
    saveOnboardingPayment as (
      p: OnboardingPaymentState,
      fd: FormData,
    ) => Promise<OnboardingPaymentState>,
    {} as OnboardingPaymentState,
  );

  const [qrUrl, setQrUrl] = useState(defaults.payoutQrImageUrl);
  const [qrBusy, setQrBusy] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  return (
    <form action={formAction} className="space-y-6">
      {state && "error" in state && state.error ? (
        <p className="jad-alert-error">{state.error}</p>
      ) : null}

      <input type="hidden" name="payoutQrImageUrl" value={qrUrl} readOnly />

      {/* PromptPay */}
      <div className="jad-card space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">พร้อมเพย์</p>

        <div className="rounded-lg border border-brand/20 bg-brand-light/50 px-3 py-3 text-xs text-fg-muted space-y-1.5">
          <p>
            <span className="font-semibold text-brand">สำคัญ:</span>{" "}
            เลขพร้อมเพย์ใช้สร้าง QR Code อัตโนมัติตามยอดทริป และตรวจสลิปอัตโนมัติผ่าน EasySlip —
            หากไม่กรอก ระบบ<span className="font-medium text-warning">ตรวจสลิปไม่ได้</span>
          </p>
          <p className="text-fg-hint">รูปแบบ: เบอร์มือถือ 10 หลัก หรือเลขนิติบุคคล 13 หลัก</p>
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
            เลขพร้อมเพย์ / เลขประจำตัวผู้เสียภาษี <span className="text-danger">*</span>
          </label>
          <input
            name="payoutPromptPayId"
            required
            minLength={9}
            maxLength={20}
            pattern="[\d\-\s]{9,20}"
            defaultValue={defaults.payoutPromptPayId}
            placeholder="เช่น 0812345678 หรือ 0105558012341"
            className="jad-input mt-1"
            autoComplete="off"
            inputMode="numeric"
          />
        </div>
      </div>

      {/* Bank account */}
      <div className="jad-card space-y-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">บัญชีธนาคาร</p>
          <span className="text-[10px] text-fg-hint">ไม่บังคับ</span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-fg-muted">ธนาคาร</label>
            <input
              name="payoutBankName"
              defaultValue={defaults.payoutBankName}
              placeholder="เช่น ธนาคารกสิกรไทย"
              className="jad-input mt-1"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-xs text-fg-muted">ชื่อบัญชี</label>
            <input
              name="payoutBankAccountName"
              defaultValue={defaults.payoutBankAccountName}
              placeholder="เช่น สมชาย ใจดี (ตามชื่อในสมุดบัญชี)"
              className="jad-input mt-1"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-xs text-fg-muted">เลขบัญชี</label>
            <input
              name="payoutBankAccountNumber"
              defaultValue={defaults.payoutBankAccountNumber}
              placeholder="เช่น 1234567890 (เฉพาะตัวเลข)"
              className="jad-input mt-1"
              autoComplete="off"
            />
          </div>
        </div>
      </div>

      {/* QR image */}
      <div className="jad-card space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">รูป QR โอนเงิน</p>
          <span className="text-[10px] text-fg-hint">ไม่บังคับ</span>
        </div>
        <p className="text-xs text-fg-hint">
          อัปโหลด QR จากแอปธนาคาร — จะแสดงในหน้าชำระของลูกค้า
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex min-h-[120px] w-full max-w-[160px] flex-col items-center justify-center rounded-lg border border-border bg-canvas-muted/50 p-2">
            {qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrUrl}
                alt="QR รับเงิน"
                width={150}
                height={150}
                className="size-[150px] rounded-md bg-white object-contain"
              />
            ) : (
              <span className="px-2 text-center text-xs text-fg-muted">ยังไม่มีรูป QR</span>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <input
              type="file"
              accept={ORGANIZER_IMAGE_ACCEPT}
              disabled={qrBusy || pending}
              className="jad-input file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-brand-mid"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                setUploadErr(null);
                setQrBusy(true);
                try {
                  setQrUrl(await uploadOrganizerImageFile(f));
                } catch (err) {
                  setUploadErr(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
                } finally {
                  setQrBusy(false);
                }
              }}
            />
            {qrBusy ? <p className="text-xs text-fg-muted">กำลังอัปโหลด…</p> : null}
            {uploadErr ? <p className="text-sm text-danger">{uploadErr}</p> : null}
            {qrUrl ? (
              <button
                type="button"
                className="self-start text-xs font-medium text-fg-muted hover:text-danger"
                onClick={() => { setQrUrl(""); setUploadErr(null); }}
              >
                ลบรูป QR
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Link
          href="/onboarding/profile"
          className="flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
          ย้อนกลับ
        </Link>

        <button
          type="submit"
          disabled={pending || qrBusy}
          className="jad-btn-primary flex h-12 items-center gap-2 px-6"
        >
          {pending ? "กำลังบันทึก…" : (
            <>
              <Sparkles className="size-4" strokeWidth={1.5} aria-hidden />
              เสร็จสิ้น — สร้างทริปแรก
            </>
          )}
        </button>
      </div>
    </form>
  );
}
