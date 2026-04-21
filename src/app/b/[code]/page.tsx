import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";

type Props = { params: Promise<{ code: string }> };

export default async function BookingShortLinkPage({ params }: Props) {
  const { code } = await params;

  if (!code || !/^[0-9a-f]{6,48}$/i.test(code)) notFound();

  const booking = await db.booking.findFirst({
    where: { viewToken: { startsWith: code.toLowerCase() } },
    select: { viewToken: true },
  });

  if (!booking) notFound();

  redirect(`/bookings/${booking.viewToken}`);
}
