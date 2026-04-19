import { UserRound } from "lucide-react";

export function parseGalleryUrls(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export function TripCoverImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-canvas shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element -- URL จากผู้จัดภายนอก */}
      <img
        src={src}
        alt={alt}
        className="aspect-video max-h-72 w-full object-cover sm:max-h-80"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}

export function TripGalleryGrid({ urls, altBase }: { urls: string[]; altBase: string }) {
  if (urls.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-fg">รูปภาพเพิ่มเติม</h2>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        {urls.map((url, i) => (
          <li key={`${url}-${i}`} className="overflow-hidden rounded-lg border border-border bg-canvas">
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

export function TripRichBlock({
  title,
  body,
  variant = "card",
}: {
  title: string;
  body: string | null | undefined;
  variant?: "card" | "plain";
}) {
  if (!body?.trim()) return null;
  const wrap =
    variant === "card"
      ? "jad-card space-y-2"
      : "space-y-2 rounded-lg border border-border bg-surface/80 p-4";
  return (
    <section className={wrap}>
      <h2 className="text-base font-semibold text-fg">{title}</h2>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg-muted">{body.trim()}</p>
    </section>
  );
}

export function OrganizerProfileCard({
  name,
  phone,
  bio,
  avatarUrl,
}: {
  name: string;
  phone: string | null | undefined;
  bio: string | null | undefined;
  avatarUrl: string | null | undefined;
}) {
  return (
    <section className="jad-card flex gap-4">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-full border border-border bg-brand-light sm:size-20">
        {avatarUrl?.trim() ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl.trim()} alt="" className="size-full object-cover" loading="lazy" />
        ) : (
          <div className="flex size-full items-center justify-center text-brand">
            <UserRound className="size-8 opacity-60" strokeWidth={1.25} aria-hidden />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-xs font-medium uppercase tracking-wide text-fg-muted">ผู้จัดทริป</h2>
        <p className="mt-1 text-lg font-semibold text-fg">{name}</p>
        {phone?.trim() ? (
          <p className="mt-1 text-sm text-fg-muted">โทร {phone.trim()}</p>
        ) : null}
        {bio?.trim() ? (
          <p className="mt-2 text-sm leading-relaxed text-fg-muted">{bio.trim()}</p>
        ) : null}
      </div>
    </section>
  );
}
