import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, authCookieOptions } from "@/lib/auth-cookie";
import { assertSameOrigin } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const csrfError = assertSameOrigin(request);
    if (csrfError) return csrfError;

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, "", authCookieOptions(0));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}
