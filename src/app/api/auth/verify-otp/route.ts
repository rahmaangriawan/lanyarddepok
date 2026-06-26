import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { otp } = await request.json();

    if (!otp || typeof otp !== "string") {
      return NextResponse.json({ error: "Kode OTP wajib diisi." }, { status: 400 });
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
      return NextResponse.json(
        { error: verifyData.message || "Kode OTP salah atau kedaluwarsa." },
        { status: 401 }
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
