import Link from "next/link";
import { PublicOrganizerBrochureTrips } from "@/components/public-organizer-brochure-trips";
import {
  getOrganizerBrochureHost,
  listPublishedTripsForOrganizerBrochure,
} from "@/lib/trips-public";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ o?: string | string[] }> };

export default async function TripsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const raw = sp.o;
  const organizerParam =
    typeof raw === "string" ? raw.trim() : Array.isArray(raw) ? (raw[0] ?? "").trim() : "";

  if (!organizerParam) {
    return (
      <div className="space-y-8">
        <header className="jad-page-header">
          <p className="jad-section-label">รายการทริป</p>
          <h1 className="jad-page-title">ลิงก์รับจอง</h1>
          <p className="max-w-xl text-sm leading-relaxed text-fg-muted sm:text-base">
            หน้านี้แสดงทริปของผู้จัดแต่ละท่านตามรหัสในที่อยู่ — ใช้ลิงก์ที่ผู้จัดส่งให้
            (มีพารามิเตอร์ <span className="font-mono text-xs text-fg">o</span> ตามด้วยรหัสผู้จัด)
            ไม่มีรายการรวมจากทุกคนในระบบ
          </p>
        </header>
        <div className="jad-card space-y-3 text-sm text-fg-muted">
          <p>รูปแบบลิงก์ที่ใช้ได้:</p>
          <p className="rounded-lg bg-canvas-muted px-3 py-2 font-mono text-xs text-fg break-all">
            /o/รหัสย่อ8ตัว
          </p>
          <p className="text-xs text-fg-hint">
            ลิงก์ย่อจะเปิดหน้ารายการทริปของผู้จัดอัตโนมัติ — โปรไฟล์สาธารณะอยู่ที่{" "}
            <span className="font-mono text-fg-muted">/o/รหัสย่อ8ตัว/profile</span>
          </p>
          <p className="rounded-lg bg-canvas-muted px-3 py-2 font-mono text-xs text-fg break-all">
            /trips?o=รหัสผู้จัด
          </p>
          <p className="text-xs text-fg-hint">
            ผู้จัดคัดลอกจากแดชบอร์ดหลังล็อกอิน — หน้านี้ไม่มีเมนูจัดการหรือข้อมูลภายในของผู้จัด
          </p>
        </div>
      </div>
    );
  }

  const host = await getOrganizerBrochureHost(organizerParam);

  if (!host) {
    return (
      <div className="space-y-8">
        <header className="jad-page-header">
          <p className="jad-section-label">รายการทริป</p>
          <h1 className="jad-page-title">ไม่พบลิงก์นี้</h1>
          <p className="max-w-xl text-sm text-fg-muted">
            รหัสผู้จัดในที่อยู่ไม่ตรงกับบัญชีในระบบ — ตรวจสอบว่าคัดลอกลิงก์ครบหรือไม่
          </p>
        </header>
        <Link href="/" className="inline-block text-sm font-medium text-brand hover:text-brand-mid">
          กลับหน้าแรก
        </Link>
      </div>
    );
  }

  const trips = await listPublishedTripsForOrganizerBrochure(host.id);

  return (
    <div className="space-y-8">
      <header className="jad-page-header">
        <p className="jad-section-label">ทริปจากผู้จัด</p>
        <h1 className="jad-page-title">{host.name}</h1>
        <p className="max-w-xl text-sm leading-relaxed text-fg-muted sm:text-base">
          ทริปที่เปิดรับจองในช่วงนี้ — แตะการ์ดเพื่อดูรายละเอียดและจอง
        </p>
      </header>

      <PublicOrganizerBrochureTrips trips={trips} />
    </div>
  );
}
