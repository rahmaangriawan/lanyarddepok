import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { comparePassword, signToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, authCookieOptions } from "@/lib/auth-cookie";
import { assertSameOrigin, checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const csrfError = assertSameOrigin(request);
    if (csrfError) return csrfError;

    const ip = getClientIp(request);
    if (!checkRateLimit(`login:${ip}`, 10, 10 * 60 * 1000)) {
      return rateLimitResponse("Terlalu banyak percobaan login. Silakan coba lagi dalam 10 menit.");
    }

    const { email, password, checkOnly } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Compare passwords
    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (checkOnly) {
      return NextResponse.json({ success: true });
    }

    // Create token
    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, authCookieOptions());

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
