import { NextResponse } from "next/server";
import { getAuthorizedAdminClient } from "@/lib/adminAuth";

export async function GET(request: Request) {
  try {
    const supabase = await getAuthorizedAdminClient(request);
    return NextResponse.json(
      { isAdmin: Boolean(supabase) },
      { status: supabase ? 200 : 401, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("Admin access check failed:", error);
    return NextResponse.json({ isAdmin: false }, { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } });
  }
}
