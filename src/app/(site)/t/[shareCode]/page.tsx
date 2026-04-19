import { notFound, redirect } from "next/navigation";
import { getPublishedTripIdByShareCode } from "@/lib/trips-public";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ shareCode: string }> };

export default async function ShortTripLinkPage({ params }: Props) {
  const { shareCode } = await params;
  const tripId = await getPublishedTripIdByShareCode(shareCode);
  if (!tripId) notFound();
  redirect(`/trips/${tripId}`);
}
