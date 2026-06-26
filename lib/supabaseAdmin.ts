import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase client using the SERVICE ROLE key.
//
// SECURITY: the service role key bypasses RLS and must NEVER reach the browser.
// This module is only ever imported from server code (route handlers / server
// components). It is intentionally not a "use client" module and reads a
// non-public env var, so bundling it client-side would fail the build.

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  if (!cached) {
    cached = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
