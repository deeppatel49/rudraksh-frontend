import { NextResponse } from "next/server";
import { verifyPrescriptionShareToken } from "../../../../lib/prescription-share";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = String(searchParams.get("token") || "").trim();

  if (!token) {
    return NextResponse.json({ error: "Missing share token." }, { status: 400 });
  }

  try {
    const verification = verifyPrescriptionShareToken(token);
    if (!verification.ok) {
      return NextResponse.json({ error: verification.error }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      sharedAt: verification.payload.issuedAt,
      expiresAt: verification.payload.expiresAt,
      files: Array.isArray(verification.payload.files) ? verification.payload.files : [],
      source: verification.payload.source || "quick-order",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Unable to resolve share token." },
      { status: 500 }
    );
  }
}
