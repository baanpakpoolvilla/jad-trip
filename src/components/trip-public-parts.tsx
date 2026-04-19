import { Calendar, Compass, MapPinned, Package, ShieldAlert, Star, UserRound, Users } from "lucide-react";
import { formatBangkokTripDates } from "@/lib/datetime";

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

// ─── Rich content block ────────────────────────────────────────────────────────

type RichBlockVariant = "card" | "warning" | "guide" | "packing" | "itinerary" | "highlight";

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

/** แยกย่อหน้าในกำหนดการให้อ่านเป็นช่วง ๆ (เช่น แยกตามวัน) โดยไม่บังคับรูปแบบ */
function TripItineraryBody({ text }: { text: string }) {
  const trimmed = text.trim();
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

export function TripRichBlock({
  title,
  body,
  variant = "card",
}: {
  title: string;
  body: string | null | undefined;
  variant?: RichBlockVariant;
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
}: {
  name: string;
  phone: string | null | undefined;
  bio: string | null | undefined;
  avatarUrl: string | null | undefined;
  variant?: "organizer" | "guide";
}) {
  const label = variant === "guide" ? "ไกด์ประจำทริป" : "ผู้จัดทริป";
  return (
    <section className="flex gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm sm:gap-5 sm:rounded-2xl sm:p-6">
      {/* Avatar */}
      <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-brand-light bg-brand-light sm:size-18 sm:rounded-2xl">
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
            <UserRound className="size-8 opacity-60" strokeWidth={1.25} aria-hidden />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="jad-section-label">{label}</p>
        <p className="mt-0.5 text-base font-semibold leading-snug text-fg sm:mt-1 sm:text-xl">{name}</p>
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
