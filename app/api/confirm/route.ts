import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);
 
export async function POST(req: Request) {
  const { sessionId } = await req.json();
  if (!sessionId) return NextResponse.json({ ok: false }, { status: 400 });
 
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return NextResponse.json({ ok: false }, { status: 402 });
  }
 
  const { error } = await admin.from("contributions").insert({
    item_id: Number(session.metadata?.itemId),
    username: session.metadata?.username ?? "anónimo",
    amount_cents: session.amount_total ?? 0,
    stripe_session_id: session.id,
    message: session.metadata?.message || null,
    link_url: session.metadata?.link || null,
  });
 
  if (error && error.code !== "23505") {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}