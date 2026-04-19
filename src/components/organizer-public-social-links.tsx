import { AtSign, Camera, Globe, MessageCircle, Music2, PlayCircle, Share2 } from "lucide-react";
import type { PublicOrganizerProfile } from "@/lib/trips-public";
import { safeHttpHref } from "@/lib/social-link";

const ROWS: {
  key: keyof Pick<
    PublicOrganizerProfile,
    | "socialWebsite"
    | "socialLine"
    | "socialFacebook"
    | "socialInstagram"
    | "socialTiktok"
    | "socialYoutube"
    | "socialX"
  >;
  label: string;
  Icon: typeof Globe;
}[] = [
  { key: "socialWebsite", label: "เว็บไซต์", Icon: Globe },
  { key: "socialLine", label: "LINE", Icon: MessageCircle },
  { key: "socialFacebook", label: "Facebook", Icon: Share2 },
  { key: "socialInstagram", label: "Instagram", Icon: Camera },
  { key: "socialTiktok", label: "TikTok", Icon: Music2 },
  { key: "socialYoutube", label: "YouTube", Icon: PlayCircle },
  { key: "socialX", label: "X (Twitter)", Icon: AtSign },
];

export function OrganizerPublicSocialLinks({
  profile,
}: {
  profile: PublicOrganizerProfile;
}) {
  const items = ROWS.map(({ key, label, Icon }) => {
    const raw = profile[key];
    const href = safeHttpHref(typeof raw === "string" ? raw : null);
    if (!href) return null;
    return { key, label, href, Icon };
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  if (items.length === 0) return null;

  return (
    <section className="jad-card mx-auto max-w-2xl">
      <h2 className="text-sm font-semibold text-fg">โซเชียลมีเดีย</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {items.map(({ key, label, href, Icon }) => (
          <li key={key}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-fg shadow-sm transition-colors hover:border-brand/35 hover:bg-brand-light/40 hover:text-brand-mid"
            >
              <Icon className="size-4 shrink-0 text-brand" strokeWidth={1.75} aria-hidden />
              {label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
