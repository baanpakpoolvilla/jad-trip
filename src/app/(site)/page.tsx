import Link from "next/link";
import {
  BadgeCheck,
  Bell,
  CreditCard,
  Link2,
  Megaphone,
  Share2,
  Sparkles,
} from "lucide-react";
import { auth } from "@/auth";
import { getOrganizerPublicBrochureHref } from "@/lib/organizer-brochure-share-code";

export const dynamic = "force-dynamic";

const benefits = [
  {
    title: "ทริปของคุณ ลิงก์ของคุณ",
    body: "ส่งลิงก์ตรงถึงกลุ่มเพื่อนหรือลูกค้า — ทุกคนเห็นแค่ทริปของคุณ ไม่ปะปนกับทริปของคนอื่นในตลาดกลาง",
    icon: Megaphone,
  },
  {
    title: "จอง ชำระ อัปเดต ครบในที่เดียว",
    body: "ตั้งราคา เปิดรับจอง รองรับ QR / แนบสลิป หรือช่องทางที่คุณใช้อยู่ — ไม่ต้องไล่ตามทีละแชต",
    icon: CreditCard,
  },
  {
    title: "ทุกคนรู้สถานะชัดเจน",
    body: "สถานะการจองและการชำระรวมอยู่ในที่เดียว — ลดข้อสงสัย ลดความวุ่นวาย ก่อนวันออกเดินทาง",
    icon: Bell,
  },
  {
    title: "แชร์ได้ทันที ดูสวยทุกหน้าจอ",
    body: "คัดลอกลิงก์ไปแปะบน Facebook LINE หรือในกลุ่มแชต — หน้าทริปโฟกัสเนื้อหา อ่านง่ายบนมือถือ",
    icon: Share2,
  },
] as const;

const steps = [
  { n: "1", title: "สมัครเป็นผู้จัด", body: "สร้างบัญชีแล้ว Say Hi กับแดชบอร์ดจัดการทริปของคุณได้เลย" },
  { n: "2", title: "สร้างทริปและเปิดรับจอง", body: "กรอกรายละเอียด รูป และช่องทางชำระตามที่คุณใช้จริง" },
  { n: "3", title: "ส่ง Trip ให้ทุกคนในกลุ่ม", body: "แชร์ลิงก์ให้เพื่อนหรือลูกค้า — เปิดดูและจองได้ทันทีโดยไม่ต้องล็อกอิน" },
] as const;

