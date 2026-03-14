import { NextResponse } from "next/server";
import { createPrescriptionShareToken } from "../../../lib/prescription-share";

function getSellerWebsiteUrl() {
  const value = String(process.env.SELLER_WEBSITE_URL || "").trim();
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) {
      return "";
    }
    return url.toString();
  } catch {
    return "";
  }
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const files = Array.isArray(payload?.files) ? payload.files : [];
  if (!files.length) {
    return NextResponse.json({ error: "No prescriptions provided." }, { status: 400 });
  }

  const sellerUrl = getSellerWebsiteUrl();
  if (!sellerUrl) {
    return NextResponse.json(
      { error: "SELLER_WEBSITE_URL is not configured." },
      { status: 500 }
    );
  }

  try {
    const shareToken = createPrescriptionShareToken({
      files,
      source: "quick-order",
    });

    const redirectUrl = new URL(sellerUrl);
    redirectUrl.searchParams.set("shareToken", shareToken);

    return NextResponse.json({
      success: true,
      redirectUrl: redirectUrl.toString(),
      expiresInSeconds: 15 * 60,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Unable to create share link." },
      { status: 500 }
    );
  }
}
