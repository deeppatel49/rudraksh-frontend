import { createBackendApiUrl } from "../../lib/backend-api";
import { badRequest, created, internalServerError } from "../../lib/utils/api-response";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const payload = await request.json();
    const loginMethod = String(payload?.loginMethod || "").trim().toLowerCase();

    if (!payload || (loginMethod !== "google" && loginMethod !== "manual")) {
      return badRequest("A valid login method is required.");
    }

    const forwardedFor = request.headers.get("x-forwarded-for") || "";
    const ipAddress = forwardedFor.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
    const userAgent = request.headers.get("user-agent") || "";

    const response = await fetch(createBackendApiUrl("/customer-auth/login-activity"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        userId: payload.userId,
        loginMethod,
        name: payload.name,
        email: payload.email,
        identifier: payload.identifier,
        phone: payload.phone,
        address: payload.address,
        city: payload.city,
        pincode: payload.pincode,
        imageUrl: payload.imageUrl,
        providerImageUrl: payload.providerImageUrl,
        ipAddress,
        userAgent,
      }),
    });

    const backendPayload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(backendPayload?.error || "Unable to record login activity.");
    }

    const record = backendPayload?.record || {
      userId: payload.userId,
      loginMethod,
      name: payload.name,
      email: payload.email,
      identifier: payload.identifier,
      phone: payload.phone,
      address: payload.address,
      city: payload.city,
      pincode: payload.pincode,
      imageUrl: payload.imageUrl,
      providerImageUrl: payload.providerImageUrl,
      ipAddress,
      userAgent,
    };

    return created({ success: true, record });
  } catch {
    return internalServerError("Unable to record login activity.");
  }
}
