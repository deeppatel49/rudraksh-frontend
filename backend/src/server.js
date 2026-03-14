import app from "./app.js";
import { env, validateEnv } from "./config/env.js";

const envState = validateEnv();
if (!envState.ok) {
  console.warn("[backend] Missing env vars:", envState.missing.join(", "));
  console.warn("[backend] API will not work until Supabase credentials are configured.");
}

const server = app.listen(env.port, () => {
  console.log(`[backend] running on http://localhost:${env.port}`);
});

process.on("unhandledRejection", (error) => {
  console.error("[backend] unhandled rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("[backend] uncaught exception:", error);
  server.close(() => process.exit(1));
});
