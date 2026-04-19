"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Banknote, Bell, CreditCard, Sparkles } from "lucide-react";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/actions/notifications";
import {
  notificationKindMeta,
  notificationPrimaryCta,
} from "@/lib/organizer-notification-meta";

export type NotificationListItem = {
  id: string;
  kind: string;
  title: string;
  message: string;
  href: string | null;
  readAt: string | null;
  createdAtIso: string;
};

function relativePastTh(iso: string): string | null {
  const diffMs = Date.now() - new Date(iso).getTime();
  if (diffMs < 0) return "เมื่อสักครู่";
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "เมื่อสักครู่";
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `${days} วันที่แล้ว`;
  return null;
}

function KindIcon({ kind }: { kind: string }) {
  switch (kind) {
    case "BOOKING_PAID_STRIPE":
      return <CreditCard className="size-5 shrink-0 text-brand" strokeWidth={1.5} aria-hidden />;
    case "BOOKING_PAID":
      return <Banknote className="size-5 shrink-0 text-brand" strokeWidth={1.5} aria-hidden />;
    default:
      return <Bell className="size-5 shrink-0 text-fg-muted" strokeWidth={1.5} aria-hidden />;
  }
}

export function NotificationList({
  items,
  formatDate,
  totalCount,
  unreadCount,
}: {
  items: NotificationListItem[];
  formatDate: (iso: string) => string;
  totalCount: number;
  unreadCount: number;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const visible = useMemo(() => {
    if (filter === "unread") return items.filter((i) => !i.readAt);
    return items;
  }, [items, filter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div
          className="inline-flex rounded-lg border border-border bg-surface p-0.5 text-sm shadow-sm"
          role="tablist"
          aria-label="กรองการแจ้งเตือน"
        >
          <button
            type="button"
            role="tab"
            aria-selected={filter === "all"}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              filter === "all"
                ? "bg-brand text-white shadow-sm"
                : "text-fg-muted hover:bg-canvas hover:text-fg"
            }`}
            onClick={() => setFilter("all")}
          >
            ทั้งหมด ({totalCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === "unread"}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              filter === "unread"
                ? "bg-brand text-white shadow-sm"
                : "text-fg-muted hover:bg-canvas hover:text-fg"
            }`}
            onClick={() => setFilter("unread")}
          >
            ยังไม่อ่าน ({unreadCount})
          </button>
        </div>

        {unreadCount > 0 ? (
          <button
            type="button"
            className="jad-btn-secondary w-full shrink-0 text-sm sm:w-auto"
            onClick={async () => {
              await markAllNotificationsRead();
              router.refresh();
            }}
          >
            ทำเครื่องหมายว่าอ่านทั้งหมดแล้ว
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="jad-card space-y-4 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-light">
            <Sparkles className="size-6 text-brand" strokeWidth={1.5} aria-hidden />
          </div>
          <div className="space-y-2">
            <p className="font-medium text-fg">ยังไม่มีการแจ้งเตือน</p>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-fg-muted">
              เมื่อมีผู้จองชำระเงินสำเร็จ (ผ่านสลิป PromptPay หรือ Stripe) ระบบจะสร้างรายการที่นี่
              และแสดงจำนวนยังไม่อ่านบนเมนูด้านข้าง
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-center">
            <Link href="/organizer/trips" className="jad-btn-primary text-sm">
              ไปทริปของฉัน
            </Link>
            <Link href="/organizer" className="jad-btn-secondary text-sm">
              กลับแดชบอร์ด
            </Link>
          </div>
        </div>
      ) : visible.length === 0 ? (
        <p className="rounded-lg border border-border bg-surface px-4 py-6 text-center text-sm text-fg-muted">
          ไม่มีรายการในหมวดนี้ — ลองสลับเป็น «ทั้งหมด» หรือรอแจ้งเตือนใหม่
        </p>
      ) : (
        <ul className="space-y-2.5">
          {visible.map((n) => {
            const meta = notificationKindMeta(n.kind);
            const cta = notificationPrimaryCta(n.href);
            const rel = relativePastTh(n.createdAtIso);
            return (
              <li
                key={n.id}
                className={`jad-card flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between ${
                  n.readAt ? "opacity-85" : "border-brand/30 bg-brand-light/25 shadow-sm"
                }`}
              >
                <div className="flex min-w-0 gap-3">
                  <div className="mt-0.5 shrink-0">
                    <KindIcon kind={n.kind} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full border border-border bg-canvas px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-fg-muted">
                        {meta.label}
                      </span>
                      {!n.readAt ? (
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-brand">
                          ยังไม่อ่าน
                        </span>
                      ) : (
                        <span className="text-[11px] text-fg-hint">อ่านแล้ว</span>
                      )}
                    </div>
                    <p className="mt-1.5 font-semibold text-fg">{n.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-fg-muted">{n.message}</p>
                    <p className="mt-2 text-xs text-fg-hint">
                      {rel ? <span>{rel} · </span> : null}
                      <span className="tabular-nums">{formatDate(n.createdAtIso)}</span>
                      <span className="text-fg-hint"> · {meta.shortHint}</span>
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-2 border-t border-border pt-3 sm:w-44 sm:border-t-0 sm:border-l sm:pl-4 sm:pt-0">
                  {n.href && cta ? (
                    <Link href={n.href} className="jad-btn-secondary w-full px-3 py-2 text-center text-xs">
                      {cta.label}
                    </Link>
                  ) : null}
                  {!n.readAt ? (
                    <button
                      type="button"
                      className="jad-btn-ghost w-full px-3 py-2 text-xs"
                      onClick={async () => {
                        await markNotificationRead(n.id);
                        router.refresh();
                      }}
                    >
                      ทำเครื่องหมายว่าอ่านแล้ว
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

    </div>
  );
}
