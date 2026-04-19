# justtrip

แพลตฟอร์มจองทริปกลุ่ม — คอนเซปต์ «จัดทริปแล้วลุยเลย» รองรับผู้จัดทริป ผู้จอง แอดมิน และชำระเงินผ่าน Stripe

## รันในเครื่อง

1. คัดลอก `.env.example` เป็น `.env` แล้วตั้งค่า `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, ฯลฯ  
2. (ถ้าใช้ Supabase client / middleware) ตั้ง `NEXT_PUBLIC_SUPABASE_URL` และ `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ใน `.env` หรือ `.env.local` — ดู [docs/database-supabase.md](docs/database-supabase.md)  
3. Postgres — **แนะนำ [Supabase](https://supabase.com)** ดูขั้นตอนใน `docs/database-supabase.md` หรือใช้ Docker เฉพาะ DB: `docker compose up -d db` (พอร์ต **5433**) แล้วตั้ง `DATABASE_URL` ให้ชี้ `127.0.0.1:5433` ตาม `.env.example`  
4. `npm install` → `npm run db:push` → `npm run db:seed` (ถ้าต้องการข้อมูลทดสอบ)  
5. `npm run dev` แล้วเปิด [http://localhost:3000](http://localhost:3000) — สคริปต์จะรัน `prisma generate` ก่อน dev อัตโนมัติ  

### รันทั้งแอปใน Docker (Postgres + Next production)

จากรากโปรเจกต์:

```bash
docker compose up -d --build
```

- เว็บ: [http://localhost:3000](http://localhost:3000) — คอนเทนเนอร์แอปรัน `prisma db push` ก่อน `next start` ทุกครั้งที่สตาร์ท  
- Postgres ภายใน compose ใช้ hostname `db` พอร์ต **5432**; จากเครื่อง host ยังเข้า DB ที่พอร์ต **5433** ได้ถ้ารัน `db`  
- ตั้ง `AUTH_SECRET` (และ Stripe ถ้าใช้) ผ่านไฟล์ `.env` ในโฟลเดอร์เดียวกับ compose หรือส่งเป็น env ตอนรัน — ถ้าไม่ตั้ง compose ใช้ค่า default สำหรับพัฒนาเท่านั้น  
- seed บัญชีทดสอบ: `docker compose run --rm app npx prisma db seed`  
6. **ถ้า Prisma ขึ้น `Unknown field` (เช่น `bio`, `shareCode`)** — Client หรือ DB ยังไม่ตรงกับ `schema.prisma` ให้รันตามลำดับ:  
   `npx prisma db push` → `rm -rf .next` → `npx prisma generate` → ปิดแล้วเปิด `npm run dev` ใหม่ (หรือรันแค่ `npm run dev` หลัง `db push` ถ้า `predev` ยังทำงาน)

**สถาปัตย์:** ล็อกอินผู้ใช้แอปผ่าน **NextAuth** + ตาราง `User` ใน Postgres (Prisma) — `@supabase/ssr` ใน middleware ใช้รีเฟรชเซสชัน **Supabase Auth** เมื่อตั้งค่า env แล้วเท่านั้น ไม่แทนที่ NextAuth

## เอกสาร

- [แบรนด์ & CI](docs/brand-ci-guideline.md)  
- [ดีพลอย Vercel (อ้างอิง)](docs/deployment-vercel.md)  
- [ฐานข้อมูล Supabase](docs/database-supabase.md)  
- [บัญชีทดสอบ (demo)](docs/demo-accounts.md)

Repository: [github.com/baanpakpoolvilla/jad-trip](https://github.com/baanpakpoolvilla/jad-trip) (โฟลเดอร์โปรเจกต์อาจชื่อ `dernpa` หรือ `justtrip` ตามที่ clone)
