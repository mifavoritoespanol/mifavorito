import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabaseAdmin";
import { electionWindow } from "@/lib/election";

const CATEGORY_SLUG = process.env.ELECTION_CATEGORY_SLUG || "estrellas";

export async function GET() {
  const { opensAt, closesAt } = electionWindow();
  const now = new Date();
  const supabase = createAdminSupabase();

  if (now >= closesAt) {
    const electionKey = `${CATEGORY_SLUG}:${opensAt.toISOString()}`;
    const { error } = await supabase.rpc("finalize_country_election", {
      p_election_key: electionKey,
      p_category_slug: CATEGORY_SLUG,
    });
    if (error) {
      return NextResponse.json({ error: "Country scores are not configured yet." }, { status: 503 });
    }
  }

  const { data, error } = await supabase
    .from("country_election_points")
    .select("country_code, points")
    .order("points", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Country scores are not configured yet." }, { status: 503 });
  }

  const totals = new Map<string, number>();
  for (const row of data ?? []) {
    totals.set(row.country_code, (totals.get(row.country_code) ?? 0) + row.points);
  }
  const countries = [...totals.entries()]
    .map(([countryCode, points]) => ({ countryCode, points }))
    .sort((a, b) => b.points - a.points || a.countryCode.localeCompare(b.countryCode));

  return NextResponse.json({ countries }, { headers: { "Cache-Control": "no-store" } });
}
