export type EasyslipRawSlip = {
  transRef?: string;
  amount?: { amount?: number };
  receiver?: unknown;
};

export type EasyslipVerifyData = {
  isDuplicate?: boolean;
  isAmountMatched?: boolean;
  amountInSlip?: number;
  rawSlip?: EasyslipRawSlip;
};

type EasyslipSuccess = { success: true; data: EasyslipVerifyData; message?: string };
type EasyslipFail = {
  success: false;
  error?: { code?: string; message?: string };
};

export type EasyslipVerifyOutcome =
  | { ok: true; data: EasyslipVerifyData }
  | { ok: false; message: string; code?: string };

export async function verifyBankSlipBase64(
  base64: string,
  opts: { matchAmount?: number; checkDuplicate?: boolean; remark?: string },
): Promise<EasyslipVerifyOutcome> {
  const apiKey = process.env.EASYSLIP_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, message: "ยังไม่ได้ตั้งค่า EASYSLIP_API_KEY บนเซิร์ฟเวอร์" };
  }

  const res = await fetch("https://api.easyslip.com/v2/verify/bank", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      base64,
      checkDuplicate: opts.checkDuplicate ?? true,
      matchAmount: opts.matchAmount,
      remark: opts.remark,
    }),
  });

  const json = (await res.json()) as EasyslipSuccess | EasyslipFail;

  if (!json || typeof json !== "object") {
    return { ok: false, message: "คำตอบจาก EasySlip ไม่ถูกต้อง" };
  }

  if ("success" in json && json.success === true && json.data) {
    return { ok: true, data: json.data };
  }

  const fail = json as EasyslipFail;
  const msg =
    fail.error?.message ??
    (res.ok ? "ตรวจสลิปไม่สำเร็จ" : `EasySlip HTTP ${res.status}`);
  return {
    ok: false,
    message: msg,
    code: fail.error?.code,
  };
}
