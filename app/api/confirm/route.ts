import Stripe from "stripe";
import { createAdminSupabase } from "@/lib/supabaseAdmin";
import { electionTestMode } from "@/lib/election";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  if (electionTestMode() && !process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")) {
    return NextResponse.json({ ok: false, error: "La prueba exige una clave Stripe de prueba." }, { status: 503 });
  }
  const { sessionId } = await req.json();
  if (!sessionId) return NextResponse.json({ ok: false }, { status: 400 });

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return NextResponse.json({ ok: false }, { status: 402 });
  }

  const admin = createAdminSupabase();
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
