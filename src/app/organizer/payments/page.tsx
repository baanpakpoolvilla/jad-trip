import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { OrganizerPaymentForm } from "@/components/organizer-payment-form";

export const dynamic = "force-dynamic";

export default async function OrganizerPaymentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ORGANIZER") {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      payoutPromptPayId: true,
      payoutQrImageUrl: true,
      payoutBankName: true,
      payoutBankAccountName: true,
      payoutBankAccountNumber: true,
    },
  });

  return (
    <div className="space-y-6">
      <Link href="/organizer" className="jad-back-link">
        <ArrowLeft className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
        แดชบอร์ด
      </Link>

      <header className="jad-page-header">
        <p className="jad-section-label">ผู้จัด</p>
        <h1 className="jad-page-title">ตั้งค่ารับเงิน</h1>
        <p className="text-sm text-fg-muted">
          ตั้งเลขพร้อมเพย์เพื่อให้ระบบสร้าง QR และตรวจสลิปอัตโนมัติ — กรอกบัญชีธนาคารและอัปโหลด QR
          เพิ่มได้เพื่อให้ลูกค้าเห็นชัดขึ้น
        </p>
      </header>

      <div className="jad-card max-w-xl space-y-4">
        <OrganizerPaymentForm
          defaults={{
            payoutPromptPayId: user?.payoutPromptPayId ?? "",
            payoutQrImageUrl: user?.payoutQrImageUrl ?? "",
            payoutBankName: user?.payoutBankName ?? "",
            payoutBankAccountName: user?.payoutBankAccountName ?? "",
            payoutBankAccountNumber: user?.payoutBankAccountNumber ?? "",
          }}
        />
      </div>
    </div>
  );
}
