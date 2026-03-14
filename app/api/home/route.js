import { getHomePageContent } from "../../lib/services/home-service";
import { internalServerError, ok } from "../../lib/utils/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await getHomePageContent();
    return ok(payload, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return internalServerError("Unable to load home page content.");
  }
}
