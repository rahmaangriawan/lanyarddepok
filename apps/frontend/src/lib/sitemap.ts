import { absoluteUrl, resolveSiteUrl } from './seo';
import type { SitemapItem } from './api';

export type SitemapEntry = {
  loc: string;
  lastmod?: string;
};

export const staticRoutes = [
  '/',
  '/tentang',
  '/produk',
  '/promo',
  '/cara-pemesanan',
  '/faq',
  '/blog',
  '/kontak',
  '/pembayaran',
  '/pengiriman',
  '/syarat-ketentuan',
  '/kebijakan',
];

const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, (character) => ({
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  "'": '&apos;',
  '"': '&quot;',
}[character] || character));

const lastModified = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

export function contentEntries(path: string, items: SitemapItem[], siteUrl = resolveSiteUrl()): SitemapEntry[] {
  return items.map((item) => ({
    loc: absoluteUrl(`${path}/${encodeURIComponent(item.slug)}`, siteUrl),
    lastmod: lastModified(item.updatedAt),
  }));
}

export function dedupeEntries(entries: SitemapEntry[]): SitemapEntry[] {
  const urls = new Map<string, SitemapEntry>();

  for (const entry of entries) {
    if (!urls.has(entry.loc)) urls.set(entry.loc, entry);
  }

  return [...urls.values()];
}

export function urlsetResponse(entries: SitemapEntry[]): Response {
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${dedupeEntries(entries)
    .map((entry) => `  <url><loc>${escapeXml(entry.loc)}</loc>${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}</url>`)
    .join('\n')}\n</urlset>\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'no-cache, must-revalidate',
    },
  });
}

export function sitemapIndexResponse(paths: string[], siteUrl = resolveSiteUrl()): Response {
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths
    .map((path) => `  <sitemap><loc>${escapeXml(absoluteUrl(path, siteUrl))}</loc></sitemap>`)
    .join('\n')}\n</sitemapindex>\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'no-cache, must-revalidate',
    },
  });
}
