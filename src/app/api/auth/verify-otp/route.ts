import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { assertSameOrigin, checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/security";
import { timingSafeEqual } from "crypto";

function isEmergencyOtpValid(otp: string) {
  const emergencyCode = process.env.AUTH_OTP_BYPASS_CODE?.trim();
  if (!emergencyCode) return false;

  const otpBuffer = Buffer.from(otp.trim());
  const emergencyBuffer = Buffer.from(emergencyCode);

  return (
    otpBuffer.length === emergencyBuffer.length &&
    timingSafeEqual(otpBuffer, emergencyBuffer)
  );
}

export async function POST(request: Request) {
  try {
    const csrfError = assertSameOrigin(request);
    if (csrfError) return csrfError;

    const ip = getClientIp(request);
    if (!checkRateLimit(`verify-otp:${ip}`, 8, 10 * 60 * 1000)) {
      return rateLimitResponse("Terlalu banyak percobaan OTP. Silakan coba lagi dalam 10 menit.");
    }

    const { otp } = await request.json();

    if (!otp || typeof otp !== "string") {
      return NextResponse.json({ error: "Kode OTP wajib diisi." }, { status: 400 });
    }

    if (isEmergencyOtpValid(otp)) {
      console.warn("OTP emergency bypass was used. Remove AUTH_OTP_BYPASS_CODE after fixing OTP settings.");
      return NextResponse.json({ success: true, verified: true });
    }

    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ["otp_verify_url", "otp_api_key", "otp_target"],
        },
      },
    });

    const settingsMap = new Map(settings.map((setting) => [setting.key, setting.value]));
    const verifyUrl = settingsMap.get("otp_verify_url") || "";
    const apiKey = settingsMap.get("otp_api_key") || "";
    const target = settingsMap.get("otp_target") || "";

    if (!verifyUrl || !apiKey || !target) {
      console.error("OTP verification is missing database settings.");
      return NextResponse.json(
        { error: "Konfigurasi OTP belum lengkap di menu keamanan." },
        { status: 500 }
      );
    }

    const verifyRes = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ target, otp }),
      cache: "no-store",
    });

    const verifyData = await verifyRes.json().catch(() => ({}));

    if (!verifyRes.ok || verifyData.verified !== true) {
      return NextResponse.json({ error: "Kode OTP salah atau kedaluwarsa." }, { status: 401 });
    }

    return NextResponse.json({ success: true, verified: true });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json(
      { error: "Gagal memverifikasi OTP. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
