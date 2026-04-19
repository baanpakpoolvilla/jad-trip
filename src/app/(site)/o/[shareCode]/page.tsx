import { notFound, redirect } from "next/navigation";
import { getOrganizerIdByBrochureShareCode, organizerTripsBrochurePath } from "@/lib/trips-public";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ shareCode: string }> };

export default async function ShortOrganizerBrochurePage({ params }: Props) {
  const { shareCode } = await params;
  const organizerId = await getOrganizerIdByBrochureShareCode(shareCode);
  if (!organizerId) notFound();
  redirect(organizerTripsBrochurePath(organizerId));
}
