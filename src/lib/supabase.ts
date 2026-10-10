import { createClient, type SupabaseClient, type User as SbUser } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://vvewwqvgumeaddeollro.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2ZXd3cXZndW1lYWRkZW9sbHJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MTAyNzksImV4cCI6MjEwNzE4NjI3OX0.cwg7EjxH5K2o7vsrZkn0-EjlSzpEPkZnEjZ0NH3pJpw";

let client: SupabaseClient | null = null;

export function isCloudConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function getSB(): SupabaseClient | null {
  if (!isCloudConfigured()) return null;
  if (!client) client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}

export type { SbUser };
