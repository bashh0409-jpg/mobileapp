import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "YOUR_ANON_KEY";

if (!SUPABASE_URL || SUPABASE_URL.includes("YOUR_PROJECT")) {
  console.warn(
    "[Supabase] Missing EXPO_PUBLIC_SUPABASE_URL. Copy .env.example to .env and fill in your values.",
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
