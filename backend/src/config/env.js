import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  backendUrl: String(process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/+$/, ""),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  authSessionHours: Number(process.env.AUTH_SESSION_HOURS || 24),
};

export function validateEnv() {
  const missing = [];

  if (!env.supabaseUrl) {
    missing.push("SUPABASE_URL");
  }

  if (!env.supabaseServiceRoleKey) {
    missing.push("SUPABASE_SERVICE_ROLE_KEY");
  }

  return {
    ok: missing.length === 0,
    missing,
  };
}
