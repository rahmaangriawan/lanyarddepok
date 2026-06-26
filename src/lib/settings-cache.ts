import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { shouldSkipDbDuringBuild } from "@/lib/build-env";

export const SETTINGS_CACHE_TAG = "settings";

export async function getSettingsMap(keys?: string[]) {
  if (shouldSkipDbDuringBuild()) {
    return {};
  }

  const settings = await prisma.setting.findMany({
    where: keys ? { key: { in: keys } } : undefined,
    select: { key: true, value: true },
  });

  return Object.fromEntries(settings.map((setting) => [setting.key, setting.value])) as Record<string, string>;
}

export const getCachedSettingsMap = unstable_cache(
  async (keys?: string[]) => getSettingsMap(keys),
  ["settings-map"],
  { revalidate: 300, tags: [SETTINGS_CACHE_TAG] }
);

export async function getCachedSiteChromeSettings() {
  const settings = await getCachedSettingsMap([
    "bing_site_verification",
    "seo_meta_title",
    "seo_meta_description",
    "site_title",
    "google_analytics_measurement_id",
    "contact_whatsapp",
    "turnstile_homepage_enabled",
    "turnstile_site_key",
  ]);

  return {
    bingVerification: settings.bing_site_verification || "",
    siteName: settings.site_title || "Lanyard Jakarta",
    siteTitle:
      settings.seo_meta_title ||
      "Lanyard Jakarta | Custom Premium Lanyard Printing",
    siteDescription:
      settings.seo_meta_description ||
      "Cetak lanyard premium cepat & murah di Jakarta. Layanan 1 hari jadi dengan kualitas cetak tajam, warna cerah, dan bahan awet untuk kebutuhan kantor, event, atau promosi Anda.",
    measurementId: settings.google_analytics_measurement_id || "",
    whatsappNumber: settings.contact_whatsapp || "6282210200700",
    turnstileEnabled: settings.turnstile_homepage_enabled === "true",
    turnstileSiteKey: settings.turnstile_site_key || "",
  };
}
