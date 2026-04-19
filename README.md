# จัดทริป (jad-trip)

แอปจองทริปเดินป่าแบบกลุ่ม — ผู้จัดทริป, ผู้จอง, แอดมิน, ชำระเงินผ่าน Stripe

## รันในเครื่อง

1. คัดลอก `.env.example` เป็น `.env` แล้วตั้งค่า `DATABASE_URL`, `AUTH_SECRET`, ฯลฯ  
2. Postgres — **แนะนำ [Supabase](https://supabase.com)** ดูขั้นตอนใน [docs/database-supabase.md](docs/database-supabase.md) หรือใช้ Docker: `docker compose up -d`  
3. `npm install` → `npm run db:push` → `npm run db:seed` (ถ้าต้องการข้อมูลทดสอบ)  
4. `npm run dev` แล้วเปิด [http://localhost:3000](http://localhost:3000)

## เอกสาร

- [แบรนด์ & CI](docs/brand-ci-guideline.md)  
- [ดีพลอย Vercel (อ้างอิง)](docs/deployment-vercel.md)  
- [ฐานข้อมูล Supabase](docs/database-supabase.md)

Repository: [github.com/baanpakpoolvilla/jad-trip](https://github.com/baanpakpoolvilla/jad-trip)
