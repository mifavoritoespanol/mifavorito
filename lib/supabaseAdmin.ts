import { createClient } from "@supabase/supabase-js";
import { electionTestMode } from "@/lib/election";

export function createAdminSupabase() {
  const testMode = electionTestMode();
  const url = testMode
    ? process.env.NEXT_PUBLIC_SUPABASE_TEST_URL
    : process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = testMode
    ? process.env.SUPABASE_TEST_SECRET_KEY
    : process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error(testMode
      ? "Test mode requires NEXT_PUBLIC_SUPABASE_TEST_URL and SUPABASE_TEST_SECRET_KEY."
      : "Supabase server credentials are missing.");
  }
  return createClient(url, key);
}
