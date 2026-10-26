import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client for use in server-side code (API routes, server components).
 * Uses the public anon key but operates server-side.
 * For admin operations (like setting user roles), use the Supabase Dashboard directly.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Check .env.local."
  );
}

/**
 * Create a Supabase client with the user's auth token for server-side operations.
 * This ensures RLS policies are evaluated for the authenticated user.
 */
export function createServerSupabase(authToken = null) {
  const options = {};
  if (authToken) {
    options.global = {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    };
  }
  return createClient(supabaseUrl, supabaseAnonKey, options);
}

/**
 * Create a basic Supabase client for server-side use without user context.
 * Used for public data reads (published content, etc.)
 */
export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey);
