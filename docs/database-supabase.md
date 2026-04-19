# เชื่อมฐานข้อมูลกับ Supabase

โปรเจกต์ใช้ **PostgreSQL ผ่าน Prisma** — Supabase ให้ Postgres แบบ hosted ใช้แทน Docker บนเครื่องได้ทันที

## 1) สร้างโปรเจกต์ Supabase

1. ไปที่ [supabase.com](https://supabase.com) → สร้างโปรเจกต์ใหม่  
2. ตั้งรหัสผ่านของผู้ใช้ `postgres` (เก็บไว้ให้ดี — ใช้ในสตริงเชื่อมต่อ)

## 2) เอา Connection String

ใน Dashboard: **Project Settings (ไอคอนเฟือง) → Database**

### แบบ Direct (แนะนำสำหรับ `db push` / migrate จากเครื่อง)

- ส่วน **Connection string** → เลือกแท็บ **URI**  
- โหมด **Session** หรือใช้โฮสต์แบบ `db.<project-ref>.supabase.co` พอร์ต **5432**  
- แทนที่ `[YOUR-PASSWORD]` ด้วยรหัสผ่านจริง

ตัวอย่างรูปแบบ:

```text
postgresql://postgres:<PASSWORD>@db.<PROJECT-REF>.supabase.co:5432/postgres?schema=public
```

### แบบ Pooler (ใช้บน Vercel / serverless ได้ดี)

จากหน้า Database → **Connection pooling** → URI มักเป็นโฮสต์ `...pooler.supabase.com` พอร์ต **6543** และมี `?pgbouncer=true`

- ตั้งเป็น **`DATABASE_URL`** บน production  
- ตั้ง **`DIRECT_URL`** เป็นแบบ **Direct (5432)** เสมอ — Prisma ใช้สำหรับ `migrate` / `db push`

## 3) ใส่ใน `.env` ของโปรเจกต์

ดูตัวอย่างใน `.env.example` — ขั้นต่ำต้องมีทั้งสองตัวแปร:

| ตัวแปร | บทบาท |
|--------|--------|
| `DATABASE_URL` | แอปรันต่อ DB (local ใช้ direct ก็ได้) |
| `DIRECT_URL` | **ต้องเป็น direct** เสมอ — ใช้ตอน `prisma db push` / migrate |

**Local ใช้แค่ direct:** ให้ `DATABASE_URL` กับ `DIRECT_URL` **เป็นสตริงเดียวกัน** (แบบ direct 5432) ก็พอ

## 4) ผลักสคีมาและ seed

```bash
npm run db:push
npm run db:seed
```

ถ้าเคยรันกับ Docker มาก่อน แล้วอยากย้ายมา Supabase แบบสะอาด — โปรเจกต์ Supabase ใหม่จะว่าง; `db push` จะสร้างตารางใหม่

## 5) Supabase JS client (`@supabase/ssr`) — แยกจาก Prisma

โปรเจกต์มี helper ที่ `src/utils/supabase/` และ `src/middleware.ts` สำหรับ **Supabase Auth / คุกกี้เซสชัน** ตาม [แนวทาง SSR ของ Supabase](https://supabase.com/docs/guides/auth/server-side/nextjs)

| ตัวแปร | บทบาท |
|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL โปรเจกต์ (Settings → API) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | publishable หรือ **anon** public key |

- **ล็อกอินของแอป justtrip** ยังเป็น **NextAuth** + ผู้ใช้ใน Postgres ผ่าน Prisma — ไม่ซ้ำกับคีย์ด้านบนถ้าคุณยังไม่ได้ย้าย auth ไป Supabase  
- ถ้าไม่ตั้งสองตัวแปรนี้ middleware จะไม่รีเฟรช Supabase และแอปยังทำงานได้ตามปกติ (เฉพาะฟีเจอร์ที่เรียก `createClient()` จาก `@/utils/supabase/*` จะต้องมี env)

## 6) หมายเหตุ

- **ไม่ต้อง**เปิด Row Level Security สำหรับตารางที่ Prisma เข้าด้วย `DATABASE_URL` แบบ `postgres` ถ้าใช้แค่ backend ของคุณ — RLS สำคัญเมื่อมี client เข้าผ่าน Supabase anon key โดยตรง  
- ถ้า build บน Vercel ช้า/ timeout ต่อ DB ลองใช้ **pooler** เป็น `DATABASE_URL` และเก็บ **direct** เป็น `DIRECT_URL` ตามด้านบน

อ้างอิง: [Prisma + Supabase](https://www.prisma.io/docs/orm/overview/databases/supabase)
