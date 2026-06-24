import { SpreadsheetProduct } from "@/lib/google-sheets";

function normalizeSiteToken(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/[^a-z0-9.-]/g, "");
}

function splitList(value: string) {
  return value
    .split(/[,\n;|]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getCurrentSiteKeys(settings?: Record<string, string>) {
  const rawValues = [
    process.env.PRODUCT_SITE_KEY,
    process.env.NEXT_PUBLIC_PRODUCT_SITE_KEY,
    process.env.NEXT_PUBLIC_SITE_KEY,
    process.env.NEXT_PUBLIC_SITE_URL,
    settings?.google_search_console_site_url,
    settings?.site_title,
  ].filter((value): value is string => Boolean(value));

  const keys = new Set<string>();

  rawValues.forEach((value) => {
    const normalized = normalizeSiteToken(value);
    if (!normalized) return;

    keys.add(normalized);
    keys.add(normalized.replace(/\./g, ""));

    const firstLabel = normalized.split(".")[0];
    if (firstLabel) keys.add(firstLabel);
  });

  return keys;
}

export function isSpreadsheetProductPublished(status: string) {
  const normalized = status.trim().toLowerCase();
  if (!normalized) return true;

  if (["draft", "draf", "unpublish", "unpublished", "hide", "hidden", "false", "0", "no"].includes(normalized)) {
    return false;
  }

  if (["publish", "published", "terbit", "live", "show", "true", "1", "yes"].includes(normalized)) {
    return true;
  }

  return true;
}

export function isSpreadsheetProductVisibleOnSite(sites: string, currentSiteKeys: Set<string>) {
  const normalizedSites = sites.trim();
  if (!normalizedSites) return true;

  const tokens = splitList(normalizedSites).map(normalizeSiteToken).filter(Boolean);
  if (tokens.length === 0) return true;
  if (tokens.some((token) => token === "all" || token === "*" || token === "semua")) return true;

  return tokens.some((token) => currentSiteKeys.has(token) || currentSiteKeys.has(token.replace(/\./g, "")));
}

export function getSpreadsheetProductOrder(product: Pick<SpreadsheetProduct, "order">) {
  const parsed = Number.parseInt(product.order, 10);
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}
