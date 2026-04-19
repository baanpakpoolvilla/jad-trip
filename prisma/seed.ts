import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { assignUniqueShareCodeForTrip } from "../src/lib/trip-share-code";

const prisma = new PrismaClient();

/** ค่าเริ่มต้นให้ตรงกับ docs/demo-accounts.md */
const DEFAULT_ADMIN_PASSWORD = "DemoJad_Admin_2026";
const DEFAULT_ORG_PASSWORD = "DemoJad_Organizer_2026";

const adminEmail = "demo-admin@jad-trip.local";
const orgEmail = "demo-organizer@jad-trip.local";

async function main() {
  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
  const orgPassword =
    process.env.SEED_ORGANIZER_PASSWORD ?? DEFAULT_ORG_PASSWORD;

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
      bio: "นำทริปเดินป่ามากกว่า 8 ปี เน้นความปลอดภัยและประสบการณ์ผู้เริ่มต้น",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    },
    update: {
      passwordHash: await hash(orgPassword, 12),
      bio: "นำทริปเดินป่ามากกว่า 8 ปี เน้นความปลอดภัยและประสบการณ์ผู้เริ่มต้น",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    },
  });

  const existing = await prisma.trip.findFirst({
    where: { organizerId: organizer.id, title: "ดอยอินทนนท์ 1 วัน (ตัวอย่าง)" },
  });

  let sampleTripId: string | null = null;
  if (!existing) {
    const start = new Date();
    start.setDate(start.getDate() + 14);
    start.setHours(6, 0, 0, 0);
    const end = new Date(start);
    end.setHours(18, 0, 0, 0);

    const created = await prisma.trip.create({
      data: {
        organizerId: organizer.id,
        title: "ดอยอินทนนท์ 1 วัน (ตัวอย่าง)",
        shortDescription: "เดินป่าเบาๆ วิวสวย เหมาะผู้เริ่ม",
        description:
          "รายละเอียดทริปตัวอย่าง — นำร่องกันน้ำ รองเท้าเดินป่า และเสื้อกันหนาวตามฤดูกาล ชมทะเลหมอกยามเช้าและเส้นทางสันเขาเบาๆ",
        meetPoint: "ลานจอดรถหน้าอุทยาน ณ 05:30 น.",
        startAt: start,
        endAt: end,
        maxParticipants: 8,
        pricePerPerson: 2500,
        bookingClosesAt: new Date(start.getTime() - 2 * 24 * 60 * 60 * 1000),
        policyNotes:
          "ยกเลิกก่อนชำระเงินได้ในระบบ หลังชำระแล้วโปรดติดต่อผู้จัดทริปเพื่อตกลงคืนเงิน",
        status: "PUBLISHED",
        coverImageUrl:
          "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=600&fit=crop",
        galleryImageUrls:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop\nhttps://images.unsplash.com/photo-1478131143081-80f7f84caae0?w=600&h=600&fit=crop",
        guideDetails:
          "ไกด์นำทริป 1 คน + ผู้ช่วย 1 คน — อธิบายเส้นทาง จุดพัก และการดูแลความปลอดภัยตลอดเส้นทาง",
        itinerary:
          "05:30 รวมกลุ่มที่ลานจอด\n06:00 เริ่มเดินเส้นทางหลัก\n10:00 พักรับประทานอาหารว่าง\n15:00 กลับถึงจุดรวมกลุ่ม",
        travelNotes: "รถส่วนตัวหรือรถตู้จ้างเหมา — มีที่จอดหน้าอุทยาน (ค่าบริการตามประกาศอุทยาน)",
        highlights:
          "จุดชมวิวกิ่วแม่ปาน · ทะเลหมอกยามเช้า · ป่าสนสูงอายุยืนยาว · โอกาสพบนกท้องถิ่น",
        packingList:
          "น้ำดื่ม 1-2 ลิตร · รองเท้าเดินป่า · หมวกกันแดด · แจ็กเก็ตกันหนาว · ไม้เท้า (ถ้ามี)",
        safetyNotes:
          "ช่วงฝนทางลื่น — ระวังทากในป่าทึบ แนะนำถุงเท้ายาวและสเปรย์กันยุง ตามฤดูกาล",
        guideProvides: "อาหารว่าง 1 มื้อ · น้ำดื่มกลางวัน · ชุดปฐมพยาบาลเบื้องต้น · แผนที่เส้นทาง",
      },
    });
    sampleTripId = created.id;
  } else {
    sampleTripId = existing.id;
  }

  if (sampleTripId) {
    await assignUniqueShareCodeForTrip(sampleTripId);
    await prisma.trip.update({
      where: { id: sampleTripId },
      data: {
        coverImageUrl:
          "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=600&fit=crop",
        galleryImageUrls:
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop\nhttps://images.unsplash.com/photo-1478131143081-80f7f84caae0?w=600&h=600&fit=crop",
        guideDetails:
          "ไกด์นำทริป 1 คน + ผู้ช่วย 1 คน — อธิบายเส้นทาง จุดพัก และการดูแลความปลอดภัยตลอดเส้นทาง",
        itinerary:
          "05:30 รวมกลุ่มที่ลานจอด\n06:00 เริ่มเดินเส้นทางหลัก\n10:00 พักรับประทานอาหารว่าง\n15:00 กลับถึงจุดรวมกลุ่ม",
        travelNotes:
          "รถส่วนตัวหรือรถตู้จ้างเหมา — มีที่จอดหน้าอุทยาน (ค่าบริการตามประกาศอุทยาน)",
        highlights:
          "จุดชมวิวกิ่วแม่ปาน · ทะเลหมอกยามเช้า · ป่าสนสูงอายุยืนยาว · โอกาสพบนกท้องถิ่น",
        packingList:
          "น้ำดื่ม 1-2 ลิตร · รองเท้าเดินป่า · หมวกกันแดด · แจ็กเก็ตกันหนาว · ไม้เท้า (ถ้ามี)",
        safetyNotes:
          "ช่วงฝนทางลื่น — ระวังทากในป่าทึบ แนะนำถุงเท้ายาวและสเปรย์กันยุง ตามฤดูกาล",
        guideProvides:
          "อาหารว่าง 1 มื้อ · น้ำดื่มกลางวัน · ชุดปฐมพยาบาลเบื้องต้น · แผนที่เส้นทาง",
      },
    });
  }

  console.log("Seed OK — บัญชีทดสอบ (ดู docs/demo-accounts.md):");
  console.log(`  แอดมิน: ${adminEmail}`);
  console.log(`  ผู้จัด: ${orgEmail}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
