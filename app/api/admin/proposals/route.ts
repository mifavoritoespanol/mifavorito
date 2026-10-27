import { NextResponse } from "next/server";
import { getAuthorizedAdminClient } from "@/lib/adminAuth";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

export async function GET(request: Request) {
  try {
    const supabase = await getAuthorizedAdminClient(request);
    if (!supabase) return NextResponse.json({ error: "Acceso no autorizado." }, { status: 401, headers: NO_STORE });

    const { data, error } = await supabase.from("items").select("*")
      .eq("status", "pending").order("created_at", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ proposals: data ?? [] }, { headers: NO_STORE });
  } catch (error) {
    console.error("Admin proposals GET failed:", error);
    return NextResponse.json({ error: "No se pudieron cargar las propuestas." }, { status: 500, headers: NO_STORE });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await getAuthorizedAdminClient(request);
    if (!supabase) return NextResponse.json({ error: "Acceso no autorizado." }, { status: 401, headers: NO_STORE });

    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || !("id" in body) || !("status" in body)) {
      return NextResponse.json({ error: "Solicitud no válida." }, { status: 400, headers: NO_STORE });
    }
    const { id, status } = body as { id: unknown; status: unknown };
    if (typeof id !== "string" || !id.trim() || (status !== "approved" && status !== "rejected")) {
      return NextResponse.json({ error: "Solicitud no válida." }, { status: 400, headers: NO_STORE });
    }

    const { data, error } = await supabase.from("items").update({ status })
      .eq("id", id).eq("status", "pending").select("id,status").maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "La propuesta ya fue tratada o no existe." }, { status: 409, headers: NO_STORE });
    return NextResponse.json({ proposal: data }, { headers: NO_STORE });
  } catch (error) {
    console.error("Admin proposals PATCH failed:", error);
    return NextResponse.json({ error: "No se pudo actualizar la propuesta." }, { status: 500, headers: NO_STORE });
  }
}
