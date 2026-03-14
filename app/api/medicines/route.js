import { getMedicinesCatalog } from "../../lib/services/product-service";
import { internalServerError, ok } from "../../lib/utils/api-response";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("cat") || "All";
    const query = searchParams.get("q") || "";
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "50");

    const payload = await getMedicinesCatalog({ category, query, page, limit });

    return ok(payload, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return internalServerError("Unable to load medicines catalog.");
  }
}
