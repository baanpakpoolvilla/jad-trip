import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD ?? "change-me-admin-123";
  const orgPassword =
    process.env.SEED_ORGANIZER_PASSWORD ?? "change-me-org-123";

  const adminEmail = "admin@dernpa.local";
  const orgEmail = "organizer@dernpa.local";

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      name: "ผู้ดูแลระบบ",
      passwordHash: await hash(adminPassword, 12),
      role: Role.ADMIN,
    },
    update: {
      passwordHash: await hash(adminPassword, 12),
      role: Role.ADMIN,
    },
  });

  const organizer = await prisma.user.upsert({
    where: { email: orgEmail },
    create: {
      email: orgEmail,
      name: "ผู้จัดทริปตัวอย่าง",
      phone: "0812345678",
      passwordHash: await hash(orgPassword, 12),
      role: Role.ORGANIZER,
    },
    update: {
      passwordHash: await hash(orgPassword, 12),
    },
  });

  const existing = await prisma.trip.findFirst({
    where: { organizerId: organizer.id, title: "ดอยอินทนนท์ 1 วัน (ตัวอย่าง)" },
  });

  if (!existing) {
    const start = new Date();
    start.setDate(start.getDate() + 14);
    start.setHours(6, 0, 0, 0);
    const end = new Date(start);
    end.setHours(18, 0, 0, 0);

    await prisma.trip.create({
      data: {
        organizerId: organizer.id,
        title: "ดอยอินทนนท์ 1 วัน (ตัวอย่าง)",
        shortDescription: "เดินป่าเบาๆ วิวสวย เหมาะผู้เริ่ม",
        description:
          "รายละเอียดทริปตัวอย่าง — นำร่องกันน้ำ รองเท้าเดินป่า และเสื้อกันหนาวตามฤดูกาล",
        meetPoint: "ลานจอดรถหน้าอุทยาน ณ 05:30 น.",
        startAt: start,
        endAt: end,
        maxParticipants: 8,
        pricePerPerson: 2500,
        bookingClosesAt: new Date(start.getTime() - 2 * 24 * 60 * 60 * 1000),
        policyNotes:
          "ยกเลิกก่อนชำระเงินได้ในระบบ หลังชำระแล้วโปรดติดต่อผู้จัดทริปเพื่อตกลงคืนเงิน",
        status: "PUBLISHED",
      },
    });
  }

  console.log("Seed OK — บัญชีทดสอบ:");
  console.log(`  แอดมิน: ${adminEmail} / (ตั้งใน SEED_ADMIN_PASSWORD หรือค่าเริ่มต้นใน seed)`);
  console.log(`  ผู้จัด: ${orgEmail} / (ตั้งใน SEED_ORGANIZER_PASSWORD หรือค่าเริ่มต้นใน seed)`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
