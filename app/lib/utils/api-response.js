import { NextResponse } from "next/server";

export function ok(data, init = {}) {
  return NextResponse.json(data, { status: 200, ...init });
}

export function created(data, init = {}) {
  return NextResponse.json(data, { status: 201, ...init });
}

export function badRequest(message, details) {
  return NextResponse.json(
    {
      error: message,
      ...(details ? { details } : {}),
    },
    { status: 400 }
  );
}

export function internalServerError(message = "Something went wrong.") {
  return NextResponse.json({ error: message }, { status: 500 });
}
