import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

/** ค่าเริ่มต้นให้ตรงกับ docs/demo-accounts.md */
const DEFAULT_ADMIN_PASSWORD = "DemoJust_Admin_2026";
const DEFAULT_ORG_PASSWORD = "DemoJust_Organizer_2026";
const DEFAULT_GUIDE_PASSWORD = "DemoJust_Guide_2026";

const adminEmail = "demo-admin@justtrip.local";
const orgEmail = "demo-organizer@justtrip.local";
const guideEmail = "demo-guide@justtrip.local";

async function main() {
  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
  const orgPassword =
    process.env.SEED_ORGANIZER_PASSWORD ?? DEFAULT_ORG_PASSWORD;
  const guidePassword =
    process.env.SEED_GUIDE_PASSWORD ?? DEFAULT_GUIDE_PASSWORD;

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

  await prisma.user.upsert({
    where: { email: orgEmail },
    create: {
      email: orgEmail,
      name: "บัญชีผู้จัดทดสอบ",
      passwordHash: await hash(orgPassword, 12),
      role: Role.ORGANIZER,
      isGuide: true,
      brochureShareCode: "demo0001",
      // ข้อมูลสมมติสำหรับทดสอบ QR / EasySlip — เปลี่ยนเป็นของจริงที่ /organizer/payments
      payoutPromptPayId: "0812345678",
      payoutBankName: "ธนาคารกสิกรไทย",
      payoutBankAccountName: "นายตัวอย่าง ระบบจอง",
      payoutBankAccountNumber: "1234567890",
    },
    update: {
      passwordHash: await hash(orgPassword, 12),
      role: Role.ORGANIZER,
      isGuide: true,
      brochureShareCode: "demo0001",
      payoutPromptPayId: "0812345678",
      payoutBankName: "ธนาคารกสิกรไทย",
      payoutBankAccountName: "นายตัวอย่าง ระบบจอง",
      payoutBankAccountNumber: "1234567890",
    },
  });

  await prisma.user.upsert({
    where: { email: guideEmail },
    create: {
      email: guideEmail,
      name: "ไกด์ทดสอบ (ดอยหมี)",
      passwordHash: await hash(guidePassword, 12),
      role: Role.ORGANIZER,
      isGuide: true,
      brochureShareCode: "demo0002",
      bio: "ไกด์ทดสอบ — นำเดินป่าและแคมป์เบา เน้นความปลอดภัยและจังหวะกลุ่มเล็ก",
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    },
    update: {
      passwordHash: await hash(guidePassword, 12),
      role: Role.ORGANIZER,
      isGuide: true,
      brochureShareCode: "demo0002",
      bio: "ไกด์ทดสอบ — นำเดินป่าและแคมป์เบา เน้นความปลอดภัยและจังหวะกลุ่มเล็ก",
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    },
  });

  console.log("Seed OK — บัญชีทดสอบ (ดู docs/demo-accounts.md):");
  console.log(`  แอดมิน: ${adminEmail}`);
  console.log(`  ผู้จัด: ${orgEmail}`);
  console.log(`  ไกด์: ${guideEmail}`);
  console.log("  (ไม่มีทริปตัวอย่าง — สร้างทริปจากแอปหลังล็อกอินผู้จัด)");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
