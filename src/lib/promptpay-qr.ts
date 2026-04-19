import generatePayload from "promptpay-qr";
import QRCode from "qrcode";

/** สร้าง data URL ของ QR พร้อมเพย์ (มีจำนวนเงิน) สำหรับแสดงในหน้าจอง */
export async function buildPromptPayQrDataUrl(
  promptPayId: string,
  amountBaht: number,
): Promise<string> {
  const payload = generatePayload(promptPayId, { amount: amountBaht });
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    width: 280,
    margin: 2,
  });
}
