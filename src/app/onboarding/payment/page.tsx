import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { OnboardingPaymentForm } from "@/components/onboarding-payment-form";
import { OnboardingSteps } from "@/components/onboarding-steps";

export const dynamic = "force-dynamic";

export default async function OnboardingPaymentPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      payoutPromptPayId: true,
      payoutQrImageUrl: true,
      payoutBankName: true,
      payoutBankAccountName: true,
      payoutBankAccountNumber: true,
      onboardingCompletedAt: true,
    },
  });
  if (!user) redirect("/login");
  if (user.onboardingCompletedAt) redirect("/organizer");

  return (
    <div className="space-y-8">
      <OnboardingSteps current={2} />

      <header className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">
          ขั้นตอนที่ 2 จาก 2
        </p>
        <h1 className="text-2xl font-bold text-fg sm:text-3xl">ตั้งช่องทางรับเงิน</h1>
        <p className="text-sm leading-relaxed text-fg-muted">
          เลขพร้อมเพย์ใช้สร้าง QR Code และตรวจสลิปอัตโนมัติ — สำคัญมากสำหรับการรับชำระจากผู้จอง
        </p>
      </header>

      <OnboardingPaymentForm
        defaults={{
          payoutPromptPayId: user.payoutPromptPayId ?? "",
          payoutQrImageUrl: user.payoutQrImageUrl ?? "",
          payoutBankName: user.payoutBankName ?? "",
          payoutBankAccountName: user.payoutBankAccountName ?? "",
          payoutBankAccountNumber: user.payoutBankAccountNumber ?? "",
        }}
      />
    </div>
  );
}
