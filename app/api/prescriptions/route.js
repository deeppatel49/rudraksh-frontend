import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function POST(request) {
  try {
    const formData = await request.formData();

    // Basic validation before proxying
    const customerName = String(formData.get("customerName") || "").trim();
    const mobileNumber = String(formData.get("mobileNumber") || "").replace(/\D/g, "");
    const file = formData.get("prescription");

    if (!customerName || customerName.length < 2) {
      return NextResponse.json({ error: "Customer name is required." }, { status: 400 });
    }
    if (mobileNumber.length < 10 || mobileNumber.length > 15) {
      return NextResponse.json({ error: "Valid mobile number is required." }, { status: 400 });
    }
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Prescription file is required." }, { status: 400 });
    }

    // Proxy the multipart form directly to the backend Express API
    const proxyForm = new FormData();
    proxyForm.set("prescription", file);
    proxyForm.set("customerName", customerName);
    proxyForm.set("mobileNumber", mobileNumber);

    const backendResponse = await fetch(`${BACKEND_URL}/api/v1/prescriptions/upload`, {
      method: "POST",
      body: proxyForm,
    });

    const payload = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: payload?.error || "Unable to upload prescription." },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(payload, { status: 201 });
  } catch (err) {
    console.error("[prescriptions/route] upload error:", err?.message);
    return NextResponse.json(
      { error: "Unable to upload prescription right now." },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mobile = searchParams.get("mobile") || "";
    const limit = searchParams.get("limit") || "20";

    const qs = new URLSearchParams();
    if (mobile) qs.set("mobile", mobile);
    if (limit) qs.set("limit", limit);

    const backendResponse = await fetch(
      `${BACKEND_URL}/api/v1/prescriptions?${qs.toString()}`
    );
    const payload = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: payload?.error || "Unable to fetch prescriptions." },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(payload);
  } catch (err) {
    console.error("[prescriptions/route] list error:", err?.message);
    return NextResponse.json(
      { error: "Unable to fetch prescriptions right now." },
      { status: 500 }
    );
  }
}
