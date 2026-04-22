"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export type TripPostData = {
  title: string;
  shortDescription: string;
  startAt: string;
  endAt: string;
  meetPoint: string;
  destinationName: string;
  pricePerPerson: number;
  maxParticipants: number;
  bookingClosesAt: string | null;
  highlights: string;
  itinerary: string;
  guideProvides: string;
  policyNotes: string;
  tripUrl: string;
  organizer: {
    name: string;
    phone: string | null;
    socialLine: string | null;
    socialFacebook: string | null;
    socialInstagram: string | null;
    socialTiktok: string | null;
    profileUrl: string | null;
  };
};

/** แปลง multiline text → bullet list (กรองบรรทัดว่าง) */
function toBullets(raw: string): string[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => (l.startsWith("•") || l.startsWith("-") ? l : `• ${l}`));
}

function buildPostText(d: TripPostData): string {
  const sections: string[][] = [];

  // ─── Header ─────────────────────────────────────────────
  const header: string[] = [];
  header.push(`✨ ${d.title}`);
  if (d.shortDescription.trim()) header.push(d.shortDescription.trim());
  sections.push(header);

  // ─── ข้อมูลทริป ──────────────────────────────────────────
  const info: string[] = [];
  const sameDay = d.startAt === d.endAt;
  info.push(`📅 วันเดินทาง: ${d.startAt}${sameDay ? "" : ` – ${d.endAt}`}`);
  if (d.destinationName.trim()) info.push(`🏔️ จุดหมาย: ${d.destinationName.trim()}`);
  info.push(`📍 จุดนัดพบ: ${d.meetPoint.trim()}`);
  info.push(`💰 ราคา: ฿${d.pricePerPerson.toLocaleString("th-TH")} / คน`);
  info.push(`👥 รับสูงสุด: ${d.maxParticipants} คน`);
  if (d.bookingClosesAt) info.push(`⏰ ปิดรับจอง: ${d.bookingClosesAt}`);
  sections.push(info);

  // ─── ไฮไลต์ ──────────────────────────────────────────────
  const hlBullets = toBullets(d.highlights);
  if (hlBullets.length > 0) {
    sections.push(["⭐ ไฮไลต์", ...hlBullets]);
  }

  // ─── กำหนดการ ────────────────────────────────────────────
  const itiLines = d.itinerary
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (itiLines.length > 0) {
    sections.push(["🗓️ กำหนดการ", ...itiLines]);
  }

  // ─── รวมในราคา ───────────────────────────────────────────
  const providesBullets = toBullets(d.guideProvides);
  if (providesBullets.length > 0) {
    sections.push(["✅ รวมในราคา", ...providesBullets]);
  }

  // ─── เงื่อนไข ─────────────────────────────────────────────
  const policyLines = d.policyNotes
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (policyLines.length > 0) {
    sections.push(["📌 เงื่อนไขการจอง", ...policyLines]);
  }

  // ─── ลิงก์จอง ────────────────────────────────────────────
  sections.push(["🔗 ดูรายละเอียดเพิ่มเติมและจองที่นี่:", d.tripUrl]);

  // ─── ช่องทางติดต่อ ────────────────────────────────────────
  const contactLines: string[] = [];
  if (d.organizer.phone) contactLines.push(`📞 ${d.organizer.phone}`);
  if (d.organizer.socialLine) contactLines.push(`💬 LINE: ${d.organizer.socialLine}`);
  if (d.organizer.socialFacebook) contactLines.push(`📘 Facebook: ${d.organizer.socialFacebook}`);
  if (d.organizer.socialInstagram) contactLines.push(`📷 Instagram: ${d.organizer.socialInstagram}`);
  if (d.organizer.socialTiktok) contactLines.push(`🎵 TikTok: ${d.organizer.socialTiktok}`);
  if (d.organizer.profileUrl) contactLines.push(`🌐 ทริปทั้งหมด: ${d.organizer.profileUrl}`);

  if (d.organizer.name || contactLines.length > 0) {
    sections.push([`📋 ติดต่อผู้จัด: ${d.organizer.name}`, ...contactLines]);
  }

  return sections.map((s) => s.join("\n")).join("\n.\n");
}

export function CopyTripPostButton({ trip }: { trip: TripPostData }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  async function handleCopy() {
    const text = buildPostText(trip);
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`คัดลอกโพสต์ทริป ${trip.title}`}
      title="คัดลอกโพสต์สำหรับ Facebook"
      className={`inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors ${
        state === "copied"
          ? "border-success/40 bg-success-light text-success"
          : state === "error"
            ? "border-danger/40 bg-danger-light text-danger"
            : "border-border text-fg-muted hover:border-brand/40 hover:bg-brand-light/50 hover:text-brand"
      }`}
    >
      {state === "copied" ? (
        <>
          <Check className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
          คัดลอกแล้ว
        </>
      ) : state === "error" ? (
        <>
          <Copy className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
          ลองใหม่
        </>
      ) : (
        <>
          <Copy className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
          คัดลอกเนื้อหา
        </>
      )}
    </button>
  );
}