export default async function HomePage() {
  const session = await auth();
  const brochureHref =
    session?.user?.role === "ORGANIZER" && session.user.id
      ? await getOrganizerPublicBrochureHref(session.user.id)
      : null;

  return (
    <div className="space-y-8 md:space-y-14">
      <section className="jad-hero" aria-labelledby="hero-heading">
        <div className="flex flex-wrap items-center gap-2">
          <span className="jad-badge-accent text-[11px] font-semibold tracking-wide">สำหรับผู้จัดกลุ่มทริป</span>
          <span className="text-[11px] font-medium tracking-widest text-white/55">
            Say Hi Trip
          </span>
        </div>
        <h1
          id="hero-heading"
          className="mt-4 text-[2rem] font-bold leading-tight tracking-tight text-white sm:text-[2.75rem] sm:leading-[1.12]"
        >
          ส่ง Trip ให้กลุ่มเพื่อน{" "}
          <span className="text-accent">พร้อมรับจอง</span>
          <br className="hidden sm:block" />
          ได้ในลิงก์เดียว
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-[1.75] text-white/85 sm:text-[1.0625rem]">
          Say Hi Trip ช่วยให้คุณนำเสนอทริป เปิดรับจอง และติดตามสถานะชำระเป็นระบบ — แชร์ลิงก์ในโพสต์
          ใบปลิว หรือกลุ่มแชตได้ทันที ลูกค้าเห็นทริปของคุณชัดเจน ไม่ปะปนกับใคร
        </p>
        <ul className="mt-6 flex max-w-2xl flex-col gap-2.5 text-sm text-white/90 sm:text-[15px]">
          <li className="flex gap-2.5">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={1.75} aria-hidden />
            <span>ไม่ใช่ตลาดรวมทริป — คุณส่งลิงก์ของคุณตรงถึงกลุ่มเป้าหมายเอง</span>
          </li>
          <li className="flex gap-2.5">
            <BadgeCheck className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={1.75} aria-hidden />
            <span>หน้าลูกค้าโฟกัสทริป ไม่มีเมนูจัดการ อ่านง่าย ตัดสินใจไว</span>
          </li>
        </ul>
        <div className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/register" className="jad-btn-hero-primary h-12 min-h-11 px-6 sm:min-w-[220px]">
            ลงทะเบียนฟรี
          </Link>
          <Link href="/login" className="jad-btn-hero-secondary h-12 min-h-11 px-6 sm:min-w-[160px]">
            เข้าสู่ระบบ
          </Link>
        </div>
      </section>

      <section aria-labelledby="pitch-heading" className="jad-card border-brand-mid/15 bg-linear-to-br from-brand-light/80 to-surface py-6 sm:p-7">
        <p id="pitch-heading" className="text-center text-sm font-semibold leading-relaxed text-fg sm:text-base">
          ส่งลิงก์ทริปให้เพื่อนหรือลูกค้า — ทุกคน Say Hi กับทริปของคุณได้ทันที
          และลดคำถามซ้ำในกลุ่มแชตก่อนวันออกเดินทาง
        </p>
      </section>

      <section aria-labelledby="benefits-heading" className="space-y-5">
        <header className="jad-page-header text-center sm:text-left">
          <p className="jad-section-label">เหมาะกับงานจัดกลุ่ม</p>
          <h2 id="benefits-heading" className="jad-page-title">
            ทำไมกลุ่มถึงชอบ Say Hi Trip
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-fg-muted sm:mx-0 sm:text-base">
            ไม่ต้องมีเว็บไซต์ใหญ่ — มีลิงก์เดียวก็พร้อมรับจอง ส่งต่อ และโปรโมตทริปได้เลย
          </p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          {benefits.map(({ title, body, icon: Icon }) => (
            <div key={title} className="jad-card flex flex-col sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-light">
                  <Icon className="size-5 text-brand" strokeWidth={1.5} aria-hidden />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-fg">{title}</h3>
                  <p className="jad-prose-flow mt-2">{body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="steps-heading" className="space-y-5">
        <header className="jad-page-header">
          <p className="jad-section-label">เริ่มใน 3 ขั้น</p>
          <h2 id="steps-heading" className="jad-page-title">
            จากไอเดียทริป ถึงลิงก์พร้อม Say Hi
          </h2>
        </header>
        <ol className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="jad-card relative flex flex-col pt-1 sm:p-6">
              <span
                className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white sm:right-5 sm:top-5"
                aria-hidden
              >
                {s.n}
              </span>
              <h3 className="pr-10 text-base font-semibold text-fg">{s.title}</h3>
              <p className="jad-prose-flow mt-3 flex-1">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="link-heading" className="space-y-4">
        <header className="jad-page-header">
          <p className="jad-section-label">ลิงก์สาธารณะ</p>
          <h2 id="link-heading" className="jad-page-title">
            Say Hi แล้วลูกค้าเข้าใจทันที
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-fg-muted sm:text-base">
            ลิงก์รายการทริปของคุณมีได้ทั้งแบบสั้น{" "}
            <span className="font-mono text-xs text-fg">/o/…</span> และแบบเต็ม{" "}
            <span className="font-mono text-xs text-fg">/trips?o=…</span>
            {brochureHref ? (
              <>
                {" "}
                —{" "}
                <Link href={brochureHref} className="font-medium text-brand hover:text-brand-mid">
                  เปิดลิงก์ของคุณ
                </Link>
              </>
            ) : null}
            หน้าเหล่านี้ไม่แสดงเมนูจัดการ เหมาะส่งต่อให้ผู้จองโดยตรง
          </p>
        </header>
        <div className="jad-card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-light">
              <Link2 className="size-5 text-accent" strokeWidth={1.5} aria-hidden />
            </div>
            <p className="jad-prose-flow text-[15px] sm:max-w-lg">
              ผู้จองเปิดลิงก์ทริปเดี่ยวได้ (เช่น{" "}
              <span className="font-mono text-xs text-fg">/t/…</span> หรือหน้ารายละเอียดทริป) โดยไม่ต้องล็อกอิน
              เพื่อให้เข้าถึงข้อมูลและจองได้รวดเร็ว
            </p>
          </div>
          <Link href="/register" className="jad-btn-primary h-11 shrink-0 self-start sm:self-center">
            สร้างลิงก์ของคุณ
          </Link>
        </div>
      </section>

      <section
        aria-labelledby="cta-heading"
        className="rounded-2xl border border-brand-mid/20 bg-linear-to-br from-brand via-brand-mid to-brand-dark px-6 py-10 text-white sm:px-10 sm:py-12"
      >
        <h2 id="cta-heading" className="text-xl font-bold tracking-tight sm:text-2xl">
          พร้อม Say Hi ให้ทริปถัดไปหรือยัง?
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
          สมัครเป็นผู้จัด สร้างทริปแรก แล้วส่ง Trip ให้เพื่อนหรือลูกค้าของคุณได้เลยวันนี้
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex h-12 min-h-11 items-center justify-center rounded-lg bg-white px-6 text-sm font-semibold text-brand shadow-sm transition-colors hover:bg-brand-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-mid sm:min-w-[200px]"
          >
            สมัครเป็นผู้จัด
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 min-h-11 items-center justify-center rounded-lg border border-white/35 bg-white/10 px-6 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:border-white/55 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-mid sm:min-w-[160px]"
          >
            มีบัญชีแล้ว
          </Link>
        </div>
      </section>
    </div>
  );
}
