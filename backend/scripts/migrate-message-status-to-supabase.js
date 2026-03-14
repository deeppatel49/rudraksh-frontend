import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MESSAGE_STATUS_PATH = path.join(__dirname, "..", "data", "message-status.json");

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

function normalizeStatus(status) {
  return String(status || "").trim() === "read" ? "read" : "not-read";
}

async function main() {
  const raw = await readFile(MESSAGE_STATUS_PATH, "utf8");
  const parsed = JSON.parse(raw);
  const entries = Object.entries(parsed?.messages || {});

  if (!entries.length) {
    console.log("No message statuses found in legacy JSON file.");
    return;
  }

  const rows = entries.map(([messageId, status]) => ({
    message_id: String(messageId || "").trim(),
    status: normalizeStatus(status),
    source: "contact_submissions",
    metadata: {},
    updated_at: new Date().toISOString(),
  })).filter((item) => item.message_id);

  const { error, data } = await supabase
    .from("message_statuses")
    .upsert(rows, { onConflict: "message_id" })
    .select("message_id");

  if (error) {
    console.error("Migration failed:", error.message || error);
    process.exit(1);
  }

  console.log(`Migrated ${Array.isArray(data) ? data.length : 0} message status records to Supabase.`);
}

main().catch((error) => {
  console.error("Migration failed:", error?.message || error);
  process.exit(1);
});
