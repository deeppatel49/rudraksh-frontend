import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function PUT(request) {
  try {
    const body = await request.json();

    const backendResponse = await fetch(`${BACKEND_URL}/api/v1/prescriptions/processing`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const payload = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: payload?.error || "Unable to update processing preferences." },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(payload);
  } catch (err) {
    console.error("[prescriptions/processing] error:", err?.message);
    return NextResponse.json(
      { error: "Unable to update processing preferences right now." },
      { status: 500 }
    );
  }
}
