# จัดทริป (jad-trip)

แอปจองทริปเดินป่าแบบกลุ่ม — ผู้จัดทริป, ผู้จอง, แอดมิน, ชำระเงินผ่าน Stripe

## รันในเครื่อง

1. คัดลอก `.env.example` เป็น `.env` แล้วตั้งค่า `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, ฯลฯ  
2. (ถ้าใช้ Supabase client / middleware) ตั้ง `NEXT_PUBLIC_SUPABASE_URL` และ `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ใน `.env` หรือ `.env.local` — ดู [docs/database-supabase.md](docs/database-supabase.md)  
3. Postgres — **แนะนำ [Supabase](https://supabase.com)** ดูขั้นตอนใน `docs/database-supabase.md` หรือใช้ Docker: `docker compose up -d`  
4. `npm install` → `npm run db:push` → `npm run db:seed` (ถ้าต้องการข้อมูลทดสอบ)  
5. `npm run dev` แล้วเปิด [http://localhost:3000](http://localhost:3000) — สคริปต์จะรัน `prisma generate` ก่อน dev อัตโนมัติ  
6. **ถ้า Prisma ขึ้น `Unknown field` (เช่น `bio`, `shareCode`)** — Client หรือ DB ยังไม่ตรงกับ `schema.prisma` ให้รันตามลำดับ:  
   `npx prisma db push` → `rm -rf .next` → `npx prisma generate` → ปิดแล้วเปิด `npm run dev` ใหม่ (หรือรันแค่ `npm run dev` หลัง `db push` ถ้า `predev` ยังทำงาน)

**สถาปัตย์:** ล็อกอินผู้ใช้แอปผ่าน **NextAuth** + ตาราง `User` ใน Postgres (Prisma) — `@supabase/ssr` ใน middleware ใช้รีเฟรชเซสชัน **Supabase Auth** เมื่อตั้งค่า env แล้วเท่านั้น ไม่แทนที่ NextAuth

## เอกสาร

- [แบรนด์ & CI](docs/brand-ci-guideline.md)  
- [ดีพลอย Vercel (อ้างอิง)](docs/deployment-vercel.md)  
- [ฐานข้อมูล Supabase](docs/database-supabase.md)  
- [บัญชีทดสอบ (demo)](docs/demo-accounts.md)

Repository: [github.com/baanpakpoolvilla/jad-trip](https://github.com/baanpakpoolvilla/jad-trip)
