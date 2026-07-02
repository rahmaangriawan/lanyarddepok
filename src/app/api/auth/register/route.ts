import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, authCookieOptions } from "@/lib/auth-cookie";
import { assertSameOrigin, checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/security";

export async function POST(request: Request) {
  try {
    if (process.env.AUTH_PUBLIC_REGISTER_ENABLED !== "true") {
      return NextResponse.json(
        { error: "Registration is disabled" },
        { status: 403 }
      );
    }

    const csrfError = assertSameOrigin(request);
    if (csrfError) return csrfError;

    const ip = getClientIp(request);
    if (!checkRateLimit(`register:${ip}`, 5, 10 * 60 * 1000)) {
      return rateLimitResponse("Terlalu banyak percobaan registrasi. Silakan coba lagi dalam 10 menit.");
    }

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Email format is invalid" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "USER",
      },
    });

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
    console.error("Register Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
