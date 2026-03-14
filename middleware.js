import { NextResponse } from "next/server";

function isProtectedMedicinesPath(pathname) {
  return (
    pathname === "/products" ||
    pathname.startsWith("/products/") ||
    pathname === "/medicine" ||
    pathname.startsWith("/medicine/")
  );
}

export function middleware(request) {
  const { pathname, search } = request.nextUrl;

  if (!isProtectedMedicinesPath(pathname)) {
    return NextResponse.next();
  }

  const authCookie = String(request.cookies.get("rudraksh_auth_user_id")?.value || "").trim();
  if (authCookie) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  loginUrl.searchParams.set("forceNext", "1");
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/products/:path*", "/medicine/:path*"],
};
