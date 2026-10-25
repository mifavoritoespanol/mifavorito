import { createClient } from "@supabase/supabase-js";

const testMode = process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_ELECTION_TEST_MODE === "true";
const url = testMode
  ? process.env.NEXT_PUBLIC_SUPABASE_TEST_URL
  : process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = testMode
  ? process.env.NEXT_PUBLIC_SUPABASE_TEST_PUBLISHABLE_KEY
  : process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(testMode
    ? "Local vote testing requires the Supabase test URL and publishable key."
    : "Supabase URL and publishable key are required.");
}

export const supabase = createClient(url, key);
