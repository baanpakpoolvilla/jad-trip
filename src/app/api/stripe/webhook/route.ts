import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { BookingStatus } from "@prisma/client";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Missing webhook secret" }, { status: 500 });
  }

  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;
    if (bookingId) {
      const booking = await db.booking.findUnique({
        where: { id: bookingId },
        include: { trip: true },
      });
      if (booking?.status === BookingStatus.PENDING_PAYMENT) {
        const paidAt = new Date();
        const updated = await db.$transaction(async (tx) => {
          const b = await tx.booking.update({
            where: { id: bookingId },
            data: {
              status: BookingStatus.CONFIRMED,
              paidAt,
            },
          });
          await tx.notification.create({
            data: {
              userId: booking.trip.organizerId,
              kind: "BOOKING_PAID_STRIPE",
              title: "มีผู้จองชำระเงินแล้ว (Stripe)",
              message: `${booking.participantName} ชำระทริป "${booking.trip.title}" เรียบร้อย`,
              href: `/organizer/trips/${booking.tripId}`,
            },
          });
          return b;
        });
        revalidatePath(`/bookings/${updated.viewToken}`);
        revalidatePath(`/trips/${updated.tripId}`);
        revalidatePath(`/organizer/trips/${updated.tripId}`);
        revalidatePath("/organizer");
        revalidatePath("/trips");
        revalidatePath("/organizer/notifications");
        revalidatePath("/organizer", "layout");
      }
    }
  }

  return NextResponse.json({ received: true });
}
