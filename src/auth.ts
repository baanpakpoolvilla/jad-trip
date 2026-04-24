import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import type { Role } from "@prisma/client";
import { db } from "@/lib/db";
import {
  isGoogleUserContentAvatarUrl,
  mirrorGoogleAvatarToSupabase,
} from "@/lib/mirror-google-avatar-to-supabase";

// ALLOWED_EMAIL_DOMAINS: ถ้าตั้งค่า จะจำกัด Google sign-in เฉพาะโดเมนที่ระบุ
// เช่น ALLOWED_EMAIL_DOMAINS="company.com,partner.org"
// ถ้าไม่ตั้ง — เปิดรับ Google account ทั้งหมด (สาธารณะ)
const allowedDomains = process.env.ALLOWED_EMAIL_DOMAINS
  ? process.env.ALLOWED_EMAIL_DOMAINS.split(",").map((d) => d.trim().toLowerCase()).filter(Boolean)
  : null;

export const { handlers, signIn, signOut, auth } = NextAuth({
  // trustHost: true — จำเป็นสำหรับ Vercel preview deployments ที่ hostname เปลี่ยนทุก deploy
  // ลด risk: ตั้ง AUTH_URL สำหรับ production เพื่อ lock canonical URL (ดู next.config.ts)
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "อีเมล", type: "email" },
        password: { label: "รหัสผ่าน", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email?.trim() || !password) return null;

        const user = await db.user.findUnique({
          where: { email: email.trim().toLowerCase() },
        });
        if (!user) return null;

        // Google-only accounts have an empty passwordHash
        if (!user.passwordHash) return null;

        const ok = await compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as Role,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;

        // ถ้าตั้ง ALLOWED_EMAIL_DOMAINS ไว้ — ตรวจโดเมนก่อน
        if (allowedDomains) {
          const domain = user.email.split("@")[1]?.toLowerCase();
          if (!domain || !allowedDomains.includes(domain)) return false;
        }

        const existing = await db.user.findUnique({
          where: { email: user.email },
        });
        if (!existing) {
          const mirrored = await mirrorGoogleAvatarToSupabase(user.image);
          await db.user.create({
            data: {
              email: user.email,
              name: user.name ?? user.email,
              passwordHash: "",
              role: "ORGANIZER",
              avatarUrl: mirrored ?? user.image ?? null,
            },
          });
        } else {
          const current = existing.avatarUrl?.trim() ?? "";
          const fromOAuth = user.image?.trim() ?? "";
          const isGoogleStored = current.length > 0 && isGoogleUserContentAvatarUrl(current);
          const shouldFillFromOAuth = current.length === 0 && fromOAuth.length > 0;
          if (isGoogleStored || shouldFillFromOAuth) {
            const source = isGoogleStored ? current : fromOAuth;
            const mirrored = await mirrorGoogleAvatarToSupabase(source);
            const nextAvatar = mirrored ?? source;
            if (nextAvatar !== existing.avatarUrl) {
              await db.user.update({
                where: { id: existing.id },
                data: { avatarUrl: nextAvatar },
              });
            }
          }
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && token.email) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      } else if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
});
