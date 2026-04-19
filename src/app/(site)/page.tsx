import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="jad-card">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-mid">
          จัดทริป · JadTrip
        </p>
        <h1 className="mt-2 text-[1.625rem] font-semibold leading-snug tracking-tight text-fg sm:text-[2rem] sm:leading-tight">
          จัดได้{" "}
          <span className="text-brand">ไม่ยุ่งยาก</span>
        </h1>
        <p className="mt-3 text-base leading-relaxed text-fg-muted">
          เครื่องมือสำหรับผู้จัดทริปกลุ่ม — จองที่นั่งและติดตามการจ่ายให้เป็นระบบ
          โดยไม่ต้องล็อกอินก่อนดูทริป
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/trips" className="jad-btn-primary h-12 sm:h-auto sm:min-w-[180px]">
            ดูทริปที่เปิดรับ
          </Link>
          <Link href="/register" className="jad-btn-secondary h-12 sm:h-auto sm:min-w-[180px]">
            ลงทะเบียนผู้จัดทริป
          </Link>
        </div>
      </div>
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { t: "ผู้จอง", d: "เลือกทริป จอง และชำระเต็มจำนวน พร้อมลิงก์ดูสถานะ" },
          { t: "ผู้จัด", d: "สร้างทริป เผยแพร่ ดูรายชื่อและสถานะชำระ" },
          { t: "แอดมิน", d: "ภาพรวมผู้ใช้ ทริป และการจองทั้งระบบ" },
        ].map((x) => (
          <div key={x.t} className="jad-card">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-brand-mid" strokeWidth={1.5} />
              <h2 className="text-base font-semibold text-fg">{x.t}</h2>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">{x.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
