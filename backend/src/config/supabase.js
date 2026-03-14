import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

let client = null;

export function getSupabaseClient() {
  if (client) {
    return client;
  }

  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    return null;
  }

  client = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return client;
}
