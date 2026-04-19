# เชื่อมต่อและดีพลอยบน Vercel

โปรเจกต์นี้เป็น **Next.js App Router** + **Prisma** + **NextAuth** + **Stripe** — บน Vercel ต้องมี **PostgreSQL บนคลาวด์** (เช่น [Neon](https://neon.tech), Supabase, Vercel Postgres) ไม่สามารถใช้ `localhost` จาก Docker บนเครื่องได้

## ก่อนรันคำสั่ง CLI

ถ้าเคยตั้ง `VERCEL_TOKEN` ไว้ใน shell แล้ว token หมดอายุ/ผิด จะขึ้น `The specified token is not valid` — แก้โดย:

- ลบหรือคอมเมนต์ `export VERCEL_TOKEN=...` ใน `~/.zshrc` / `~/.bashrc` แล้วเปิดเทอร์มินัลใหม่  
- หรือรันคำสั่งโดยตัดตัวแปรชั่วคราว:  
  `env -u VERCEL_TOKEN npx vercel@latest login`

## วิธีที่ 1: ผ่านเว็บ Vercel (แนะนำถ้ามี Git repository)

1. Push โค้ดขึ้น GitHub / GitLab / Bitbucket  
2. ไปที่ [vercel.com/new](https://vercel.com/new) → Import repository  
3. **Framework Preset:** Next.js (ตรวจจับอัตโนมัติ)  
4. **Build Command:** ใช้ค่าใน `package.json` ได้เลย (`prisma generate && next build`)  
5. **Root Directory:** `/` (รากโปรเจกต์)  
6. ใส่ **Environment Variables** ตามหัวข้อด้านล่าง → Deploy

## วิธีที่ 2: ผ่าน Vercel CLI

จากโฟลเดอร์โปรเจกต์:

```bash
cd /path/to/jad-trip   # โฟลเดอร์หลัง clone จาก GitHub
env -u VERCEL_TOKEN npx vercel@latest login
env -u VERCEL_TOKEN npx vercel@latest link
env -u VERCEL_TOKEN npx vercel@latest deploy        # preview
env -u VERCEL_TOKEN npx vercel@latest deploy --prod # production
```

หลัง `link` จะมีโฟลเดอร์ `.vercel/` (ควรอยู่ใน `.gitignore` แล้ว)

## ตัวแปรสภาพแวดล้อมบน Vercel (บังคับ / ควรมี)

| ตัวแปร | หมายเหตุ |
|--------|----------|
| `DATABASE_URL` | Connection string ของ Postgres บนคลาวด์ (Production + Preview แยก DB ได้) — บน Supabase มักใช้ **pooler** |
| `DIRECT_URL` | **บังคับ** (Prisma `schema.prisma`) — ต้องเป็น **Direct** (เช่น Supabase พอร์ต 5432) สำหรับ migrate / `db push` จาก CI หรือเครื่อง |
| `AUTH_SECRET` | สุ่มด้วย `openssl rand -base64 32` |
| `AUTH_URL` | URL จริงของเว็บบน Vercel เช่น `https://ชื่อโปรเจกต์.vercel.app` (ช่วย NextAuth / Auth.js บน production) |
| `NEXT_PUBLIC_APP_URL` | ควรตรงกับ public URL เดียวกัน (Stripe redirect) |
| `STRIPE_SECRET_KEY` | จาก Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | สร้าง Webhook endpoint ชี้ไปที่ `https://<โดเมน>/api/stripe/webhook` |
| `NEXT_PUBLIC_SUPABASE_URL` | (ถ้าใช้) จาก Supabase → Settings → API — ใช้กับ `@supabase/ssr` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | (ถ้าใช้) publishable / anon key คู่กับ URL ด้านบน — ไม่มีค่า = middleware ข้ามการรีเฟรช Supabase โดยไม่ error |

หลังดีพลอยแล้ว: ไป Stripe → Webhooks → เพิ่ม URL production และเลือก event `checkout.session.completed`

## ฐานข้อมูลหลังดีพลอยครั้งแรก

รันสคีมาบน DB บนคลาวด์ (จากเครื่อง local ที่มี `DATABASE_URL` ชี้ไป production หรือใช้ Neon console):

```bash
DATABASE_URL="postgresql://..." DIRECT_URL="postgresql://...direct..." npx prisma db push
# หรือใช้ migrate ถ้าคุณเปลี่ยนมาใช้ migrations แล้ว — บน Supabase ต้องมี DIRECT_URL แบบพอร์ต 5432
```

จากนั้นค่อย seed บัญชีทดสอบถ้าต้องการ (ระวัง seed บน production)

## อ้างอิง

- [Vercel + Next.js](https://vercel.com/docs/frameworks/nextjs)  
- [Prisma deploy Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
