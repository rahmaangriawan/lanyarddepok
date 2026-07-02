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

function parseBooleanish(value: unknown) {
  if (value === true) return true;
  if (typeof value === "number") return value === 1;
  if (typeof value !== "string") return false;

  return ["1", "true", "valid", "verified", "success", "ok"].includes(
    value.trim().toLowerCase(),
  );
}

function isWorkerVerified(data: Record<string, unknown>) {
  return (
    parseBooleanish(data.verified) ||
    parseBooleanish(data.valid) ||
    parseBooleanish(data.success) ||
    parseBooleanish(data.ok) ||
    parseBooleanish(data.status) ||
    parseBooleanish(data.result)
  );
}

function getWorkerMessage(data: Record<string, unknown>, fallback: string) {
  const message =
    data.message ||
    data.error ||
    data.reason ||
    data.detail ||
    data.statusText;

  return typeof message === "string" && message.trim()
    ? message
    : fallback;
}

async function parseWorkerResponse(response: Response) {
  const text = await response.text();
  if (!text) return {};

  try {
    const data = JSON.parse(text);
    return data && typeof data === "object" ? data : {};
  } catch {
    return { message: text };
  }
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

    const cleanOtp = otp.trim();

    if (isEmergencyOtpValid(cleanOtp)) {
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
    const verifyUrl = (settingsMap.get("otp_verify_url") || "").trim();
    const apiKey = (settingsMap.get("otp_api_key") || "").trim();
    const target = (settingsMap.get("otp_target") || "").trim();

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
      body: JSON.stringify({ target, otp: cleanOtp }),
      cache: "no-store",
    });

    const verifyData = await parseWorkerResponse(verifyRes);
    const workerMessage = getWorkerMessage(
      verifyData,
      "Kode OTP salah atau kedaluwarsa.",
    );

    if (!verifyRes.ok || !isWorkerVerified(verifyData)) {
      console.warn("OTP verification rejected by worker.", {
        status: verifyRes.status,
        responseKeys: Object.keys(verifyData),
        targetConfigured: Boolean(target),
      });

      return NextResponse.json(
        { error: workerMessage, message: workerMessage },
        { status: 401 },
      );
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
