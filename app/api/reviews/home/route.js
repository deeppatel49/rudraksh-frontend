import { createBackendApiUrl } from "../../../lib/backend-api";
import { getHomeReviews as getLegacyHomeReviews } from "../../../lib/services/review-service";
import { badRequest, internalServerError, ok } from "../../../lib/utils/api-response";

export const dynamic = "force-dynamic";

let hasAttemptedLegacySeed = false;

async function fetchBackendHomeReviews() {
  const response = await fetch(createBackendApiUrl("/reviews/home"), {
    cache: "no-store",
  });

  const payload = await response.json();
  return { response, payload };
}

async function seedLegacyHomeReviewsIfNeeded() {
  if (hasAttemptedLegacySeed) {
    return;
  }

  hasAttemptedLegacySeed = true;

  const { response, payload } = await fetchBackendHomeReviews();
  if (!response.ok) {
    return;
  }

  if (Array.isArray(payload?.reviews) && payload.reviews.length > 0) {
    return;
  }

  const legacyPayload = await getLegacyHomeReviews();
  const legacyReviews = Array.isArray(legacyPayload?.reviews) ? legacyPayload.reviews : [];

  for (const review of legacyReviews) {
    const name = String(review?.name || "").trim();
    const message = String(review?.message || "").trim();
    const rating = Number(review?.rating);

    if (!name || !message || !Number.isInteger(rating)) {
      continue;
    }

    await fetch(createBackendApiUrl("/reviews/home"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        rating,
        message,
      }),
    });
  }
}

function validatePayload(payload) {
  const name = String(payload?.name || "").trim();
  const message = String(payload?.message || "").trim();
  const rating = Number(payload?.rating);

  if (!name || name.length < 2) {
    return "Name must be at least 2 characters.";
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return "Rating must be between 1 and 5.";
  }

  if (!message || message.length < 10) {
    return "Review message must be at least 10 characters.";
  }

  if (message.length > 1000) {
    return "Review message is too long.";
  }

  return null;
}

export async function GET() {
  try {
    await seedLegacyHomeReviewsIfNeeded();
    const { response, payload } = await fetchBackendHomeReviews();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: payload?.error || "Unable to load customer reviews." }), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }

    return ok(payload, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return internalServerError("Unable to load customer reviews.");
  }
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return badRequest("Invalid request payload.");
  }

  const validationError = validatePayload(payload);
  if (validationError) {
    return badRequest(validationError);
  }

  try {
    const response = await fetch(createBackendApiUrl("/reviews/home"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: String(payload.name).trim(),
        rating: Number(payload.rating),
        message: String(payload.message).trim(),
      }),
    });

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return internalServerError("Unable to submit review right now.");
  }
}
