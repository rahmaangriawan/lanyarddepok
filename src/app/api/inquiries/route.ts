import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// Rate limiting in-memory storage
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
const MAX_REQUESTS = 3;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];

  // Filter out timestamps older than 5 minutes
  const validTimestamps = timestamps.filter((time) => now - time < RATE_LIMIT_WINDOW);

  if (validTimestamps.length >= MAX_REQUESTS) {
    return false;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return true;
}

// GET: Fetch all inquiries (Admin only)
export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, inquiries });
  } catch (error: any) {
    console.error("Fetch Inquiries Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pesan masuk." },
      { status: 500 }
    );
  }
}

// POST: Submit a new inquiry with validation and rate limiting
export async function POST(request: Request) {
  try {
    // 1. Parse request body
    const body = await request.json();
    const { name, email, phone, message } = body || {};

    // 2. Validation Checks
    if (!name || typeof name !== "string" || name.trim().length < 3) {
      return NextResponse.json(
        { error: "Nama lengkap wajib diisi (minimal 3 karakter)." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { error: "Format email tidak valid (contoh: nama@email.com)." },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "Nomor telepon / WhatsApp wajib diisi." },
        { status: 400 }
      );
    } else {
      const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, "");
      if (!/^\d+$/.test(cleanPhone)) {
        return NextResponse.json(
          { error: "Nomor telepon hanya boleh berisi angka dan karakter +, -, ()." },
          { status: 400 }
        );
      }
      if (cleanPhone.length < 8 || cleanPhone.length > 15) {
        return NextResponse.json(
          { error: "Nomor telepon harus berkisar antara 8 hingga 15 digit." },
          { status: 400 }
        );
      }
    }

    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json(
        { error: "Pesan Anda wajib diisi (minimal 10 karakter)." },
        { status: 400 }
      );
    }

    // 3. Rate Limiting Check (Only for valid submissions)
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "127.0.0.1";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Terlalu banyak mengirim pesan. Silakan coba lagi dalam 5 menit." },
        { status: 429 }
      );
    }

    // 4. Save to Database
    const inquiry = await prisma.inquiry.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        message: message.trim(),
      },
    });

    return NextResponse.json({ success: true, inquiry });
  } catch (error: any) {
    console.error("Create Inquiry Error:", error);
    return NextResponse.json(
      { error: "Gagal memproses pesan Anda. Silakan coba lagi." },
      { status: 500 }
    );
  }
}

