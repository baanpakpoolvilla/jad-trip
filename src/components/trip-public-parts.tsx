import { UserRound } from "lucide-react";

export function parseGalleryUrls(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export function TripCoverImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-canvas shadow-md ring-1 ring-black/[0.04]">
      {/* eslint-disable-next-line @next/next/no-img-element -- URL จากผู้จัดภายนอก */}
      <img
        src={src}
        alt={alt}
        className="aspect-video max-h-80 w-full object-cover sm:max-h-[22rem]"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}

export function TripGalleryGrid({ urls, altBase }: { urls: string[]; altBase: string }) {
  if (urls.length === 0) return null;
  return (
    <section className="space-y-4">
      <div>
        <p className="jad-section-label">แกลเลอรี</p>
        <h2 className="mt-1 text-lg font-semibold text-fg sm:text-xl">รูปภาพเพิ่มเติม</h2>
      </div>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        {urls.map((url, i) => (
          <li
            key={`${url}-${i}`}
            className="overflow-hidden rounded-xl border border-border bg-canvas shadow-sm ring-1 ring-black/[0.03]"
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
      ? "rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
      : "rounded-2xl border border-warning/20 bg-warning-light/40 p-5 sm:p-6";
  return (
    <section className={wrap}>
      <div className="border-l-[3px] border-brand pl-4">
        <h2 className="text-base font-semibold text-fg sm:text-lg">{title}</h2>
        <p className="jad-prose-flow mt-3 whitespace-pre-wrap">{body.trim()}</p>
      </div>
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
    <section className="flex gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:gap-5 sm:p-6">
      <div className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-2xl border border-border bg-brand-light shadow-inner sm:size-24">
        {avatarUrl?.trim() ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl.trim()} alt="" className="size-full object-cover" loading="lazy" />
        ) : (
          <div className="flex size-full items-center justify-center text-brand">
            <UserRound className="size-10 opacity-55" strokeWidth={1.25} aria-hidden />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="jad-section-label">ผู้จัดทริป</p>
        <p className="mt-1 text-xl font-semibold leading-snug text-fg">{name}</p>
        {phone?.trim() ? (
          <p className="mt-2 text-sm font-medium text-fg-muted">
            <span className="text-fg-hint">โทร</span> {phone.trim()}
          </p>
        ) : null}
        {bio?.trim() ? <p className="jad-prose-flow mt-3 text-fg-muted">{bio.trim()}</p> : null}
      </div>
    </section>
  );
}
