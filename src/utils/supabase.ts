import { createClient } from "@supabase/supabase-js";
import { type AuthUser } from "@/auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a reusable client with anon key
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to get authenticated client using user's token
export function getSupabaseClient(user: AuthUser) {
  if (!user.supabaseAccessToken) {
    throw new Error("No Supabase access token available");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${user.supabaseAccessToken}`,
      },
    },
  });
}
