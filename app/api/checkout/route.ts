import Stripe from "stripe";
import { NextResponse } from "next/server";
 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
 
export async function POST(req: Request) {
  const { itemId, itemName, amount, username } = await req.json();
  const cents = Math.round(Number(amount) * 100);
 
  if (!itemId || !username || !(cents >= 100) || cents > 1000000) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
 
  const origin = req.headers.get("origin") ?? "http://localhost:3000";
 
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: cents,
          product_data: { name: `Apoyo a ${itemName}` },
        },
      },
    ],
    invoice_creation: { enabled: true },
    metadata: {
      itemId: String(itemId),
      username: String(username).slice(0, 30),
    },
    success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/`,
  });
 
  return NextResponse.json({ url: session.url });
}
 