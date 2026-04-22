/**
 * สร้าง/อัปเดต admin account บน production
 *
 * วิธีใช้:
 *   ADMIN_EMAIL="your@email.com" ADMIN_PASSWORD="StrongPass123!" ADMIN_NAME="ชื่อแอดมิน" \
 *   DATABASE_URL="<production-url>" npx tsx scripts/create-admin.ts
 *
 * หรือใช้กับ .env.production.local โดยตั้ง DATABASE_URL ก่อนรัน
 */

import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";
import * as readline from "readline";
import * as crypto from "crypto";

const prisma = new PrismaClient();

function prompt(question: string, hidden = false): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    if (hidden) {
      process.stdout.write(question);
      process.stdin.setRawMode?.(true);
      let password = "";
      process.stdin.on("data", (ch) => {
        const char = ch.toString();
        if (char === "\n" || char === "\r" || char === "\u0004") {
          process.stdin.setRawMode?.(false);
          process.stdout.write("\n");
          rl.close();
          resolve(password);
        } else if (char === "\u007f") {
          password = password.slice(0, -1);
        } else {
          password += char;
          process.stdout.write("*");
        }
      });
      process.stdin.resume();
    } else {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  return Array.from(crypto.randomBytes(16))
    .map((b) => chars[b % chars.length])
    .join("");
}

async function main() {
  const dbUrl = process.env.DATABASE_URL?.trim();
  if (!dbUrl) {
    console.error("\n❌  ต้องตั้ง DATABASE_URL ให้ชี้ไปยัง production database ก่อนรัน script นี้\n");
    console.error("   ตัวอย่าง:");
    console.error('   DATABASE_URL="postgres://..." npx tsx scripts/create-admin.ts\n');
    process.exit(1);
  }

  console.log("\n🔐  สร้าง / อัปเดต Admin Account บน Production\n");
  console.log(`   Database: ${dbUrl.replace(/:([^:@]+)@/, ":***@")}\n`);

  const email =
    process.env.ADMIN_EMAIL?.trim() ||
    (await prompt("อีเมล admin: "));

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("❌  อีเมลไม่ถูกต้อง");
    process.exit(1);
  }

  const name =
    process.env.ADMIN_NAME?.trim() ||
    (await prompt("ชื่อแสดง (เช่น ผู้ดูแลระบบ): ")) ||
    "ผู้ดูแลระบบ";

  let password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) {
    const autoGen = generatePassword();
    const useAuto = await prompt(`สร้างรหัสผ่านอัตโนมัติ ${autoGen} ? [Y/n]: `);
    if (useAuto.toLowerCase() === "n") {
      password = await prompt("รหัสผ่านใหม่ (อย่างน้อย 12 ตัวอักษร): ");
    } else {
      password = autoGen;
    }
  }

  if (!password || password.length < 8) {
    console.error("❌  รหัสผ่านสั้นเกินไป (ต้องอย่างน้อย 8 ตัวอักษร)");
    process.exit(1);
  }

  const passwordHash = await hash(password, 12);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (existing.role !== Role.ADMIN) {
      const confirm = await prompt(
        `⚠️  user "${email}" มีอยู่แล้ว (role: ${existing.role}) จะเปลี่ยนเป็น ADMIN และอัปเดตรหัสผ่านหรือไม่? [y/N]: `,
      );
      if (confirm.toLowerCase() !== "y") {
        console.log("ยกเลิก");
        process.exit(0);
      }
    }

    await prisma.user.update({
      where: { email },
      data: { name, passwordHash, role: Role.ADMIN },
    });
    console.log(`\n✅  อัปเดต admin สำเร็จ: ${email}\n`);
  } else {
    await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: Role.ADMIN,
      },
    });
    console.log(`\n✅  สร้าง admin สำเร็จ: ${email}\n`);
  }

  console.log("┌─────────────────────────────────────────┐");
  console.log(`│  อีเมล    : ${email.padEnd(28)}│`);
  console.log(`│  รหัสผ่าน : ${password.padEnd(28)}│`);
  console.log(`│  URL      : /admin                       │`);
  console.log("└─────────────────────────────────────────┘");
  console.log("\n⚠️  บันทึกรหัสผ่านนี้ไว้ในที่ปลอดภัย — จะไม่แสดงอีกครั้ง\n");
}

main()
  .catch((e) => {
    console.error("❌  เกิดข้อผิดพลาด:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
