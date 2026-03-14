import { getAboutPageContent } from "../../lib/services/about-service";
import { internalServerError, ok } from "../../lib/utils/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await getAboutPageContent();
    return ok(payload, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return internalServerError("Unable to load about page content.");
  }
}
