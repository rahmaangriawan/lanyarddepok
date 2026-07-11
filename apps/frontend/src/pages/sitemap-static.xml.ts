import type { APIRoute } from 'astro';
import { absoluteUrl, resolveSiteUrl } from '../lib/seo';
import { staticRoutes, urlsetResponse } from '../lib/sitemap';

export const GET: APIRoute = () => {
  const siteUrl = resolveSiteUrl();
  return urlsetResponse(staticRoutes.map((route) => ({ loc: absoluteUrl(route, siteUrl) })));
};
