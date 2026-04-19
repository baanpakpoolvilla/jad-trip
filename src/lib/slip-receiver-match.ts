/** จัดรูปแบบเลขพร้อมเพย์ให้เทียบกันได้ — ตรงกับ logic ของ promptpay-qr */
export function formatPromptPayTargetKey(input: string): string {
  const numbers = input.replace(/\D/g, "");
  if (!numbers) return "";
  if (numbers.length >= 13) return numbers;
  return ("0000000000000" + numbers.replace(/^0/, "66")).slice(-13);
}

type SlipReceiver = {
  account?: {
    proxy?: { account?: string | null };
    bank?: { account?: string | null };
  };
};

function receiverDigitSources(receiver: SlipReceiver | undefined): string[] {
  if (!receiver?.account) return [];
  const { proxy, bank } = receiver.account;
  return [proxy?.account, bank?.account].filter(
    (s): s is string => typeof s === "string" && s.trim().length > 0,
  );
}

/** ตรวจว่าผู้รับในสลิปตรงกับเลขพร้อมเพย์ที่ผู้จัดตั้งไว้หรือไม่ */
export function slipReceiverMatchesPromptPayId(
  rawSlip: { receiver?: unknown },
  organizerPromptPayId: string,
): boolean {
  const target = formatPromptPayTargetKey(organizerPromptPayId);
  if (!target) return false;
  const receiver = rawSlip.receiver as SlipReceiver | undefined;
  for (const raw of receiverDigitSources(receiver)) {
    const cand = formatPromptPayTargetKey(raw);
    if (cand && cand === target) return true;
  }
  return false;
}
