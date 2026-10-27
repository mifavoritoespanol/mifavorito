import "server-only";

import { createAdminSupabase } from "@/lib/supabaseAdmin";

export async function getAuthorizedAdminClient(request: Request) {
  const allowedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const accessToken = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!allowedEmail || !accessToken) return null;

  const supabase = createAdminSupabase();
  const { data, error } = await supabase.auth.getUser(accessToken);
  const email = data.user?.email?.trim().toLowerCase();
  if (error || !email || email !== allowedEmail) return null;
  return supabase;
}
