import type { Session } from "next-auth";
import { auth } from "@/auth";

/** ไม่ throw — JWT เสีย / Auth.js misconfigured จะได้ null แทนล้มทั้งเชลล์ */
export async function safeAuth(): Promise<Session | null> {
  try {
    return await auth();
  } catch {
    return null;
  }
}
