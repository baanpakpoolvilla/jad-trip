import Link from "next/link";
import {
  Calendar,
  Car,
  Compass,
  MapPin,
  MapPinned,
  Package,
  ShieldAlert,
  Star,
  UserRound,
  Users,
} from "lucide-react";
import { formatBangkokTripDates } from "@/lib/datetime";
import {
  tripDestinationGoogleMapsWebUrl,
  tripDestinationMapEmbedUrl,
  tripDestinationOpenStreetMapUrl,
} from "@/lib/trip-destination-map-embed";
import { itineraryIsStructuredJson, type TripItineraryDay } from "@/lib/trip-itinerary-json";

export function parseGalleryUrls(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

// ─── Hero ──────────────────────────────────────────────────────────────────────

export function TripHero({
  title,
  shortDescription,
  coverImageUrl,
  startAt,
  endAt,
  pricePerPerson,
  spotsLeft,
  maxParticipants,
}: {
  title: string;
  shortDescription: string | null | undefined;
  coverImageUrl: string | null | undefined;
  startAt: Date;
  endAt: Date;
  pricePerPerson: number;
  spotsLeft: number;
  maxParticipants: number;
}) {
  const tripDatesLabel = formatBangkokTripDates(startAt, endAt);
  const hasImage = coverImageUrl?.trim();

  return (
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl">
      {/* Background — either cover image with gradient scrim, or pure brand gradient */}
      {hasImage ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- URL จากผู้จัดภายนอก */}
          <img
            src={hasImage}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
          {/* Gradient scrim — transparent top → brand-dark bottom */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(22,56,41,0.18) 0%, rgba(22,56,41,0.65) 40%, rgba(22,56,41,0.97) 100%)",
            }}
          />
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, #163829 0%, #1e4d3a 55%, #2d7a57 100%)",
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 px-4 pb-8 pt-9 sm:px-10 sm:pb-14 sm:pt-16">
        {/* Eyebrow */}
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/65 sm:mb-3 sm:text-[11px]">
          รายละเอียดทริป
        </p>

        {/* Title */}
        <h1 className="max-w-2xl text-[1.65rem] font-bold leading-[1.2] tracking-tight text-white sm:text-[2.75rem] sm:leading-[1.15]">
          {title}
        </h1>

        {/* Lead */}
        {shortDescription?.trim() && (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/82 sm:mt-3 sm:text-base">
            {shortDescription.trim()}
          </p>
        )}

        {/* Stats chips */}
        <ul className="mt-4 flex flex-wrap gap-1.5 sm:mt-6 sm:gap-2" aria-label="ข้อมูลสรุป">
          <li className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/12 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-sm">
            <Calendar className="size-3 shrink-0 sm:size-3.5" strokeWidth={1.5} aria-hidden />
            {tripDatesLabel}
          </li>
          <li className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/18 px-2.5 py-1 text-xs text-white backdrop-blur-sm sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-sm">
            <span className="font-bold tabular-nums">
              ฿{pricePerPerson.toLocaleString("th-TH")}
            </span>
            <span className="text-white/65">/ คน</span>
          </li>
          {spotsLeft > 0 ? (
            <li className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/12 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-sm">
              <Users className="size-3 shrink-0 sm:size-3.5" strokeWidth={1.5} aria-hidden />
              เหลือ {spotsLeft}/{maxParticipants} ที่
            </li>
          ) : (
            <li className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/8 px-2.5 py-1 text-xs font-medium text-white/55 backdrop-blur-sm sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-sm">
              <Users className="size-3 shrink-0 sm:size-3.5" strokeWidth={1.5} aria-hidden />
              เต็มแล้ว
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

// ─── Gallery ───────────────────────────────────────────────────────────────────

export function TripGalleryGrid({ urls, altBase }: { urls: string[]; altBase: string }) {
  if (urls.length === 0) return null;
  return (
    <section className="space-y-3 sm:space-y-4">
      <div>
        <p className="jad-section-label">แกลเลอรี</p>
        <h2 className="mt-0.5 text-base font-semibold text-fg sm:mt-1 sm:text-xl">รูปภาพเพิ่มเติม</h2>
      </div>
      <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-3">
        {urls.map((url, i) => (
          <li
            key={`${url}-${i}`}
            className="overflow-hidden rounded-xl border border-border bg-canvas shadow-sm ring-1 ring-black/3"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`${altBase} — รูป ${i + 1}`}
              className="aspect-square w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── Destination (map) ───────────────────────────────────────────────────────

/** แสดงเมื่อผู้จัดเลือกจุดหมายจากแผนที่ในฟอร์มทริป */
export function TripDestinationSection({
  name,
  lat,
  lon,
}: {
  name: string;
  lat: number;
  lon: number;
}) {
  const label = name.trim() || "จุดหมายปลายทาง";
  const osmHref = tripDestinationOpenStreetMapUrl(lat, lon, 15);
  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:rounded-2xl sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent-light text-accent sm:size-9 sm:rounded-lg">
          <MapPin className="size-4 sm:size-4.5" strokeWidth={1.5} aria-hidden />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <h2 className="text-[15px] font-semibold text-fg sm:text-[17px]">จุดหมายปลายทาง</h2>
          <p className="jad-prose-flow mt-2 text-sm leading-relaxed sm:mt-2.5">{label}</p>
          <div className="relative mt-3 aspect-video w-full min-h-48 overflow-hidden rounded-lg border border-border/70 bg-canvas-muted/40 sm:mt-4 sm:min-h-56">
            <iframe
              title="แผนที่จุดหมายปลายทาง"
              src={tripDestinationMapEmbedUrl(lat, lon, 13)}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <p className="mt-2 text-[10px] text-fg-hint sm:text-xs">
            <a href={osmHref} className="font-medium text-brand hover:text-brand-mid" target="_blank" rel="noreferrer">
              เปิดใน OpenStreetMap
            </a>
            {" · "}
            <a
              href={tripDestinationGoogleMapsWebUrl(lat, lon, 14)}
              className="font-medium text-brand hover:text-brand-mid"
              target="_blank"
              rel="noreferrer"
            >
              เปิดใน Google Maps
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Rich content block ────────────────────────────────────────────────────────

type RichBlockVariant =
  | "card"
  | "warning"
  | "guide"
  | "packing"
  | "itinerary"
  | "highlight"
  | "travel";

const VARIANT_CONFIG: Record<
  RichBlockVariant,
  { icon: React.ReactNode; accentClass: string; wrapClass: string }
> = {
  card: {
    icon: <Star className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />,
    accentClass: "bg-brand-light text-brand",
    wrapClass: "rounded-xl border border-border bg-surface p-4 shadow-sm sm:rounded-2xl sm:p-6",
  },
  itinerary: {
    icon: <Calendar className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />,
    accentClass: "bg-brand-light text-brand",
    wrapClass: "rounded-xl border border-border bg-surface p-4 shadow-sm sm:rounded-2xl sm:p-6",
  },
  travel: {
    icon: <Car className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />,
    accentClass: "bg-brand-light text-brand",
    wrapClass: "rounded-xl border border-border bg-surface p-4 shadow-sm sm:rounded-2xl sm:p-6",
  },
  guide: {
    icon: <Compass className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />,
    accentClass: "bg-brand-light text-brand",
    wrapClass: "rounded-xl border border-border bg-surface p-4 shadow-sm sm:rounded-2xl sm:p-6",
  },
  packing: {
    icon: <Package className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />,
    accentClass: "bg-brand-light text-brand",
    wrapClass: "rounded-xl border border-border bg-surface p-4 shadow-sm sm:rounded-2xl sm:p-6",
  },
  highlight: {
    icon: <MapPinned className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />,
    accentClass: "bg-accent-light text-accent",
    wrapClass: "rounded-xl border border-accent/15 bg-accent-light/40 p-4 sm:rounded-2xl sm:p-6",
  },
  warning: {
    icon: <ShieldAlert className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />,
    accentClass: "bg-warning-light text-warning",
    wrapClass: "rounded-xl border border-warning/20 bg-warning-light/40 p-4 sm:rounded-2xl sm:p-6",
  },
};

function TripItineraryStructured({ days }: { days: TripItineraryDay[] }) {
  if (days.length === 0) return null;
  return (
    <div className="mt-2 space-y-3 sm:mt-2.5 sm:space-y-4">
      {days.flatMap((day, di) => {
        const title = day.title.trim();
        const slots = day.slots.filter((s) => s.time.trim() || s.detail.trim());
        if (!title && slots.length === 0) return [];
        return [
          <div
            key={di}
            className="rounded-lg border border-border/70 bg-canvas-muted/30 px-3 py-2.5 sm:rounded-xl sm:px-4 sm:py-3.5"
          >
            {title ? <h3 className="text-sm font-semibold text-fg sm:text-base">{title}</h3> : null}
            {slots.length > 0 ? (
              <ul className={title ? "mt-2 space-y-2.5 sm:space-y-3" : "space-y-2.5 sm:space-y-3"}>
                {slots.map((s, si) => (
                  <li key={si} className="border-l-2 border-brand/40 pl-3 sm:pl-3.5">
                    {s.time.trim() ? (
                      <p className="text-xs font-semibold tabular-nums text-brand sm:text-sm">{s.time.trim()}</p>
                    ) : null}
                    {s.detail.trim() ? (
                      <p
                        className={`jad-prose-flow whitespace-pre-wrap text-sm text-fg sm:text-[15px] ${s.time.trim() ? "mt-1" : ""}`}
                      >
                        {s.detail.trim()}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>,
        ];
      })}
    </div>
  );
}

/** แยกย่อหน้าในกำหนดการ — รองรับ JSON จากตัวสร้างในแดชบอร์ด และข้อความเดิม */
function TripItineraryBody({ text }: { text: string }) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (itineraryIsStructuredJson(trimmed)) {
    let parsed: { v?: number; days?: TripItineraryDay[] } | null = null;
    try {
      parsed = JSON.parse(trimmed) as { v?: number; days?: TripItineraryDay[] };
    } catch {
      parsed = null;
    }
    if (parsed && parsed.v === 1 && Array.isArray(parsed.days)) {
      return <TripItineraryStructured days={parsed.days} />;
    }
  }
  const blocks = trimmed.split(/\n\s*\n+/).filter(Boolean);
  if (blocks.length <= 1) {
    return <p className="jad-prose-flow mt-2.5 whitespace-pre-wrap">{trimmed}</p>;
  }
  return (
    <div className="mt-2 space-y-2 sm:mt-2.5 sm:space-y-2.5">
      {blocks.map((block, i) => (
        <div
          key={i}
          className="rounded-lg border border-border/70 bg-canvas-muted/30 px-3 py-2.5 sm:rounded-xl sm:px-4 sm:py-3.5"
        >
          <p className="jad-prose-flow whitespace-pre-wrap">{block.trim()}</p>
        </div>
      ))}
    </div>
  );
}

/** บรรทัดจากฟอร์ม BulletLinesField / ข้อความเก่าที่คั่นด้วยบรรทัดใหม่ */
function bodyToBulletLines(body: string): string[] {
  return body
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\s•\-\*]+/, "").trim())
    .filter(Boolean);
}

function TripBulletList({ body }: { body: string }) {
  const lines = bodyToBulletLines(body);
  if (!lines.length) return null;
  return (
    <ul className="mt-2.5 list-none space-y-2 sm:mt-2.5 sm:space-y-2.5">
      {lines.map((line, i) => (
        <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-fg sm:text-[15px]">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
          <span className="jad-prose-flow min-w-0">{line}</span>
        </li>
      ))}
    </ul>
  );
}

/** ตรงกับ TripTravelNotesField: บรรทัดแรก «รูปแบบการเดินทาง: …» กับรายละเอียดด้านล่าง */
function TripTravelNotesPublic({ text }: { text: string }) {
  const t = text.trim();
  if (!t) return null;
  const m = t.match(/^รูปแบบการเดินทาง:\s*([\s\S]*?)(?:\n\n([\s\S]*)|\s*$)/);
  if (m) {
    const head = m[1]!.trim();
    const detail = (m[2] ?? "").trim();
    return (
      <div className="mt-2.5 space-y-2 sm:space-y-2.5">
        <p className="text-sm leading-relaxed text-fg sm:text-[15px]">
          <span className="font-semibold text-fg">รูปแบบการเดินทาง</span>
          <span className="text-fg-muted"> · </span>
          <span>{head}</span>
        </p>
        {detail ? (
          <p className="jad-prose-flow whitespace-pre-wrap text-sm leading-relaxed text-fg sm:text-[15px]">
            {detail}
          </p>
        ) : null}
      </div>
    );
  }
  return <p className="jad-prose-flow mt-2.5 whitespace-pre-wrap text-sm sm:text-[15px]">{t}</p>;
}

export function TripRichBlock({
  title,
  body,
  variant = "card",
  bodyAsList = false,
}: {
  title: string;
  body: string | null | undefined;
  variant?: RichBlockVariant;
  /** แสดงเป็นบรรทัดละจุด (สอดคล้อง BulletLinesField ในฟอร์ม) */
  bodyAsList?: boolean;
}) {
  if (!body?.trim()) return null;
  const { icon, accentClass, wrapClass } = VARIANT_CONFIG[variant];
  return (
    <section className={wrapClass}>
      <div className="flex items-start gap-2.5 sm:gap-3">
        {/* Icon container */}
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-md sm:size-9 sm:rounded-lg ${accentClass}`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <h2 className="text-[15px] font-semibold leading-snug text-fg sm:text-[17px]">{title}</h2>
          {variant === "itinerary" ? (
            <TripItineraryBody text={body} />
          ) : variant === "travel" ? (
            <TripTravelNotesPublic text={body} />
          ) : bodyAsList ? (
            <TripBulletList body={body} />
          ) : (
            <p className="jad-prose-flow mt-2.5 whitespace-pre-wrap">{body.trim()}</p>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Organizer card ────────────────────────────────────────────────────────────

export function OrganizerProfileCard({
  name,
  phone,
  bio,
  avatarUrl,
  variant = "organizer",
  publicProfileHref,
}: {
  name: string;
  phone: string | null | undefined;
  bio: string | null | undefined;
  avatarUrl: string | null | undefined;
  variant?: "organizer" | "guide";
  /** ลิงก์โปรไฟล์สาธารณะของผู้จัด — เฉพาะ `variant="organizer"` */
  publicProfileHref?: string | null;
}) {
  const label = variant === "guide" ? "ไกด์ประจำทริป" : "ผู้จัดทริป";
  const profileHrefTrimmed = publicProfileHref?.trim() ?? "";
  const showProfileLink = variant === "organizer" && profileHrefTrimmed.length > 0;
  return (
    <section className="flex gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:gap-6 sm:rounded-2xl sm:p-6">
      {/* Avatar */}
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-brand-light bg-brand-light sm:size-24 sm:rounded-2xl">
        {avatarUrl?.trim() ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl.trim()}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-brand">
            <UserRound className="size-10 opacity-60 sm:size-11" strokeWidth={1.25} aria-hidden />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="jad-section-label">{label}</p>
        <p className="mt-0.5 text-base font-semibold leading-snug text-fg sm:mt-1 sm:text-xl">{name}</p>
        {showProfileLink ? (
          <p className="mt-1.5">
            <Link
              href={profileHrefTrimmed}
              className="text-sm font-medium text-brand hover:text-brand-mid hover:underline"
            >
              โปรไฟล์ผู้จัด (สาธารณะ) →
            </Link>
          </p>
        ) : null}
        {phone?.trim() ? (
          <p className="mt-1.5 text-sm text-fg-muted">
            <span className="text-fg-hint">โทร</span>{" "}
            <span className="font-medium text-fg">{phone.trim()}</span>
          </p>
        ) : null}
        {bio?.trim() ? (
          <p className="jad-prose-flow mt-3 border-t border-border/60 pt-3">{bio.trim()}</p>
        ) : null}
      </div>
    </section>
  );
}
