import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { COUNTRIES } from "@/lib/countries";
import { getAuthorizedAdminClient } from "@/lib/adminAuth";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

function wikipediaUrl(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || !(url.hostname === "wikipedia.org" || url.hostname.endsWith(".wikipedia.org")) || !url.pathname.startsWith("/wiki/")) return null;
    url.hash = "";
    url.search = "";
    return url.toString();
  } catch {
    return null;
  }
}

function slugify(value: string) {
  const base = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 48) || "opcion";
  return `${base}-${randomUUID().slice(0, 8)}`;
}

export async function GET(request: Request) {
  try {
    const supabase = await getAuthorizedAdminClient(request);
    if (!supabase) return NextResponse.json({ error: "Acceso no autorizado." }, { status: 401, headers: NO_STORE });

    const [categoriesResult, itemsResult] = await Promise.all([
      supabase.from("categories").select("id,slug,name,emoji,sort").order("sort", { ascending: true }).order("id", { ascending: true }),
      supabase.from("items").select("*").order("category_id", { ascending: true }).order("name", { ascending: true }),
    ]);
    if (categoriesResult.error) throw categoriesResult.error;
    if (itemsResult.error) throw itemsResult.error;

    return NextResponse.json({
      categories: categoriesResult.data ?? [],
      items: itemsResult.data ?? [],
    }, { headers: NO_STORE });
  } catch (error) {
    console.error("Admin manage GET failed:", error);
    return NextResponse.json({ error: "No se pudieron cargar las categorías." }, { status: 500, headers: NO_STORE });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getAuthorizedAdminClient(request);
    if (!supabase) return NextResponse.json({ error: "Acceso no autorizado." }, { status: 401, headers: NO_STORE });

    const body: unknown = await request.json();
    if (!body || typeof body !== "object") return NextResponse.json({ error: "Solicitud no válida." }, { status: 400, headers: NO_STORE });
    const input = body as Record<string, unknown>;
    const categoryId = Number(input.categoryId);
    const name = typeof input.name === "string" ? input.name.trim() : "";
    const countryCode = typeof input.countryCode === "string" ? input.countryCode.trim().toUpperCase() : "";
    const normalizedWikipediaUrl = wikipediaUrl(input.wikipediaUrl);
    const description = typeof input.description === "string" ? input.description.trim().slice(0, 80) : "";

    if (!Number.isSafeInteger(categoryId) || categoryId < 1 || !name || name.length > 60 ||
        !COUNTRIES.some((country) => country.code === countryCode) || !normalizedWikipediaUrl) {
      return NextResponse.json({ error: "Indica nombre, país y un enlace válido de Wikipedia." }, { status: 400, headers: NO_STORE });
    }

    const { data: category, error: categoryError } = await supabase.from("categories")
      .select("id").eq("id", categoryId).maybeSingle();
    if (categoryError) throw categoryError;
    if (!category) return NextResponse.json({ error: "La categoría no existe." }, { status: 404, headers: NO_STORE });

    const { data, error } = await supabase.from("items").insert({
      category_id: categoryId,
      country_code: countryCode,
      name,
      slug: slugify(name),
      description: description || null,
      wikipedia_url: normalizedWikipediaUrl,
      status: "approved",
    }).select("*").single();

    if (error?.code === "23505") {
      return NextResponse.json({ error: "Ya existe una opción con ese enlace de Wikipedia." }, { status: 409, headers: NO_STORE });
    }
    if (error) throw error;
    return NextResponse.json({ item: data }, { status: 201, headers: NO_STORE });
  } catch (error) {
    console.error("Admin manage POST failed:", error);
    return NextResponse.json({ error: "No se pudo añadir la opción." }, { status: 500, headers: NO_STORE });
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
    const itemId = Number(id);
    if (!Number.isSafeInteger(itemId) || itemId < 1 || (status !== "approved" && status !== "rejected")) {
      return NextResponse.json({ error: "Solicitud no válida." }, { status: 400, headers: NO_STORE });
    }

    const { data, error } = await supabase.from("items").update({ status })
      .eq("id", itemId).select("*").maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "La opción no existe." }, { status: 404, headers: NO_STORE });
    return NextResponse.json({ item: data }, { headers: NO_STORE });
  } catch (error) {
    console.error("Admin manage PATCH failed:", error);
    return NextResponse.json({ error: "No se pudo actualizar la opción." }, { status: 500, headers: NO_STORE });
  }
}
