import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ["turnstile_homepage_enabled", "turnstile_site_key"],
        },
      },
    });

    const map = new Map(settings.map((setting) => [setting.key, setting.value]));
    const enabled = map.get("turnstile_homepage_enabled") === "true";
    const siteKey = map.get("turnstile_site_key") || "";

    return NextResponse.json({
      enabled: enabled && Boolean(siteKey),
      siteKey: enabled ? siteKey : "",
    });
  } catch (error) {
    console.error("Fetch Turnstile Config Error:", error);
    return NextResponse.json({ enabled: false, siteKey: "" });
  }
}
