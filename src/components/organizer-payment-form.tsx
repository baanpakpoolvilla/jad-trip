"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateOrganizerPaymentSettings,
  type OrganizerPaymentActionState,
} from "@/app/actions/organizer-payments";
import { ORGANIZER_IMAGE_ACCEPT, uploadOrganizerImageFile } from "@/lib/organizer-upload-image";

export type OrganizerPaymentFormDefaults = {
  payoutPromptPayId: string;
  payoutQrImageUrl: string;
  payoutBankName: string;
  payoutBankAccountName: string;
  payoutBankAccountNumber: string;
};

function OrganizerPaymentQrField({
  initialUrl,
  pending,
  onUploadingChange,
}: {
  initialUrl: string;
  pending: boolean;
  onUploadingChange?: (busy: boolean) => void;
}) {
  const [qrUrl, setQrUrl] = useState(initialUrl);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const setBusy = (busy: boolean) => {
    setUploading(busy);
    onUploadingChange?.(busy);
  };

  return (
    <>
      <input type="hidden" name="payoutQrImageUrl" value={qrUrl} />
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex min-h-[140px] w-full max-w-[200px] flex-col items-center justify-center rounded-lg border border-border bg-canvas-muted/50 p-2">
          {qrUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- รูปอัปโหลดใน public/uploads
            <img
              src={qrUrl}
              alt="QR รับเงิน"
              width={180}
              height={180}
              className="size-[180px] rounded-md bg-white object-contain"
            />
          ) : (
            <span className="px-2 text-center text-xs text-fg-muted">ยังไม่มีรูป QR</span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <input
            type="file"
            accept={ORGANIZER_IMAGE_ACCEPT}
            disabled={uploading || pending}
            className="jad-input file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-brand-mid"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              setUploadErr(null);
              setBusy(true);
              try {
                const url = await uploadOrganizerImageFile(f);
                setQrUrl(url);
              } catch (err) {
                setUploadErr(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
              } finally {
                setBusy(false);
              }
            }}
          />
          {uploadErr ? <p className="text-sm text-danger">{uploadErr}</p> : null}
          {uploading ? <p className="text-xs text-fg-muted">กำลังอัปโหลด…</p> : null}
          {qrUrl ? (
            <button
              type="button"
              className="jad-btn-ghost self-start py-2 text-sm"
              onClick={() => {
                setQrUrl("");
                setUploadErr(null);
              }}
            >
              ลบรูป QR
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}

export function OrganizerPaymentForm({ defaults }: { defaults: OrganizerPaymentFormDefaults }) {
  const router = useRouter();
  const [qrUploadBusy, setQrUploadBusy] = useState(false);

  const [state, formAction, pending] = useActionState(
    updateOrganizerPaymentSettings as (
      p: OrganizerPaymentActionState,
      fd: FormData,
    ) => Promise<OrganizerPaymentActionState>,
    {} as OrganizerPaymentActionState,
  );

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
          บันทึกการรับเงินแล้ว
        </p>
      ) : null}

      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-fg-muted">
          เลขพร้อมเพย์ / เลขประจำตัวผู้เสียภาษี (รับโอน)
        </label>
        <p className="mt-2 rounded-lg border border-warning/30 bg-warning-light px-3 py-2 text-xs text-warning sm:text-sm">
          ระบบจะสร้าง QR Code พร้อมเพย์ให้อัตโนมัติจากเลขที่กรอก — แสดงให้ผู้จองในหน้าชำระเงินตามยอดทริป
        </p>
        <input
          name="payoutPromptPayId"
          required
          minLength={9}
          defaultValue={defaults.payoutPromptPayId}
          placeholder="เช่น 0812345678 หรือ 0105558012341"
          className="jad-input mt-1"
          autoComplete="off"
        />
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">รายละเอียดบัญชีธนาคาร</p>
        <div className="mt-3 space-y-3">
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

      <div className="border-t border-border pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">รูป QR โอนเงิน (อัปโหลด)</p>
        <p className="mt-1 text-xs text-fg-hint">
          อัปโหลด QR จากแอปธนาคารของคุณ — จะแสดงในหน้าชำระของลูกค้า (ไม่แทนที่การตรวจสลิปด้วยเลขพร้อมเพย์ด้านบน)
        </p>
        <OrganizerPaymentQrField
          key={defaults.payoutQrImageUrl}
          initialUrl={defaults.payoutQrImageUrl}
          pending={pending}
          onUploadingChange={setQrUploadBusy}
        />
      </div>

      <button type="submit" disabled={pending || qrUploadBusy} className="jad-btn-primary h-12 w-full sm:w-auto">
        {pending ? "กำลังบันทึก…" : "บันทึก"}
      </button>
    </form>
  );
}
