import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-10 md:space-y-12">
      <div className="jad-card sm:p-6 md:p-8">
        <p className="jad-section-label">จัดทริป · JadTrip</p>
        <h1 className="jad-page-title mt-2">
          จัดได้ <span className="text-brand">ไม่ยุ่งยาก</span>
        </h1>
        <p className="jad-page-lead max-w-2xl">
          เครื่องมือสำหรับผู้จัดทริปกลุ่ม — จองที่นั่งและติดตามการจ่ายให้เป็นระบบ
          โดยไม่ต้องล็อกอินก่อนดูทริป
        </p>
        <div className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/trips" className="jad-btn-primary h-12 min-h-11 px-6 sm:min-w-[200px]">
            ดูทริปที่เปิดรับ
          </Link>
          <Link href="/register" className="jad-btn-secondary h-12 min-h-11 px-6 sm:min-w-[200px]">
            ลงทะเบียนผู้จัดทริป
          </Link>
        </div>
      </div>
      <section aria-labelledby="roles-heading" className="grid gap-4 sm:grid-cols-3 sm:gap-5">
        <h2 id="roles-heading" className="sr-only">
          ใครใช้จัดทริปได้บ้าง
        </h2>
        {[
          { t: "ผู้จอง", d: "เลือกทริป จอง และชำระเต็มจำนวน พร้อมลิงก์ดูสถานะ" },
          { t: "ผู้จัด", d: "สร้างทริป เผยแพร่ ดูรายชื่อและสถานะชำระ" },
          { t: "แอดมิน", d: "ภาพรวมผู้ใช้ ทริป และการจองทั้งระบบ" },
        ].map((x) => (
          <div key={x.t} className="jad-card flex flex-col sm:p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 shrink-0 text-brand-mid" strokeWidth={1.5} aria-hidden />
              <h3 className="text-base font-semibold text-fg">{x.t}</h3>
            </div>
            <p className="jad-prose-flow mt-3 flex-1">{x.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
