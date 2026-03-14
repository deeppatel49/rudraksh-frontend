import { NextResponse } from "next/server";
import { createBackendApiUrl } from "../../../lib/backend-api";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const resolvedParams = await params;
  const productId = resolvedParams?.productId;

  if (!productId) {
    return NextResponse.json({ error: "Missing product id." }, { status: 400 });
  }

  try {
    const response = await fetch(createBackendApiUrl(`/reviews/${productId}`), {
      cache: "no-store",
    });
    const payload = await response.json();

    return NextResponse.json(payload, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to load reviews right now." }, { status: 500 });
  }
}

function validatePayload(payload) {
  const reviewerName = String(payload?.reviewerName || "").trim();
  const title = String(payload?.title || "").trim();
  const description = String(payload?.description || "").trim();
  const rating = Number(payload?.rating);
  const imageDataUrl = String(payload?.imageDataUrl || "").trim();

  if (!reviewerName || reviewerName.length < 2) {
    return "Reviewer name must be at least 2 characters.";
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return "Rating must be between 1 and 5.";
  }

  if (!title || title.length < 4) {
    return "Review title must be at least 4 characters.";
  }

  if (!description || description.length < 10) {
    return "Review description must be at least 10 characters.";
  }

  if (imageDataUrl) {
    if (!imageDataUrl.startsWith("data:image/")) {
      return "Uploaded file must be an image.";
    }

    if (imageDataUrl.length > 1_200_000) {
      return "Image size is too large. Please upload a smaller image.";
    }
  }

  return null;
}

export async function POST(request, { params }) {
  const resolvedParams = await params;
  const productId = resolvedParams?.productId;

  if (!productId) {
    return NextResponse.json({ error: "Missing product id." }, { status: 400 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const validationError = validatePayload(payload);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const response = await fetch(createBackendApiUrl(`/reviews/${productId}`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    return NextResponse.json(result, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to submit review right now." }, { status: 500 });
  }
}
