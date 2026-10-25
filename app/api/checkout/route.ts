import Stripe from "stripe";
import { NextResponse } from "next/server";
 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
 
function cleanLink(v: unknown) {
  if (typeof v !== "string" || !v.trim()) return "";
  try {
    const u = new URL(v.trim());
    return u.protocol === "https:" ? u.toString().slice(0, 200) : "";
  } catch {
    return "";
  }
}
 
export async function POST(req: Request) {
  const { itemId, itemName, amount, username, message, link } =
    await req.json();
  const cents = Math.round(Number(amount) * 100);
 
  if (!itemId || !username || !(cents >= 100) || cents > 1000000) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
 
  const msg = String(message ?? "").trim().slice(0, 100);
  const url = cleanLink(link);
  const metadata: Record<string, string> = {
    itemId: String(itemId),
    username: String(username).slice(0, 30),
  };
  if (msg) metadata.message = msg;
  if (url) metadata.link = url;
 
  const origin = req.headers.get("origin") ?? "http://localhost:3000";
 
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: cents,
          product_data: {
            name: `Apoyo a ${String(itemName).slice(0, 60)}`,
          },
        },
      },
    ],
    invoice_creation: { enabled: true },
    metadata,
    success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/`,
  });
 
  return NextResponse.json({ url: session.url });
}
 