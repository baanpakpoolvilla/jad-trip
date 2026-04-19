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
      const booking = await db.booking.findUnique({ where: { id: bookingId } });
      if (booking?.status === BookingStatus.PENDING_PAYMENT) {
        const updated = await db.booking.update({
          where: { id: bookingId },
          data: {
            status: BookingStatus.CONFIRMED,
            paidAt: new Date(),
          },
        });
        revalidatePath(`/bookings/${updated.viewToken}`);
        revalidatePath(`/trips/${updated.tripId}`);
        revalidatePath(`/organizer/trips/${updated.tripId}`);
        revalidatePath("/trips");
      }
    }
  }

  return NextResponse.json({ received: true });
}
