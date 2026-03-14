import { NextResponse } from "next/server";
import { verifyOtpChallenge } from "../../../../lib/otp-store";

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const identifier = String(payload?.identifier || "").trim();
  const otp = String(payload?.otp || "").trim();

  if (!identifier || !otp) {
    return NextResponse.json(
      { error: "Identifier and OTP are required." },
      { status: 400 }
    );
  }

  const result = verifyOtpChallenge({ identifier }, otp);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: "OTP verified successfully.",
    resetToken: result.resetToken,
  });
}
