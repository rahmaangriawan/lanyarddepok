import { NextResponse } from "next/server";
import { getCachedSiteChromeSettings } from "@/lib/settings-cache";

export async function GET() {
  try {
    const settings = await getCachedSiteChromeSettings();
    const enabled = settings.turnstileEnabled;
    const siteKey = settings.turnstileSiteKey;

    return NextResponse.json({
      enabled: enabled && Boolean(siteKey),
      siteKey: enabled ? siteKey : "",
    });
  } catch (error) {
    console.error("Fetch Turnstile Config Error:", error);
    return NextResponse.json({ enabled: false, siteKey: "" });
  }
}
