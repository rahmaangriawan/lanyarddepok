import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { getJwtSecret } from "@/lib/jwt-secret";

async function verifyAdminToken(token: string) {
  try {
    const JWT_SECRET = getJwtSecret();
    const key = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload.role === "ADMIN";
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAdmin = token ? await verifyAdminToken(token) : false;

  if (!isAdmin) {
    const loginUrl = new URL("/login/blackout", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/kawruh/:path*"],
};
