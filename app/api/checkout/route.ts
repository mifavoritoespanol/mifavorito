import Stripe from "stripe";
import { createAdminSupabase } from "@/lib/supabaseAdmin";
import { electionTestMode, electionWindow, hasElectionSchedule, isElectionOpen } from "@/lib/election";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function cleanLink(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" ? url.toString().slice(0, 200) : "";
  } catch {
    return "";
  }
}

export async function POST(req: Request) {
  const { itemId, votes: rawVotes, username, message, link, email, withdrawalConsent } = await req.json();
  if (process.env.NODE_ENV === "development") return NextResponse.json({ error: "Los pagos están desactivados en la vista previa local." }, { status: 403 });
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || withdrawalConsent !== true) return NextResponse.json({ error: "Indica un email válido y acepta el inicio inmediato del servicio." }, { status: 400 });
  const consentAt = new Date().toISOString();

  if (electionTestMode() && !process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")) {
    return NextResponse.json({ error: "El modo de prueba requiere una clave Stripe de prueba (sk_test_)." }, { status: 503 });
  }

  const numericItemId = Number(itemId);
  const votes = Number(rawVotes);
  const cents = votes * 100;
  if (
    !Number.isInteger(numericItemId) || numericItemId <= 0 ||
    !Number.isInteger(votes) || votes < 1 || votes > 10000 ||
    typeof username !== "string" || !username.trim()
  ) {
    return NextResponse.json({ error: "Elige entre 1 y 10.000 votos." }, { status: 400 });
  }

  const admin = createAdminSupabase();
  const { data: item } = await admin
    .from("items")
    .select("id, category_id, name, status")
    .eq("id", numericItemId)
    .single();
  if (!item || item.status !== "approved") {
    return NextResponse.json({ error: "No se encontró la opción." }, { status: 404 });
  }

  const { data: category } = await admin
    .from("categories")
    .select("slug")
    .eq("id", item.category_id)
    .single();
  if (!category) return NextResponse.json({ error: "No se encontró la categoría." }, { status: 404 });
  if (!hasElectionSchedule(category.slug)) {
    return NextResponse.json({ error: "Esta categoría todavía no tiene una ventana de votación programada." }, { status: 403 });
  }

  if (!isElectionOpen(new Date(), category.slug)) {
    const { opensAt, closesAt } = electionWindow(category.slug);
    return NextResponse.json({
      error: "La votación de esta categoría está cerrada.",
      opensAt: opensAt.toISOString(),
      closesAt: closesAt.toISOString(),
    }, { status: 403 });
  }

  const cleanMessage = String(message ?? "").trim().slice(0, 100);
  const cleanUrl = cleanLink(link);
  const metadata: Record<string, string> = {
    itemId: String(item.id),
    votes: String(votes),
    username: String(username).trim().slice(0, 30),
    withdrawal_consent: "accepted",
    withdrawal_consent_at: consentAt,
    withdrawal_consent_text_version: "es-v1-2026-10-26",
  };
  if (cleanMessage) metadata.message = cleanMessage;
  if (cleanUrl) metadata.link = cleanUrl;

  const origin = req.headers.get("origin") ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: cents,
        product_data: {
          name: `${votes} ${votes === 1 ? "voto" : "votos"} para ${String(item.name).slice(0, 50)}`,
          description: "1 voto = 1 €",
        },
      },
    }],
    invoice_creation: { enabled: true },
    customer_email: email.trim(),
    metadata,
    payment_intent_data: {
      receipt_email: email.trim(),
      description: `Servicio digital: ${votes} ${votes === 1 ? "voto" : "votos"} para ${String(item.name).slice(0, 50)}. El usuario solicitó el inicio inmediato. El derecho de desistimiento solo se pierde cuando el servicio se haya ejecutado íntegramente.`,
      metadata: { withdrawal_consent: "accepted", withdrawal_consent_at: consentAt, withdrawal_consent_text_version: "es-v1-2026-10-26" },
    },
    success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/`,
  });

  return NextResponse.json({ url: session.url });
}

